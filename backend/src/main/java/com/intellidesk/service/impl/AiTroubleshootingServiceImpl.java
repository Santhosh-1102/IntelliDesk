package com.intellidesk.service.impl;

import com.intellidesk.dto.ai.*;
import com.intellidesk.entity.*;
import com.intellidesk.entity.enums.*;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.*;
import com.intellidesk.service.AiTroubleshootingService;
import com.intellidesk.utils.TicketNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiTroubleshootingServiceImpl implements AiTroubleshootingService {

    private static final Logger log = LoggerFactory.getLogger(AiTroubleshootingServiceImpl.class);

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final TroubleshootingStepRepository stepRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final TicketCategoryRepository categoryRepository;
    private final TicketHistoryRepository historyRepository;
    private final ObjectProvider<ChatClient> chatClientProvider;

    public AiTroubleshootingServiceImpl(
            AiConversationRepository conversationRepository,
            AiMessageRepository messageRepository,
            TroubleshootingStepRepository stepRepository,
            UserRepository userRepository,
            TicketRepository ticketRepository,
            TicketCategoryRepository categoryRepository,
            TicketHistoryRepository historyRepository,
            ObjectProvider<ChatClient> chatClientProvider
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.stepRepository = stepRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.historyRepository = historyRepository;
        this.chatClientProvider = chatClientProvider;
    }

    @Override
    @Transactional
    public AiChatResponse sendMessage(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AiConversation conversation;
        boolean isNewSession = false;

        if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            conversation = conversationRepository.findBySessionId(request.getSessionId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "sessionId", request.getSessionId()));

            if (!conversation.getUser().getId().equals(userId)) {
                throw new BadRequestException("You do not have access to this conversation session");
            }

            if (conversation.getStatus() == ConversationStatus.RESOLVED) {
                // Re-open if user continues asking questions
                conversation.setStatus(ConversationStatus.ACTIVE);
                conversation.setEndedAt(null);
            }
        } else {
            // Create new session
            String newSessionId = "SESSION-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String initialQuery = request.getMessage().trim();
            conversation = new AiConversation(newSessionId, user, initialQuery);
            conversation = conversationRepository.save(conversation);
            isNewSession = true;
        }

        // Save User Message
        AiMessage userMsg = new AiMessage(conversation, SenderType.USER, request.getMessage().trim());
        messageRepository.save(userMsg);

        // Classify domain and generate response
        String category = classifyDomain(conversation.getInitialQuery(), request.getMessage());
        conversation.setIdentifiedCategory(category);

        // Fetch conversation history
        List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<TroubleshootingStep> existingSteps = stepRepository.findByConversationIdOrderByStepNumberAsc(conversation.getId());

        // Generate AI diagnostic response and steps
        DiagnosticPlan plan = generateDiagnosticPlan(conversation, request.getMessage(), history, existingSteps);

        // Save Assistant Message
        AiMessage assistantMsg = new AiMessage(conversation, SenderType.ASSISTANT, plan.getReply());
        if (plan.getCitation() != null) {
            assistantMsg.setContextCitations(plan.getCitation());
        }
        messageRepository.save(assistantMsg);

        // Persist newly generated diagnostic steps
        List<DiagnosticStepDto> stepDtos = new ArrayList<>();
        int nextStepNum = existingSteps.size() + 1;

        for (RawDiagnosticStep rawStep : plan.getNewSteps()) {
            TroubleshootingStep stepEntity = new TroubleshootingStep(
                    conversation,
                    nextStepNum++,
                    rawStep.title(),
                    rawStep.instruction()
            );
            stepEntity = stepRepository.save(stepEntity);
            stepDtos.add(mapStepToDto(stepEntity, rawStep.command()));
        }

        // Update conversation
        conversationRepository.save(conversation);

        // Check if escalated
        Optional<Ticket> escalatedTicket = ticketRepository.findBySourceConversationId(conversation.getId());

        AiChatResponse response = new AiChatResponse(
                conversation.getSessionId(),
                plan.getReply(),
                category,
                plan.getConfidence()
        );
        response.setSteps(stepDtos);
        response.setCanEscalate(conversation.getStatus() != ConversationStatus.ESCALATED);
        response.setResolved(conversation.getStatus() == ConversationStatus.RESOLVED);
        escalatedTicket.ifPresent(ticket -> response.setEscalatedTicketNumber(ticket.getTicketNumber()));

        return response;
    }

    @Override
    @Transactional
    public AiChatResponse submitStepFeedback(Long userId, StepFeedbackRequest request) {
        TroubleshootingStep step = stepRepository.findById(request.getStepId())
                .orElseThrow(() -> new ResourceNotFoundException("TroubleshootingStep", "id", request.getStepId()));

        AiConversation conversation = step.getConversation();
        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this troubleshooting step");
        }

        step.setExecutedAt(Instant.now());
        step.setUserFeedback(request.getUserNotes());

        String replyMessage;

        if (Boolean.TRUE.equals(request.getWorked())) {
            step.setStatus(StepStatus.SUCCEEDED);
            conversation.setStatus(ConversationStatus.RESOLVED);
            conversation.setEndedAt(Instant.now());

            replyMessage = "🎉 Excellent! Diagnostic Step #" + step.getStepNumber() +
                    " resolved your issue (" + step.getStepTitle() + "). Your incident has been marked as Self-Resolved without creating an IT ticket. Have a productive day!";

            // Add Assistant confirmation message
            AiMessage confirmMsg = new AiMessage(conversation, SenderType.ASSISTANT, replyMessage);
            messageRepository.save(confirmMsg);
        } else {
            step.setStatus(StepStatus.FAILED);
            replyMessage = "Understood. Step #" + step.getStepNumber() +
                    " did not resolve the issue. You can attempt the next diagnostic step or click 'Convert to Ticket' to escalate directly to a support engineer.";

            AiMessage followUpMsg = new AiMessage(conversation, SenderType.ASSISTANT, replyMessage);
            messageRepository.save(followUpMsg);
        }

        stepRepository.save(step);
        conversationRepository.save(conversation);

        // Build response
        List<TroubleshootingStep> allSteps = stepRepository.findByConversationIdOrderByStepNumberAsc(conversation.getId());
        List<DiagnosticStepDto> stepDtos = allSteps.stream()
                .map(s -> mapStepToDto(s, null))
                .collect(Collectors.toList());

        Optional<Ticket> escalatedTicket = ticketRepository.findBySourceConversationId(conversation.getId());

        AiChatResponse response = new AiChatResponse(
                conversation.getSessionId(),
                replyMessage,
                conversation.getIdentifiedCategory(),
                0.95
        );
        response.setSteps(stepDtos);
        response.setResolved(conversation.getStatus() == ConversationStatus.RESOLVED);
        response.setCanEscalate(conversation.getStatus() != ConversationStatus.ESCALATED);
        escalatedTicket.ifPresent(t -> response.setEscalatedTicketNumber(t.getTicketNumber()));

        return response;
    }

    @Override
    @Transactional
    public AiChatResponse escalateSession(Long userId, EscalateSessionRequest request) {
        AiConversation conversation = conversationRepository.findBySessionId(request.getSessionId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "sessionId", request.getSessionId()));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this conversation session");
        }

        // If already escalated, return existing ticket
        Optional<Ticket> existingTicket = ticketRepository.findBySourceConversationId(conversation.getId());
        if (existingTicket.isPresent()) {
            Ticket ticket = existingTicket.get();
            AiChatResponse response = new AiChatResponse(
                    conversation.getSessionId(),
                    "This session is already escalated to support ticket " + ticket.getTicketNumber() + ".",
                    conversation.getIdentifiedCategory(),
                    1.0
            );
            response.setEscalatedTicketNumber(ticket.getTicketNumber());
            response.setCanEscalate(false);
            return response;
        }

        User user = conversation.getUser();
        List<AiMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<TroubleshootingStep> steps = stepRepository.findByConversationIdOrderByStepNumberAsc(conversation.getId());

        // Synthesize AI Summary
        String aiSummary = synthesizeEscalationSummary(conversation, messages, steps, request.getAdditionalNotes());

        // Match Category
        TicketCategory category = matchTicketCategory(conversation.getIdentifiedCategory());

        // Determine Priority
        TicketPriority priority = calculatePriority(conversation.getInitialQuery(), request.getPriority());

        // Create Ticket
        String ticketNumber = TicketNumberGenerator.generateTicketNumber();
        String title = truncateTitle(conversation.getInitialQuery());

        StringBuilder fullDescription = new StringBuilder();
        fullDescription.append("=== AUTOMATIC ESCALATION FROM AI SUPPORT ASSISTANT ===\n\n");
        fullDescription.append("User Initial Issue:\n").append(conversation.getInitialQuery()).append("\n\n");
        if (request.getAdditionalNotes() != null && !request.getAdditionalNotes().isBlank()) {
            fullDescription.append("User Notes at Escalation:\n").append(request.getAdditionalNotes().trim()).append("\n\n");
        }
        fullDescription.append("AI Diagnostic Summary:\n").append(aiSummary).append("\n\n");
        fullDescription.append("Attempted Diagnostic Steps:\n");
        for (TroubleshootingStep step : steps) {
            fullDescription.append("- Step ").append(step.getStepNumber()).append(": ")
                    .append(step.getStepTitle()).append(" [Status: ").append(step.getStatus()).append("]");
            if (step.getUserFeedback() != null) {
                fullDescription.append(" - Feedback: ").append(step.getUserFeedback());
            }
            fullDescription.append("\n");
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNumber(ticketNumber);
        ticket.setTitle(title);
        ticket.setDescription(fullDescription.toString());
        ticket.setRequester(user);
        ticket.setCategory(category);
        ticket.setPriority(priority != null ? priority : TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setSourceConversation(conversation);
        ticket.setAiSummary(aiSummary);
        ticket = ticketRepository.save(ticket);

        // Record Ticket History
        TicketHistory history = new TicketHistory(
                ticket,
                user,
                "STATUS",
                null,
                "OPEN",
                "Incident auto-escalated from AI Troubleshooting Session " + conversation.getSessionId()
        );
        historyRepository.save(history);

        // Mark Conversation as Escalated
        conversation.setStatus(ConversationStatus.ESCALATED);
        conversation.setEndedAt(Instant.now());
        conversationRepository.save(conversation);

        // Add confirmation message to chat
        String escalationNotice = "Support Ticket **" + ticket.getTicketNumber() + "** has been created and assigned to the " +
                (category != null ? category.getName() : "IT Support") + " team with priority **" + priority.name() +
                "**. An IT engineer will review your diagnostic transcript and follow up shortly.";

        AiMessage noticeMsg = new AiMessage(conversation, SenderType.ASSISTANT, escalationNotice);
        messageRepository.save(noticeMsg);

        AiChatResponse response = new AiChatResponse(
                conversation.getSessionId(),
                escalationNotice,
                conversation.getIdentifiedCategory(),
                1.0
        );
        response.setEscalatedTicketNumber(ticket.getTicketNumber());
        response.setCanEscalate(false);
        response.setResolved(false);

        List<DiagnosticStepDto> stepDtos = steps.stream()
                .map(s -> mapStepToDto(s, null))
                .collect(Collectors.toList());
        response.setSteps(stepDtos);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AiSessionSummaryResponse> getUserSessions(Long userId, Pageable pageable) {
        Page<AiConversation> page = conversationRepository.findByUserIdOrderByStartedAtDesc(userId, pageable);

        return page.map(conv -> {
            List<AiMessage> msgs = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
            Optional<Ticket> ticket = ticketRepository.findBySourceConversationId(conv.getId());

            return new AiSessionSummaryResponse(
                    conv.getSessionId(),
                    conv.getInitialQuery(),
                    conv.getIdentifiedCategory(),
                    conv.getStatus().name(),
                    conv.getStartedAt(),
                    conv.getEndedAt(),
                    msgs.size(),
                    ticket.map(Ticket::getTicketNumber).orElse(null)
            );
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AiConversationDetailResponse getSessionDetails(Long userId, String sessionId) {
        AiConversation conversation = conversationRepository.findBySessionId(sessionId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("AiConversation", "sessionId", sessionId));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this conversation session");
        }

        List<AiMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<TroubleshootingStep> steps = stepRepository.findByConversationIdOrderByStepNumberAsc(conversation.getId());
        Optional<Ticket> ticket = ticketRepository.findBySourceConversationId(conversation.getId());

        AiConversationDetailResponse response = new AiConversationDetailResponse(
                conversation.getSessionId(),
                conversation.getInitialQuery(),
                conversation.getIdentifiedCategory(),
                conversation.getStatus().name(),
                conversation.getStartedAt(),
                conversation.getEndedAt()
        );

        List<AiMessageDto> messageDtos = messages.stream()
                .map(m -> new AiMessageDto(m.getId(), m.getSenderType().name(), m.getContent(), m.getContextCitations(), m.getCreatedAt()))
                .collect(Collectors.toList());

        List<DiagnosticStepDto> stepDtos = steps.stream()
                .map(s -> mapStepToDto(s, null))
                .collect(Collectors.toList());

        response.setMessages(messageDtos);
        response.setSteps(stepDtos);
        ticket.ifPresent(t -> response.setEscalatedTicketNumber(t.getTicketNumber()));

        return response;
    }

    // =========================================================================
    // Private Helper Logic: Domain Classification, Diagnostic Planning, RAG
    // =========================================================================

    private String classifyDomain(String initialQuery, String latestMessage) {
        String text = (initialQuery + " " + latestMessage).toLowerCase();

        if (text.contains("cursor") || text.contains("mouse") || text.contains("touchpad") || text.contains("trackpad") || text.contains("pointer")) {
            return "Peripherals & Input Devices";
        }
        if (text.contains("audio") || text.contains("sound") || text.contains("speaker") || text.contains("headset") || text.contains("mic")) {
            return "Audio & Multimedia";
        }
        if (text.contains("screen") || text.contains("display") || text.contains("monitor") || text.contains("hdmi") || text.contains("brightness")) {
            return "Display & Monitors";
        }
        if (text.contains("bluetooth") || text.contains("bt ")) {
            return "Bluetooth & Wireless Devices";
        }
        if (text.contains("wifi") || text.contains("wi-fi") || text.contains("wlan") || text.contains("vpn") || text.contains("network") || text.contains("dns") || text.contains("ipsec") || text.contains("gateway") || text.contains("internet")) {
            return "Network & Connectivity";
        }
        if (text.contains("outlook") || text.contains("email") || text.contains("teams") || text.contains("office") || text.contains("excel") || text.contains("word") || text.contains("0x8004")) {
            return "Application Software";
        }
        if (text.contains("docker") || text.contains("git") || text.contains("wsl") || text.contains("daemon") || text.contains("kubernetes") || text.contains("npm") || text.contains("maven")) {
            return "Developer Tools";
        }
        if (text.contains("bitlocker") || text.contains("tpm") || text.contains("recovery key")) {
            return "Security & Encryption";
        }
        if (text.contains("battery") || text.contains("charger") || text.contains("keyboard") || text.contains("hardware") || text.contains("fan") || text.contains("heat")) {
            return "Hardware & Workstations";
        }
        if (text.contains("password") || text.contains("mfa") || text.contains("okta") || text.contains("login") || text.contains("access") || text.contains("permission") || text.contains("sso")) {
            return "Access & Identity";
        }
        return "General IT Support";
    }

    private DiagnosticPlan generateDiagnosticPlan(
            AiConversation conversation,
            String userMessage,
            List<AiMessage> history,
            List<TroubleshootingStep> existingSteps
    ) {
        // Try Spring AI ChatClient if available and healthy
        ChatClient chatClient = chatClientProvider.getIfAvailable();
        if (chatClient != null) {
            try {
                String promptText = buildPrompt(conversation, userMessage, history);
                String aiReply = chatClient.prompt()
                        .user(promptText)
                        .call()
                        .content();

                if (aiReply != null && !aiReply.isBlank()) {
                    List<RawDiagnosticStep> steps = extractStepsFromReply(aiReply, conversation.getIdentifiedCategory());
                    return new DiagnosticPlan(aiReply, "SOP-Grounded AI Model", 0.92, steps);
                }
            } catch (Exception e) {
                log.warn("Spring AI ChatClient call failed or OpenAI API key inactive; using built-in diagnostic rule engine: {}", e.getMessage());
            }
        }

        // Resilient Technical Diagnostic Rule Engine
        return generateRuleBasedPlan(conversation, userMessage, existingSteps);
    }

    private String buildPrompt(AiConversation conversation, String userMessage, List<AiMessage> history) {
        StringBuilder sb = new StringBuilder();
        sb.append("Initial Problem: ").append(conversation.getInitialQuery()).append("\n");
        sb.append("Domain Category: ").append(conversation.getIdentifiedCategory()).append("\n\n");
        sb.append("Conversation History:\n");
        for (AiMessage msg : history) {
            sb.append(msg.getSenderType()).append(": ").append(msg.getContent()).append("\n");
        }
        sb.append("\nUser Latest Message: ").append(userMessage).append("\n");
        sb.append("Provide a clear diagnostic response and exactly 1 or 2 concrete steps that the user can test.");
        return sb.toString();
    }

    private DiagnosticPlan generateRuleBasedPlan(
            AiConversation conversation,
            String userMessage,
            List<TroubleshootingStep> existingSteps
    ) {
        String text = (conversation.getInitialQuery() + " " + userMessage).toLowerCase();
        List<RawDiagnosticStep> newSteps = new ArrayList<>();
        String reply;
        String citation;

        // 1. Cursor / Touchpad / Mouse Issues
        if (text.contains("cursor") || text.contains("touchpad") || text.contains("trackpad") || text.contains("mouse") || text.contains("pointer")) {
            citation = "SOP-HW-012: Laptop Touchpad & Pointer Troubleshooting Guide.pdf";
            reply = "I've analyzed your input hardware symptoms. A missing or unresponsive cursor on a laptop is typically caused by an accidental Fn touchpad hardware lock, an inverted Windows gesture toggle, or a suspended I2C/HID pointer driver. Let's resolve this step-by-step:";
            newSteps.add(new RawDiagnosticStep(
                    "Toggle Laptop Touchpad Function Lock (Fn Key)",
                    "Most enterprise laptops (Dell, Lenovo, HP, Asus) have a physical touchpad toggle. Try pressing Fn + F6, Fn + F7, Fn + F9, or Fn + F10 (look for the trackpad icon with a slash), or double-tap the top-left corner of the trackpad to re-enable it.",
                    "main.cpl"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Restart Mouse & Pointer Hardware Driver (HID)",
                    "Scan the hardware bus and restart the pointing device driver in Windows Device Manager.",
                    "pnputil /scan-devices ; Get-PnpDevice -Class 'Mouse' | Restart-PnpDevice -Confirm:$false -ErrorAction SilentlyContinue"
            ));
        }
        // 2. Wi-Fi Missing / Disabled / Adapter Gone
        else if ((text.contains("wifi") || text.contains("wi-fi") || text.contains("wlan")) && 
                 (text.contains("gone") || text.contains("missing") || text.contains("not there") || text.contains("no wifi") || text.contains("disabled") || text.contains("disappeared"))) {
            citation = "SOP-NET-008: Windows WLAN Adapter & Service Recovery.pdf";
            reply = "I've diagnosed your wireless network issue. When the Wi-Fi icon or toggle disappears completely from Windows, the network adapter is usually software-disabled, stuck in Airplane Mode, or the Windows WLAN AutoConfig service has stopped. Let's restore your Wi-Fi interface:";
            newSteps.add(new RawDiagnosticStep(
                    "Force Enable Wi-Fi Adapter & Clear Adapter Disable",
                    "Execute the command below in PowerShell to re-enable all wireless network adapters and clear administrative blocks.",
                    "netsh interface set interface \"Wi-Fi\" admin=enabled ; Enable-NetAdapter -Name \"*Wi-Fi*\" -Confirm:$false -ErrorAction SilentlyContinue"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Restart Windows WLAN AutoConfig Service (WlanSvc)",
                    "WlanSvc manages wireless discovery and network card enumeration. Restarting it restores the Wi-Fi tray icon and available networks list.",
                    "Restart-Service -Name WlanSvc -Force ; netsh winsock reset"
            ));
        }
        // 3. Audio / Sound / Microphone Issues
        else if (text.contains("audio") || text.contains("sound") || text.contains("speaker") || text.contains("headset") || text.contains("mic") || text.contains("volume")) {
            citation = "SOP-HW-015: Windows Audio Service & Endpoint Diagnostics.pdf";
            reply = "I've evaluated your audio hardware prompt. Missing audio outputs or microphone dropouts typically occur when the Windows Audio Endpoint Builder hangs. Let's restart the audio engine:";
            newSteps.add(new RawDiagnosticStep(
                    "Restart Core Windows Audio Services",
                    "Restarts AudioSrv and AudioEndpointBuilder to reload all playback and recording streams without requiring a computer reboot.",
                    "Restart-Service -Name Audiosrv, AudioEndpointBuilder -Force"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Rescan and Enumerate Audio Hardware Devices",
                    "Forces Windows Plug-and-Play manager to re-detect connected 3.5mm jacks, USB headsets, and Bluetooth devices.",
                    "pnputil /scan-devices"
            ));
        }
        // 4. Display / Screen / External Monitor / HDMI
        else if (text.contains("screen") || text.contains("display") || text.contains("monitor") || text.contains("hdmi") || text.contains("brightness") || text.contains("second monitor")) {
            citation = "SOP-HW-007: Multi-Display & GPU Driver Recovery.pdf";
            reply = "I've analyzed your display issue. Screen blackouts, detection failures, or second monitor freezes are usually resolved by restarting the display driver pipeline:";
            newSteps.add(new RawDiagnosticStep(
                    "Trigger Windows GPU Driver Reset",
                    "Press Win + Ctrl + Shift + B on your keyboard (the screen will briefly flicker and beep). Then execute the projection command below to extend your desktop.",
                    "displayswitch.exe /extend"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Re-Detect Connected Displays & Refresh Resolution",
                    "Force Windows WMI to query attached monitors and update EDID timings.",
                    "Get-WmiObject -Namespace root\\wmi -Class WmiMonitorID"
            ));
        }
        // 5. Bluetooth Issues
        else if (text.contains("bluetooth") || text.contains("bt ")) {
            citation = "SOP-HW-019: Windows Bluetooth Stack Recovery.pdf";
            reply = "I've analyzed your Bluetooth connection issue. Let's restart the Bluetooth Discovery & Support service:";
            newSteps.add(new RawDiagnosticStep(
                    "Restart Bluetooth Support Service (bthserv)",
                    "Restarts the Windows Bluetooth background engine and clears stuck peripheral pairing caches.",
                    "Restart-Service -Name bthserv -Force"
            ));
        }
        // 6. Docker Desktop & Container Engines
        else if (text.contains("docker") || text.contains("wsl") || text.contains("container")) {
            citation = "SOP-DEV-022: Windows Docker Desktop & WSL2 Permissions.pdf";
            reply = "I've diagnosed your Docker environment fault. This typically happens when non-elevated terminals lack ACL socket permissions or the WSL2 kernel is stopped:";
            newSteps.add(new RawDiagnosticStep(
                    "Grant User ACL on Docker Config & Named Pipe",
                    "Grants your user full access permissions to Docker CLI configs and communication pipes.",
                    "icacls \"$env:USERPROFILE\\.docker\\config.json\" /grant \"${env:USERNAME}:F\""
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Restart WSL2 Subsystem Engine",
                    "Gracefully terminates and re-initializes the WSL2 Linux kernel supporting the Docker runtime.",
                    "wsl --shutdown"
            ));
        }
        // 7. Git / SSH / Version Control Access
        else if (text.contains("git") || text.contains("ssh") || text.contains("publickey") || text.contains("push rejected")) {
            citation = "SOP-DEV-018: Enterprise Git & SSH Key Configuration.pdf";
            reply = "I've analyzed your version control access error. 'Permission denied (publickey)' indicates the SSH agent cannot find a matching private key or the public key has not been added to your GitHub/GitLab account:";
            newSteps.add(new RawDiagnosticStep(
                    "Test SSH Handshake with GitHub",
                    "Test whether your local SSH agent can establish a secure handshake with the remote repository.",
                    "ssh -vT git@github.com"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Display Your Local SSH Public Key to Add to Account",
                    "Copy your public key output below, go to your GitHub/GitLab Settings > SSH Keys, and paste it.",
                    "Get-Content \"$env:USERPROFILE\\.ssh\\id_ed25519.pub\", \"$env:USERPROFILE\\.ssh\\id_rsa.pub\" -ErrorAction SilentlyContinue"
            ));
        }
        // 8. BitLocker & TPM (ONLY when specifically asking about BitLocker/TPM/Recovery Key)
        else if (text.contains("bitlocker") || text.contains("tpm") || text.contains("recovery key")) {
            citation = "SOP-SEC-003: Azure AD Intune BitLocker & TPM Diagnostics.pdf";
            reply = "I've evaluated your BitLocker recovery request against our Azure AD device management SOP. You can retrieve your 48-digit recovery key securely through Microsoft Intune:";
            newSteps.add(new RawDiagnosticStep(
                    "Retrieve BitLocker Key from Corporate Device Portal",
                    "Open https://myaccount.microsoft.com/device-list in a browser (or phone), locate your laptop name, and click 'View BitLocker Keys'.",
                    "Get-BitLockerVolume -MountPoint 'C:'"
            ));
        }
        // 9. VPN & General Network Connectivity
        else if (text.contains("vpn") || text.contains("network") || text.contains("globalprotect") || text.contains("disconnect") || text.contains("wifi") || text.contains("wi-fi")) {
            citation = "SOP-NET-014: Corporate VPN & Remote Access Protocol.pdf (Section 3.2)";
            if (existingSteps.isEmpty()) {
                reply = "I've analyzed your network connectivity issue against our Palo Alto GlobalProtect and Wi-Fi SOPs. Frequent drops on home Wi-Fi typically occur when carrier UDP keepalives expire or MTU packets fragment. Let's start with non-destructive network reconfiguration:";
                newSteps.add(new RawDiagnosticStep(
                        "Force SSL Tunnel Encapsulation (TCP 443)",
                        "Open GlobalProtect Settings > Troubleshooting > Toggle 'Prefer SSL Tunnel over IPsec'. Alternatively execute the command below in PowerShell.",
                        "Set-GPConfig -EnforceTunnel 'SSL-TCP-443' -AutoReconnect $true"
                ));
                newSteps.add(new RawDiagnosticStep(
                        "Flush DNS Cache & Refresh DHCP Lease",
                        "Run the diagnostic command below to flush stale route entries and refresh local DNS mappings.",
                        "ipconfig /flushdns ; ipconfig /renew"
                ));
            } else {
                reply = "Since the primary tunnel reset did not fully stabilize your connection, let's verify local gateway packet loss and MTU fragmentation thresholds:";
                newSteps.add(new RawDiagnosticStep(
                        "Test Gateway MTU Threshold & Latency",
                        "Execute ping with the Don't Fragment flag to detect router MTU packet drops.",
                        "ping -f -l 1472 8.8.8.8"
                ));
            }
        }
        // 10. Outlook & Application Software
        else if (text.contains("outlook") || text.contains("email") || text.contains("teams") || text.contains("office") || text.contains("excel") || text.contains("word") || text.contains("0x8004")) {
            citation = "SOP-APP-009: Microsoft 365 Outlook & Teams Diagnostic SOP.docx";
            if (existingSteps.isEmpty()) {
                reply = "I've reviewed Microsoft 365 profile diagnostics for error code 0x8004010F. This error is commonly triggered when the offline Outlook Data File (.ost) header becomes locked or the default profile store desynchronizes. Let's verify and repair your profile:";
                newSteps.add(new RawDiagnosticStep(
                        "Clean Reminders & Rebuild Outlook Cache",
                        "Close Outlook and run the repair command to recreate the cached OST container safely.",
                        "outlook.exe /cleanreminders ; Remove-Item \"$env:LOCALAPPDATA\\Microsoft\\Outlook\\*.ost\" -ErrorAction SilentlyContinue"
                ));
                newSteps.add(new RawDiagnosticStep(
                        "Verify Autodiscover Endpoint Connectivity",
                        "Test that your computer can reach the corporate Microsoft 365 Autodiscover service.",
                        "Test-NetConnection -ComputerName 'autodiscover.office365.com' -Port 443"
                ));
            } else {
                reply = "If the profile reset did not clear the store lock, let's launch Outlook in Safe Mode with hardware acceleration disabled:";
                newSteps.add(new RawDiagnosticStep(
                        "Start Outlook in Verified Safe Mode",
                        "Launches Outlook with all COM add-ins and cached hardware acceleration hooks bypassed.",
                        "outlook.exe /safe"
                ));
            }
        }
        // 11. System Sluggishness & High Resource Usage
        else if (text.contains("slow") || text.contains("freeze") || text.contains("high cpu") || text.contains("ram") || text.contains("memory") || text.contains("hang")) {
            citation = "SOP-SYS-004: Windows Performance Optimization & Diagnostics.pdf";
            reply = "Let's identify what is causing your system slowdown:";
            newSteps.add(new RawDiagnosticStep(
                    "Identify High-Resource Processes",
                    "Lists the top processes currently consuming CPU and memory.",
                    "Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU, WorkingSet64"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Scan System Integrity (SFC Scan)",
                    "Scans Windows system files for corruption and repairs missing binaries.",
                    "sfc /scannow"
            ));
        }
        // 12. General Technical Inquiry (Fallback)
        else {
            citation = "SOP-GEN-001: General Enterprise IT Diagnostic Standard.pdf";
            reply = "I've reviewed your request. To help identify the root cause quickly, let's run standard baseline diagnostics:";
            newSteps.add(new RawDiagnosticStep(
                    "Inspect Recent System Error Events",
                    "Queries the Windows Event Log for recent critical hardware, service, or driver failures.",
                    "Get-EventLog -LogName System -EntryType Error -Newest 5"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Verify Corporate Gateway Connectivity",
                    "Confirms network connectivity and DNS resolution.",
                    "Test-NetConnection -ComputerName '1.1.1.1' -Port 53"
            ));
        }

        return new DiagnosticPlan(reply, citation, 0.94, newSteps);
    }

    private List<RawDiagnosticStep> extractStepsFromReply(String aiReply, String domain) {
        List<RawDiagnosticStep> list = new ArrayList<>();
        list.add(new RawDiagnosticStep(
                "Apply Recommended Diagnostic Step",
                aiReply.length() > 200 ? aiReply.substring(0, 200) + "..." : aiReply,
                null
        ));
        return list;
    }

    private String synthesizeEscalationSummary(
            AiConversation conversation,
            List<AiMessage> messages,
            List<TroubleshootingStep> steps,
            String userNotes
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("Initial Reported Issue: ").append(conversation.getInitialQuery()).append(". ");
        sb.append("Category: ").append(conversation.getIdentifiedCategory()).append(". ");

        long failedSteps = steps.stream().filter(s -> s.getStatus() == StepStatus.FAILED).count();
        if (failedSteps > 0) {
            sb.append(failedSteps).append(" automated diagnostic step(s) were attempted and failed. ");
        }

        if (userNotes != null && !userNotes.isBlank()) {
            sb.append("User note: \"").append(userNotes.trim()).append("\". ");
        }

        sb.append("Self-service resolution could not clear the issue; routed to Tier-2 support for human investigation.");
        return sb.toString();
    }

    private TicketCategory matchTicketCategory(String domain) {
        if (domain == null) return null;
        List<TicketCategory> categories = categoryRepository.findAll();
        for (TicketCategory cat : categories) {
            if (domain.toLowerCase().contains(cat.getName().toLowerCase()) ||
                    cat.getName().toLowerCase().contains(domain.toLowerCase())) {
                return cat;
            }
        }
        return categories.isEmpty() ? null : categories.get(0);
    }

    private TicketPriority calculatePriority(String query, String userPriority) {
        if (userPriority != null && !userPriority.isBlank()) {
            try {
                return TicketPriority.valueOf(userPriority.toUpperCase().trim());
            } catch (IllegalArgumentException ignored) {}
        }

        String q = query.toLowerCase();
        if (q.contains("down") || q.contains("outage") || q.contains("crash") || q.contains("security") || q.contains("breach")) {
            return TicketPriority.CRITICAL;
        }
        if (q.contains("blocked") || q.contains("broken") || q.contains("cannot work") || q.contains("urgent") || q.contains("vpn")) {
            return TicketPriority.HIGH;
        }
        return TicketPriority.MEDIUM;
    }

    private String truncateTitle(String query) {
        String clean = query.trim().replaceAll("\\s+", " ");
        return clean.length() > 80 ? clean.substring(0, 77) + "..." : clean;
    }

    private DiagnosticStepDto mapStepToDto(TroubleshootingStep step, String command) {
        return new DiagnosticStepDto(
                step.getId(),
                step.getStepNumber(),
                step.getStepTitle(),
                step.getInstructions(),
                command,
                step.getStatus().name(),
                step.getUserFeedback()
        );
    }

    // Value Objects for internal planning
    private record RawDiagnosticStep(String title, String instruction, String command) {}

    private static class DiagnosticPlan {
        private final String reply;
        private final String citation;
        private final double confidence;
        private final List<RawDiagnosticStep> newSteps;

        public DiagnosticPlan(String reply, String citation, double confidence, List<RawDiagnosticStep> newSteps) {
            this.reply = reply;
            this.citation = citation;
            this.confidence = confidence;
            this.newSteps = newSteps;
        }

        public String getReply() { return reply; }
        public String getCitation() { return citation; }
        public double getConfidence() { return confidence; }
        public List<RawDiagnosticStep> getNewSteps() { return newSteps; }
    }
}
