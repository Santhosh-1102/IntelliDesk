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
        if (text.contains("screen") || text.contains("display") || text.contains("monitor") || text.contains("hdmi") || text.contains("brightness") || text.contains("green line") || text.contains("line on screen")) {
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
        return generateRuleBasedPlan(conversation, userMessage, history, existingSteps);
    }

    private String buildPrompt(AiConversation conversation, String userMessage, List<AiMessage> history) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are the IntelliDesk Enterprise IT AI Specialist. Guide enterprise employees step-by-step with practical, user-friendly instructions:\n");
        sb.append("- Explain what is happening in simple, clear terms.\n");
        sb.append("- Guide them step-by-step through Windows Settings (mentioning exact paths and toggles to check, e.g. 'Press Win + I > Settings > [Section] > verify toggle is ON').\n");
        sb.append("- Guide them through Device Manager (how to check, enable, or update the device driver via Win + X > Device Manager).\n");
        sb.append("- Guide them on how to open Google Chrome, visit their laptop manufacturer's driver website (Dell, HP, Lenovo), download the latest driver, and reinstall it.\n");
        sb.append("- If the user reports green/pink lines on a laptop screen, recognize that this is almost always a physical hardware failure in the LCD panel or hinge flex cable. Teach them the 30-second BIOS test (tap F2/F12 on reboot) to confirm, and recommend converting to a support ticket for screen replacement.\n");
        sb.append("- If the user mentions not having dedicated graphics, explain Integrated Graphics (Intel Iris Xe/UHD or AMD Radeon) built into the CPU, and re-emphasize the BIOS test.\n");
        sb.append("- Optionally provide a quick terminal/PowerShell command in a ```powershell code block for advanced users.\n\n");
        sb.append("Initial Problem: ").append(conversation.getInitialQuery()).append("\n");
        sb.append("Domain Category: ").append(conversation.getIdentifiedCategory()).append("\n\n");
        sb.append("Conversation History:\n");
        for (AiMessage msg : history) {
            sb.append(msg.getSenderType()).append(": ").append(msg.getContent()).append("\n");
        }
        sb.append("\nUser Latest Message: ").append(userMessage).append("\n");
        sb.append("Provide a clear, conversational diagnostic response.");
        return sb.toString();
    }

    private DiagnosticPlan generateRuleBasedPlan(
            AiConversation conversation,
            String userMessage,
            List<AiMessage> history,
            List<TroubleshootingStep> existingSteps
    ) {
        String userText = userMessage != null ? userMessage.trim().toLowerCase() : "";
        String initialText = conversation.getInitialQuery() != null ? conversation.getInitialQuery().trim().toLowerCase() : "";
        String fullText = (initialText + " " + userText).toLowerCase();

        List<RawDiagnosticStep> newSteps = new ArrayList<>();
        String reply;
        String citation;

        // =========================================================================
        // A. CONVERSATIONAL MULTI-TURN FOLLOW-UP DETECTION
        // =========================================================================

        boolean isFollowUp = history != null && history.size() >= 2;

        // Case A1: User clarifies they don't have dedicated graphics / only integrated graphics
        if (userText.contains("graphics doesnt have") || userText.contains("graphics doesn't have")
                || userText.contains("no graphics") || userText.contains("doesnt have graphics")
                || userText.contains("doesn't have graphics") || userText.contains("dont have graphics")
                || userText.contains("don't have graphics") || userText.contains("no gpu")
                || userText.contains("dont have a graphics") || userText.contains("don't have a graphics")
                || userText.contains("without graphics") || userText.contains("integrated graphics")) {

            citation = "SOP-HW-023: Laptop LCD Panel & Screen Artifact Diagnostics.pdf";
            reply = "### 💡 Understanding Laptop Graphics (Integrated vs. Dedicated)\n" +
                    "Thank you for clarifying! Many enterprise laptops do not have a dedicated gaming graphics card (like NVIDIA GeForce or AMD Radeon). Instead, your laptop uses **Integrated Graphics** built directly inside your processor:\n" +
                    "- If your laptop has an Intel CPU: it uses **Intel Iris Xe** or **Intel UHD Graphics**.\n" +
                    "- If your laptop has an AMD CPU: it uses **AMD Radeon Graphics**.\n\n" +
                    "---\n\n" +
                    "### ⚠️ What the Green Line on Your Screen Actually Means\n" +
                    "Because a **vertical or horizontal green line is physically appearing across your screen**, here is the truth:\n" +
                    "In over 95% of cases, this is **NOT a graphics card or driver issue at all**—it is a **physical hardware failure of the LCD display panel** (known as a broken subpixel column or damaged Chip-On-Film gate ribbon cable inside the screen).\n\n" +
                    "---\n\n" +
                    "### 🛠️ The 30-Second Confirmation Test: The BIOS Check\n" +
                    "You can confirm 100% whether the screen is physically broken in under 1 minute:\n" +
                    "1. Save your work and **Restart your laptop**.\n" +
                    "2. As soon as the screen turns on (before Windows or any drivers load), repeatedly tap **`F2`**, **`F12`**, or **`Del`** to open the **BIOS / UEFI firmware screen**.\n" +
                    "3. **Observe the green line:**\n" +
                    "   - **If the green line is STILL visible on the BIOS screen:** This confirms a **100% physical LCD hardware defect**. No software setting, update, or driver can fix a physically damaged screen.\n" +
                    "   - **If the line DISAPPEARS in BIOS:** Then it is caused by Windows refresh rate or display scaling.\n\n" +
                    "---\n\n" +
                    "### 📋 Next Step: Escalate for Screen Replacement\n" +
                    "Since physical screen lines require an LCD panel replacement under warranty or by IT hardware engineers:\n" +
                    "- Click the **\"Convert to Support Ticket\"** button below to immediately open a repair request. We will attach your diagnosis so the hardware team can order a replacement display.";

            newSteps.add(new RawDiagnosticStep(
                    "Perform 30-Second BIOS Hardware Screen Test",
                    "Restart laptop and press F2/F12 to enter BIOS. If green line remains visible in BIOS, the LCD panel is physically defective.",
                    "shutdown /r /fw /t 5"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Escalate to IT Hardware Support for Screen Replacement",
                    "Physical LCD ribbon damage cannot be fixed via software. Convert session to IT support ticket for hardware servicing.",
                    null
            ));
            return new DiagnosticPlan(reply, citation, 0.98, newSteps);
        }

        // Case A2: User says line / problem persists in BIOS ("in bios", "showing in bios", "saw in bios")
        if (userText.contains("in bios") || userText.contains("showing in bios") || userText.contains("saw in bios") || userText.contains("still in bios") || userText.contains("yes in bios")) {
            citation = "SOP-HW-023: Laptop LCD Panel & Screen Artifact Diagnostics.pdf";
            reply = "### 🔴 Confirmed Physical Hardware Defect\n" +
                    "Because the line appears directly on the **BIOS / UEFI firmware screen** before Windows or any operating system drivers load:\n" +
                    "- **This 100% confirms a physical hardware defect** inside the laptop's LCD panel (a dead/stuck subpixel line) or a damaged display ribbon cable in the hinge.\n" +
                    "- No software, Windows setting, or driver update can repair physical LCD hardware damage.\n\n" +
                    "---\n\n" +
                    "### 🛠️ What Needs to Be Done\n" +
                    "The laptop display panel must be replaced by our IT Hardware Engineering team or through manufacturer warranty (Dell / HP / Lenovo).\n\n" +
                    "👉 **Please click \"Convert to Support Ticket\"** above or below. We will log this with high priority and arrange a replacement laptop or on-site screen repair.";

            newSteps.add(new RawDiagnosticStep(
                    "Escalate to Hardware Support for Screen Replacement",
                    "LCD panel hardware failure confirmed via BIOS test. Convert to ticket for warranty panel swap.",
                    null
            ));
            return new DiagnosticPlan(reply, citation, 0.99, newSteps);
        }

        // Case A3: User tested BIOS and line does NOT appear ("not in bios", "disappeared in bios")
        if (userText.contains("not in bios") || userText.contains("gone in bios") || userText.contains("disappeared in bios") || userText.contains("clean in bios")) {
            citation = "SOP-HW-007: Multi-Display & GPU Driver Recovery.pdf";
            reply = "### 🟢 Software / Refresh Rate Conflict Confirmed\n" +
                    "Excellent news! Because the green line does **NOT** appear on the BIOS screen:\n" +
                    "- Your laptop's physical screen hardware is completely healthy!\n" +
                    "- The line is caused by a Windows display refresh rate conflict or a corrupted integrated display driver.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Fix in Windows\n\n" +
                    "#### Step 1: Change Display Refresh Rate to 60Hz in Settings\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Display** > **Advanced display**.\n" +
                    "3. Under **Choose a refresh rate**, change it to **60 Hz** (if it was set to 120Hz or 144Hz).\n\n" +
                    "#### Step 2: Reinstall Integrated Display Driver\n" +
                    "1. Press **`Windows Key + X`** and open **Device Manager**.\n" +
                    "2. Expand **Display adapters**.\n" +
                    "3. Right-click your integrated graphics (**Intel Iris Xe / Intel UHD** or **AMD Radeon Graphics**) and choose **Uninstall device** (do NOT delete the driver files).\n" +
                    "4. Restart your laptop — Windows will automatically re-detect the display and load a clean driver.";

            newSteps.add(new RawDiagnosticStep(
                    "Change Refresh Rate in Windows Settings",
                    "Press Win + I > System > Display > Advanced display > Set refresh rate to 60 Hz.",
                    "ms-settings:display-advanced"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Reinstall Display Adapter Driver in Device Manager",
                    "Open Device Manager > Display adapters > Right-click graphics card > Uninstall > Restart laptop.",
                    "devmgmt.msc"
            ));
            return new DiagnosticPlan(reply, citation, 0.95, newSteps);
        }

        // Case A4: User reports that previous steps didn't solve the issue / still not working
        if (isFollowUp && (userText.contains("still") || userText.contains("didn't work") || userText.contains("did not work")
                || userText.contains("not solved") || userText.contains("same problem") || userText.contains("still there")
                || userText.contains("failed") || userText.contains("not working"))) {

            citation = "SOP-GEN-002: IT Support Incident Escalation Standard.pdf";
            reply = "### ⚠️ Issue Still Persists - Ready for IT Engineer Escalation\n" +
                    "Thank you for trying those initial troubleshooting steps. Since the issue remains unresolved:\n\n" +
                    "- The problem likely requires hands-on hardware inspection, specialized administrative permissions, or a component replacement.\n" +
                    "- You do not have to keep troubleshooting alone!\n\n" +
                    "---\n\n" +
                    "### 🛠️ Recommended Next Step: Escalate to Support Ticket\n" +
                    "1. Click the **\"Convert to Support Ticket\"** button in the header or below.\n" +
                    "2. Choose the priority level (e.g. **High** if this blocks your daily work).\n" +
                    "3. Add any specific details (e.g., laptop serial number, brand, or room location).\n" +
                    "4. Our IT support team will be notified immediately with your full conversation transcript and will follow up with you directly.";

            newSteps.add(new RawDiagnosticStep(
                    "Escalate Incident to Human IT Support Engineer",
                    "Click 'Convert to Support Ticket' to open a formal IT support ticket with full diagnostic history.",
                    null
            ));
            return new DiagnosticPlan(reply, citation, 0.96, newSteps);
        }

        // =========================================================================
        // B. SPECIFIC SYMPTOM INTENT CLASSIFICATION
        // =========================================================================

        // 1. Cursor / Touchpad / Mouse Issues
        if (fullText.contains("cursor") || fullText.contains("touchpad") || fullText.contains("trackpad") || fullText.contains("mouse") || fullText.contains("pointer")) {
            citation = "SOP-HW-012: Laptop Touchpad & Pointer Troubleshooting Guide.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "When your cursor disappears on a laptop, it is usually because the touchpad was accidentally disabled by a **keyboard shortcut**, turned off in **Windows Settings**, or the **touchpad driver** stopped responding.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Your Laptop's Touchpad Lock Key\n" +
                    "- Many laptops have a quick lock key on the top row of the keyboard. Look for a key with a touchpad icon and a slash through it.\n" +
                    "- Try pressing **`Fn + F6`**, **`Fn + F7`**, **`Fn + F9`**, or **`Fn + F10`** (depending on your laptop brand: Dell, HP, Lenovo, or Asus).\n" +
                    "- On HP and Dell laptops, try **double-tapping the top-left sensor dot** on the touchpad itself to unlock it.\n\n" +
                    "#### Step 2: Go to Windows Settings and Check if Touchpad is Enabled\n" +
                    "1. Press **`Windows Key + I`** on your keyboard to open **Settings**.\n" +
                    "2. Click on **Bluetooth & devices** in the left sidebar, then click on **Touchpad**.\n" +
                    "3. Check whether the **Touchpad** toggle is switched **ON** or **OFF**.\n" +
                    "   - If it is **OFF**, click the switch to turn it **ON**.\n" +
                    "4. Click to expand the Touchpad section and make sure the box *'Leave touchpad on when a mouse is connected'* is **checked**.\n\n" +
                    "#### Step 3: Check Device Manager\n" +
                    "1. Press **`Windows Key + X`** and click **Device Manager** (or press `Win + R`, type `devmgmt.msc` and hit Enter).\n" +
                    "2. Double-click **Mice and other pointing devices** to expand it.\n" +
                    "3. Look for your touchpad (e.g. *Synaptics TouchPad*, *ELAN Touchpad*, or *HID-compliant mouse*).\n" +
                    "4. If you see a small black downward arrow next to it, it is disabled. **Right-click it** and select **Enable device**.\n" +
                    "5. You can also right-click it and select **Update driver** > **Search automatically for drivers**.\n\n" +
                    "#### Step 4: Open Google Chrome and Download the Latest Official Driver\n" +
                    "If the cursor still isn't working, the driver may need to be reinstalled from your manufacturer:\n" +
                    "1. Open **Google Chrome** (you can connect an external USB mouse or navigate with the `Tab` and arrow keys).\n" +
                    "2. Go to your laptop manufacturer's official support website:\n" +
                    "   - **Dell**: [dell.com/support](https://www.dell.com/support)\n" +
                    "   - **HP**: [support.hp.com](https://support.hp.com)\n" +
                    "   - **Lenovo**: [support.lenovo.com](https://support.lenovo.com)\n" +
                    "3. Enter your laptop's **Serial Number / Service Tag** or select your laptop model.\n" +
                    "4. Navigate to **Drivers & Downloads** and look under the **Mouse, Touchpad & Input Devices** category.\n" +
                    "5. Download the latest **Touchpad / Synaptics / ELAN Driver**, run the `.exe` installer, and restart your laptop.\n\n" +
                    "*(Optional Quick Command: Press `Win + R`, type `main.cpl` and hit Enter to jump straight to Mouse Properties).*";
            newSteps.add(new RawDiagnosticStep(
                    "Check Touchpad Toggle in Windows Settings",
                    "Press Win + I > Bluetooth & devices > Touchpad and ensure the switch is turned ON.",
                    "main.cpl"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Enable Touchpad Driver in Device Manager or Download from Chrome",
                    "Open Device Manager (Win + X) > Mice and other pointing devices > Enable device. Alternatively, visit Dell/HP/Lenovo support via Chrome to download the official driver.",
                    "pnputil /scan-devices"
            ));
        }
        // 2. Physical Screen Lines / Green Line / LCD Panel Damage / Artifacts (Checked before external monitors!)
        else if (fullText.contains("green line") || fullText.contains("pink line") || fullText.contains("white line")
                || fullText.contains("vertical line") || fullText.contains("horizontal line") || fullText.contains("line on screen")
                || fullText.contains("lines on screen") || fullText.contains("screen line") || fullText.contains("colored line")
                || fullText.contains("line in the middle") || fullText.contains("screen glitch") || fullText.contains("dead pixel")) {

            citation = "SOP-HW-023: Laptop LCD Panel & Screen Artifact Diagnostics.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "A vertical or horizontal line (often green, pink, or white) appearing on a laptop screen usually points to one of three causes:\n" +
                    "1. **Damaged LCD Display Panel:** A broken subpixel array or failing gate driver (Chip-On-Film failure) inside the glass panel.\n" +
                    "2. **Pinched Display Ribbon Cable:** The internal eDP video cable running through the laptop hinge is worn, strained, or loose.\n" +
                    "3. **Software Refresh Rate Glitch:** A rare conflict between Windows refresh rate and the display panel.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Diagnostic Guide\n\n" +
                    "#### Step 1: The 30-Second BIOS Test (Crucial Hardware vs. Software Test)\n" +
                    "This test tells you immediately whether the screen is physically broken:\n" +
                    "1. Save your work and **Restart your laptop**.\n" +
                    "2. As soon as the screen powers on (before the Windows logo appears), repeatedly tap **`F2`**, **`F12`**, or **`Del`** (depending on your laptop brand: Dell, HP, Lenovo) to open the **BIOS / UEFI setup screen**.\n" +
                    "3. **Look closely at the screen in BIOS:**\n" +
                    "   - **If the green line is STILL visible in BIOS:** This is a **100% confirmed physical hardware defect** in the LCD panel or ribbon cable. Drivers, software, or Windows settings cannot fix it, and the screen must be replaced.\n" +
                    "   - **If the green line DISAPPEARS in BIOS:** The screen hardware is fine, and the issue is caused by a Windows display refresh rate conflict.\n\n" +
                    "#### Step 2: The Laptop Hinge Movement Test\n" +
                    "- Gently tilt your laptop screen forward and backward on its hinges.\n" +
                    "- If the green line flickers, changes colors, or temporarily disappears as you move the hinge, the **internal display flex ribbon cable** is pinched or loose inside the hinge.\n\n" +
                    "#### Step 3: Connect to an External Monitor or TV\n" +
                    "- Plug your laptop into an external monitor or TV using an HDMI or USB-C cable.\n" +
                    "- **If the external monitor has NO line:** Your laptop's graphics processor and motherboard are completely healthy! Only the built-in laptop screen has physical damage.\n\n" +
                    "#### Step 4: Check Refresh Rate in Windows Settings (If Line Was Absent in BIOS)\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Display** > **Advanced display**.\n" +
                    "3. Look for **Choose a refresh rate** and set it to **60 Hz**.\n\n" +
                    "#### Step 5: Hardware Replacement & Escalation\n" +
                    "If the green line is visible in BIOS, physical LCD replacement is required. Click **\"Convert to Support Ticket\"** to request an LCD screen replacement from IT Hardware Support.";

            newSteps.add(new RawDiagnosticStep(
                    "Run 30-Second BIOS Screen Test (F2 / F12)",
                    "Restart laptop and tap F2/F12 to enter BIOS. If green line remains visible, the LCD panel is physically defective.",
                    "shutdown /r /fw /t 5"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Connect External Monitor to Confirm GPU Health",
                    "Connect HDMI/USB-C monitor. If external display is clean, motherboard and GPU are healthy.",
                    null
            ));
        }
        // 3. Wi-Fi Missing / Disabled / Adapter Gone
        else if ((fullText.contains("wifi") || fullText.contains("wi-fi") || fullText.contains("wlan")) && 
                 (fullText.contains("gone") || fullText.contains("missing") || fullText.contains("not there") || fullText.contains("no wifi") || fullText.contains("disabled") || fullText.contains("disappeared"))) {
            citation = "SOP-NET-008: Windows WLAN Adapter & Service Recovery.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "When the Wi-Fi icon or toggle vanishes from Windows, it usually means the network adapter was **disabled in Settings**, stuck in **Airplane Mode**, or the **wireless network driver** crashed.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Quick Settings & Airplane Mode\n" +
                    "- Press **`Windows Key + A`** to open the Quick Settings panel in the bottom-right corner of your screen.\n" +
                    "- Ensure **Airplane Mode** is turned **OFF**.\n" +
                    "- If your laptop has a physical Wi-Fi button or function key (e.g. `Fn + F2` or `Fn + F12`), press it once to verify it is not switched off.\n\n" +
                    "#### Step 2: Go to Windows Settings and Enable the Wi-Fi Adapter\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Click on **Network & internet** in the left sidebar.\n" +
                    "3. Scroll down and click on **Advanced network settings**.\n" +
                    "4. Under **Network adapters**, look for **Wi-Fi**.\n" +
                    "   - If it shows a button saying **Enable**, click it to turn the Wi-Fi card back on.\n\n" +
                    "#### Step 3: Check Device Manager\n" +
                    "1. Press **`Windows Key + X`** and choose **Device Manager**.\n" +
                    "2. Click to expand **Network adapters**.\n" +
                    "3. Look for your wireless card (e.g. *Intel Wi-Fi 6*, *Realtek Wireless LAN*, or *Qualcomm Atheros*).\n" +
                    "4. If you see a downward arrow, **right-click it** and select **Enable device**.\n" +
                    "5. If there is a yellow warning triangle, **right-click it** and choose **Update driver**.\n\n" +
                    "#### Step 4: Open Google Chrome and Download the Latest Wi-Fi Driver\n" +
                    "If Windows cannot find the wireless card, download a fresh driver from the manufacturer:\n" +
                    "1. Connect your laptop using an Ethernet cable, or connect your phone with a USB cable and turn on **USB Tethering** in your phone's hotspot settings for temporary internet.\n" +
                    "2. Open **Google Chrome** and go to your laptop maker's official driver page (Dell, HP, or Lenovo Support).\n" +
                    "3. Type your laptop model or Service Tag, click **Drivers & Downloads**, and choose **Network / Wireless**.\n" +
                    "4. Download the latest **Intel or Realtek Wireless LAN driver**, run the installer, and restart your computer.\n\n" +
                    "*(Optional Quick Command: Run this in PowerShell to restart the Windows Wi-Fi engine):*\n" +
                    "```powershell\n" +
                    "Restart-Service -Name WlanSvc -Force\n" +
                    "```";
            newSteps.add(new RawDiagnosticStep(
                    "Enable Wi-Fi in Windows Settings",
                    "Press Win + I > Network & internet > Advanced network settings > Enable Wi-Fi adapter.",
                    "ms-settings:network-advancedsettings"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Restart Wi-Fi Service & Device Manager",
                    "Open Device Manager > Network adapters > Enable device, or restart WlanSvc service in PowerShell.",
                    "Restart-Service -Name WlanSvc -Force"
            ));
        }
        // 4. Audio / Sound / Microphone Issues
        else if (fullText.contains("audio") || fullText.contains("sound") || fullText.contains("speaker") || fullText.contains("headset") || fullText.contains("mic") || fullText.contains("volume")) {
            citation = "SOP-HW-015: Windows Audio Service & Endpoint Diagnostics.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "When audio stops working or the microphone is silent, the wrong playback device is usually selected in **Windows Settings**, the microphone is muted by a privacy switch, or the **Realtek audio driver** needs to be reloaded.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Physical Buttons and Cables\n" +
                    "- Check your keyboard's mute key (look for `F1` or `Fn + F1` with a speaker slash icon) and press it to unmute.\n" +
                    "- If using headphones or an external speaker, unplug the 3.5mm jack or USB cable and plug it firmly back in.\n\n" +
                    "#### Step 2: Check Windows Sound Settings\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Sound**.\n" +
                    "3. Under **Output**, verify that the correct device is selected (e.g. *Speakers (Realtek Audio)* or your headset) and ensure the master volume slider is set above 50%.\n" +
                    "4. Under **Input**, verify that your microphone is selected and speak into it to see if the volume test bar moves.\n" +
                    "5. Go to **Privacy & security** > **Microphone** and make sure **Microphone access** is toggled **ON**.\n\n" +
                    "#### Step 3: Check Device Manager\n" +
                    "1. Press **`Windows Key + X`** and choose **Device Manager**.\n" +
                    "2. Expand **Sound, video and game controllers**.\n" +
                    "3. Right-click **Realtek High Definition Audio** (or your audio device) and click **Enable device** (or **Update driver**).\n\n" +
                    "#### Step 4: Open Google Chrome and Download the Official Audio Driver\n" +
                    "1. Open **Google Chrome** and visit your laptop manufacturer's driver website (e.g. Dell Support, HP Support, or Lenovo Support).\n" +
                    "2. Enter your laptop model number.\n" +
                    "3. Find the **Audio** category, download the latest **Realtek High Definition Audio Driver** installer, run it, and restart your PC.\n\n" +
                    "*(Optional Quick Command: Run this in PowerShell to restart the Windows Audio engine):*\n" +
                    "```powershell\n" +
                    "Restart-Service -Name Audiosrv, AudioEndpointBuilder -Force\n" +
                    "```";
            newSteps.add(new RawDiagnosticStep(
                    "Check Windows Sound & Volume Settings",
                    "Press Win + I > System > Sound and verify the active Output/Input device and volume levels.",
                    "ms-settings:sound"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Restart Windows Audio Services",
                    "Restarts AudioSrv and AudioEndpointBuilder to reload all playback streams.",
                    "Restart-Service -Name Audiosrv, AudioEndpointBuilder -Force"
            ));
        }
        // 4. External Monitor / HDMI / Projector / Second Screen (ONLY when explicitly asking about second monitor/HDMI)
        else if (fullText.contains("second monitor") || fullText.contains("external monitor") || fullText.contains("hdmi")
                || fullText.contains("projector") || fullText.contains("dual monitor") || fullText.contains("tv screen")
                || fullText.contains("another monitor") || fullText.contains("second display")) {
            citation = "SOP-HW-007: Multi-Display & GPU Driver Recovery.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "Second monitor blackouts or display detection failures usually happen because projection mode is set to 'PC Screen Only', cables are loose, or the **graphics driver (Intel, AMD, or NVIDIA)** needs a restart.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Cables and Projection Shortcut\n" +
                    "- Unplug the HDMI, DisplayPort, or USB-C cable from both the laptop and the monitor, then firmly reconnect them.\n" +
                    "- Ensure the monitor's power cable is plugged in and the monitor's input source (HDMI 1 / HDMI 2) matches your connected port.\n" +
                    "- Press **`Windows Key + P`** on your keyboard to open the Project menu, and choose **Extend** (or **Duplicate**).\n\n" +
                    "#### Step 2: Go to Windows Display Settings and Detect the Monitor\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Display**.\n" +
                    "3. Under **Multiple displays**, click the **Detect** button to force Windows to look for your connected screen.\n" +
                    "4. If detected, adjust the **Display resolution** to the recommended setting (e.g. 1920x1080).\n\n" +
                    "#### Step 3: Trigger Windows Graphics Driver Reset Shortcut\n" +
                    "- Press **`Windows Key + Ctrl + Shift + B`** simultaneously on your keyboard.\n" +
                    "- Your screen will briefly flicker black and you will hear a short beep — this forces Windows to instantly reload the graphics pipeline without closing your apps.\n\n" +
                    "#### Step 4: Open Google Chrome and Download the Latest Graphics Driver\n" +
                    "If the display is still not recognized, update your GPU driver:\n" +
                    "1. Open **Google Chrome** and visit your graphics card manufacturer:\n" +
                    "   - **Intel Graphics**: [intel.com/content/www/us/en/download-center/home.html](https://www.intel.com/content/www/us/en/download-center/home.html)\n" +
                    "   - **NVIDIA GeForce**: [nvidia.com/Download/index.aspx](https://www.nvidia.com/Download/index.aspx)\n" +
                    "   - **AMD Radeon**: [amd.com/en/support](https://www.amd.com/en/support)\n" +
                    "2. Download the official Driver Assistant or driver package for your GPU, run the installer, and restart your computer.";
            newSteps.add(new RawDiagnosticStep(
                    "Set Projection Mode to Extend (Win + P)",
                    "Press Win + P and select Extend, or adjust multiple display detection in Windows Settings.",
                    "displayswitch.exe /extend"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Reset Graphics Driver Pipeline",
                    "Press Win + Ctrl + Shift + B to trigger an instant GPU reset, or update display drivers via Chrome.",
                    "ms-settings:display"
            ));
        }
        // 6. Bluetooth Issues
        else if (fullText.contains("bluetooth") || fullText.contains("bt ")) {
            citation = "SOP-HW-019: Windows Bluetooth Stack Recovery.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "When Bluetooth devices won't connect or the Bluetooth toggle disappears, the adapter has usually been disabled in **Windows Settings** or the **Bluetooth support service** is suspended.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Go to Windows Settings and Check Bluetooth Toggle\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Click on **Bluetooth & devices**.\n" +
                    "3. Check whether the **Bluetooth** switch is turned **ON**.\n" +
                    "   - If it is already on, switch it **OFF**, wait 5 seconds, and switch it back **ON**.\n" +
                    "   - If your device is listed under paired devices, click the three dots (`...`) next to it, choose **Remove device**, and pair it again.\n\n" +
                    "#### Step 2: Check Device Manager\n" +
                    "1. Press **`Windows Key + X`** and open **Device Manager**.\n" +
                    "2. Expand the **Bluetooth** section.\n" +
                    "3. If you see **Intel Wireless Bluetooth** or **Realtek Bluetooth Adapter** with a small downward arrow, **right-click it** and select **Enable device**.\n" +
                    "4. If there is a yellow warning triangle, right-click and choose **Update driver**.\n\n" +
                    "#### Step 3: Open Google Chrome and Download the Latest Bluetooth Driver\n" +
                    "1. Open **Google Chrome** and visit your laptop manufacturer's support site (Dell / HP / Lenovo).\n" +
                    "2. Enter your laptop model name or Service Tag.\n" +
                    "3. Go to **Network / Wireless Drivers** and download the latest **Bluetooth Driver**.\n" +
                    "4. Run the installer and restart your laptop.\n\n" +
                    "*(Optional Quick Command: Run this in PowerShell to restart the Windows Bluetooth service):*\n" +
                    "```powershell\n" +
                    "Restart-Service -Name bthserv -Force\n" +
                    "```";
            newSteps.add(new RawDiagnosticStep(
                    "Check Bluetooth Toggle in Windows Settings",
                    "Press Win + I > Bluetooth & devices and verify the Bluetooth toggle is ON.",
                    "ms-settings:bluetooth"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Enable Device in Device Manager or Restart Bluetooth Service",
                    "Open Device Manager > Bluetooth > Enable device, or restart bthserv service.",
                    "Restart-Service -Name bthserv -Force"
            ));
        }
        // 7. Battery / Power / Charger Issues
        else if (fullText.contains("battery") || fullText.contains("charger") || fullText.contains("charging") || fullText.contains("plugged in") || fullText.contains("power")) {
            citation = "SOP-HW-021: Enterprise Laptop Power & Battery Health Diagnostics.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "When a laptop won't charge or battery life drains unusually fast, it is often due to a loose USB-C charging port, a power throttling profile, or a frozen battery management driver in Windows.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Charger and Outlet\n" +
                    "- Check the charging LED indicator on the side of your laptop near the charging port.\n" +
                    "- Try plugging your charger into a different wall outlet directly (avoid power strips) or test another USB-C port on your laptop.\n\n" +
                    "#### Step 2: Go to Windows Settings and Check Power & Battery\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Power & battery**.\n" +
                    "3. Under **Power mode**, set it to **Balanced** (or **Best performance** when plugged in).\n" +
                    "4. Check the **Battery usage** chart to see if a background application is draining battery.\n\n" +
                    "#### Step 3: Reinstall Battery Driver in Device Manager\n" +
                    "1. Press **`Windows Key + X`** and click **Device Manager**.\n" +
                    "2. Expand the **Batteries** section.\n" +
                    "3. Right-click **Microsoft ACPI-Compliant Control Method Battery** and select **Uninstall device** (do NOT delete the driver software).\n" +
                    "4. Restart your laptop. Windows will automatically detect your battery and install a clean, fresh power driver.\n\n" +
                    "#### Step 4: Open Google Chrome and Check Manufacturer Battery Diagnostics\n" +
                    "1. Open **Google Chrome** and download your manufacturer's diagnostic tool (e.g. **Dell SupportAssist**, **HP Support Assistant**, or **Lenovo Vantage**).\n" +
                    "2. Run the built-in **Battery Health Diagnostic** to see if your battery cells are healthy or require hardware replacement.";
            newSteps.add(new RawDiagnosticStep(
                    "Check Windows Power & Battery Settings",
                    "Press Win + I > System > Power & battery and set power mode to Balanced.",
                    "ms-settings:powersleep"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Reinstall Battery Driver in Device Manager",
                    "Open Device Manager > Batteries > Uninstall ACPI Battery > Restart laptop to re-enumerate.",
                    "devmgmt.msc"
            ));
        }
        // 8. Docker Desktop & Container Engines
        else if (fullText.contains("docker") || fullText.contains("wsl") || fullText.contains("container")) {
            citation = "SOP-DEV-022: Windows Docker Desktop & WSL2 Permissions.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "Docker Desktop startup and socket errors (such as EACCES or named pipe failures) occur when your user account lacks **ACL permissions** on the Docker configuration files or the **WSL2 Linux distribution** has stopped.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Docker Desktop Settings\n" +
                    "1. Open **Docker Desktop** from your Start menu.\n" +
                    "2. Click the **Gear icon (Settings)** in the top-right bar.\n" +
                    "3. In the **General** tab, make sure *'Use the WSL 2 based engine'* is **checked**.\n" +
                    "4. Click **Apply & restart**.\n\n" +
                    "#### Step 2: Grant Permissions and Restart WSL2\n" +
                    "Open PowerShell as Administrator and run the permission fix and WSL reboot:\n" +
                    "```powershell\n" +
                    "icacls \"$env:USERPROFILE\\.docker\\config.json\" /grant \"${env:USERNAME}:F\" ; wsl --shutdown\n" +
                    "```\n\n" +
                    "#### Step 3: Open Google Chrome to Download the Latest Docker Desktop or WSL Update\n" +
                    "If the engine fails to boot:\n" +
                    "1. Open **Google Chrome** and download the latest **WSL2 Linux Kernel Update** from Microsoft's official page: [learn.microsoft.com/en-us/windows/wsl/install](https://learn.microsoft.com/en-us/windows/wsl/install).\n" +
                    "2. Reinstall Docker Desktop from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).";
            newSteps.add(new RawDiagnosticStep(
                    "Grant User ACL on Docker Config & Restart WSL",
                    "Grant full user access to config.json and gracefully restart WSL2.",
                    "icacls \"$env:USERPROFILE\\.docker\\config.json\" /grant \"${env:USERNAME}:F\" ; wsl --shutdown"
            ));
        }
        // 9. Git / SSH / Version Control Access
        else if (fullText.contains("git") || fullText.contains("ssh") || fullText.contains("publickey") || fullText.contains("push rejected")) {
            citation = "SOP-DEV-018: Enterprise Git & SSH Key Configuration.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "A **`Permission denied (publickey)`** error means your local SSH agent cannot locate your private key or your public key has not been added to your remote repository account (GitHub / GitLab).\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Retrieve and Copy Your Local SSH Public Key\n" +
                    "Run this command to display your public key:\n" +
                    "```powershell\n" +
                    "Get-Content \"$env:USERPROFILE\\.ssh\\id_ed25519.pub\", \"$env:USERPROFILE\\.ssh\\id_rsa.pub\" -ErrorAction SilentlyContinue\n" +
                    "```\n\n" +
                    "#### Step 2: Open Google Chrome and Add Key to GitHub/GitLab\n" +
                    "1. Copy the public key text starting with `ssh-ed25519` or `ssh-rsa`.\n" +
                    "2. Open **Google Chrome** and go to [github.com/settings/keys](https://github.com/settings/keys).\n" +
                    "3. Click **New SSH key**, paste your key, and click **Add SSH key**.\n\n" +
                    "#### Step 3: Test the Connection\n" +
                    "```powershell\n" +
                    "ssh -vT git@github.com\n" +
                    "```";
            newSteps.add(new RawDiagnosticStep(
                    "Display SSH Public Key & Add to Account via Chrome",
                    "Open Chrome to GitHub/GitLab Settings > SSH Keys and paste your key.",
                    "Get-Content \"$env:USERPROFILE\\.ssh\\id_ed25519.pub\" -ErrorAction SilentlyContinue"
            ));
        }
        // 10. BitLocker & TPM (ONLY when specifically asking about BitLocker/TPM/Recovery Key)
        else if (fullText.contains("bitlocker") || fullText.contains("tpm") || fullText.contains("recovery key")) {
            citation = "SOP-SEC-003: Azure AD Intune BitLocker & TPM Diagnostics.pdf";
            reply = "### 🔍 BitLocker Recovery Instructions\n" +
                    "When Windows prompts for a 48-digit BitLocker recovery key, it can be retrieved securely from your company Microsoft Intune account.\n\n" +
                    "---\n\n" +
                    "### 🛠️ How to Retrieve Your Key\n" +
                    "1. Open **Google Chrome** on your mobile phone or another computer.\n" +
                    "2. Navigate to **`https://myaccount.microsoft.com/device-list`**.\n" +
                    "3. Sign in with your corporate Microsoft work account.\n" +
                    "4. Locate your laptop name and click **View BitLocker Keys**.\n" +
                    "5. Enter the 48-digit numerical key into the BitLocker prompt on your laptop.";
            newSteps.add(new RawDiagnosticStep(
                    "Retrieve BitLocker Key from Corporate Device Portal",
                    "Open https://myaccount.microsoft.com/device-list in a browser (or phone) and click View BitLocker Keys.",
                    "Get-BitLockerVolume -MountPoint 'C:'"
            ));
        }
        // 11. VPN & General Network Connectivity
        else if (fullText.contains("vpn") || fullText.contains("globalprotect") || fullText.contains("disconnect")) {
            citation = "SOP-NET-014: Corporate VPN & Remote Access Protocol.pdf (Section 3.2)";
            if (existingSteps.isEmpty()) {
                reply = "### 🔍 What Might Be Happening\n" +
                        "Frequent VPN disconnections usually happen due to home Wi-Fi MTU fragmentation, local DNS lease expiry, or residential firewall timeout rules.\n\n" +
                        "---\n\n" +
                        "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                        "#### Step 1: Check VPN Client Settings\n" +
                        "1. Open your VPN client (e.g. **GlobalProtect** or **Cisco AnyConnect**) from your system tray.\n" +
                        "2. Click the **Settings (Gear)** icon > **Troubleshooting**.\n" +
                        "3. Change the connection mode from **IPsec UDP** to **SSL Tunnel (TCP 443)**.\n\n" +
                        "#### Step 2: Flush DNS and Renew IP in Windows\n" +
                        "Run this command to clear stale routing tables:\n" +
                        "```powershell\n" +
                        "ipconfig /flushdns ; ipconfig /renew\n" +
                        "```\n\n" +
                        "#### Step 3: Restart Your Home Wi-Fi Router\n" +
                        "- Unplug your home router for 30 seconds and plug it back in to refresh your broadband gateway connection.";
                newSteps.add(new RawDiagnosticStep(
                        "Switch VPN Tunnel Mode & Flush DNS",
                        "Change VPN mode to SSL TCP 443 and run ipconfig /flushdns.",
                        "ipconfig /flushdns ; ipconfig /renew"
                ));
            } else {
                reply = "### 🔍 Gateway MTU Diagnostic\n" +
                        "Since the initial reset did not stabilize your VPN, let's verify local gateway packet loss and MTU fragmentation thresholds:\n\n" +
                        "```powershell\n" +
                        "ping -f -l 1472 8.8.8.8\n" +
                        "```";
                newSteps.add(new RawDiagnosticStep(
                        "Test Gateway MTU Threshold & Latency",
                        "Execute ping with the Don't Fragment flag to detect router MTU packet drops.",
                        "ping -f -l 1472 8.8.8.8"
                ));
            }
        }
        // 12. Outlook & Application Software
        else if (fullText.contains("outlook") || fullText.contains("email") || fullText.contains("teams") || fullText.contains("office") || fullText.contains("excel") || fullText.contains("word") || fullText.contains("0x8004")) {
            citation = "SOP-APP-009: Microsoft 365 Outlook & Teams Diagnostic SOP.docx";
            if (existingSteps.isEmpty()) {
                reply = "### 🔍 What Might Be Happening\n" +
                        "Outlook freezes, profile errors, or 'Loading Profile' hangups are typically caused by a corrupted offline data cache (`.ost`) or buggy third-party COM add-ins.\n\n" +
                        "---\n\n" +
                        "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                        "#### Step 1: Open Outlook in Safe Mode\n" +
                        "1. Press **`Windows Key + R`** on your keyboard to open the Run box.\n" +
                        "2. Type **`outlook.exe /safe`** and press Enter.\n" +
                        "3. If Outlook opens cleanly in Safe Mode, a third-party add-in is the cause. Go to **File** > **Options** > **Add-ins** > click **Go** and disable unnecessary add-ins.\n\n" +
                        "#### Step 2: Run Quick Repair in Windows Settings\n" +
                        "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                        "2. Go to **Apps** > **Installed apps**.\n" +
                        "3. Find **Microsoft 365 (Office)**, click the three dots (`...`), and select **Modify**.\n" +
                        "4. Choose **Quick Repair** and click **Repair**.";
                newSteps.add(new RawDiagnosticStep(
                        "Launch Outlook in Safe Mode",
                        "Press Win + R, type outlook.exe /safe and press Enter to bypass buggy add-ins.",
                        "outlook.exe /safe"
                ));
            } else {
                reply = "### 🔍 Safe Mode Diagnostic\n" +
                        "If the profile reset did not clear the store lock, let's launch Outlook in Safe Mode with hardware acceleration disabled:\n\n" +
                        "```powershell\n" +
                        "outlook.exe /safe\n" +
                        "```";
                newSteps.add(new RawDiagnosticStep(
                        "Start Outlook in Verified Safe Mode",
                        "Launches Outlook with all COM add-ins and cached hardware acceleration hooks bypassed.",
                        "outlook.exe /safe"
                ));
            }
        }
        // 13. System Sluggishness & High Resource Usage
        else if (fullText.contains("slow") || fullText.contains("freeze") || fullText.contains("high cpu") || fullText.contains("ram") || fullText.contains("memory") || fullText.contains("hang")) {
            citation = "SOP-SYS-004: Windows Performance Optimization & Diagnostics.pdf";
            reply = "### 🔍 What Might Be Happening\n" +
                    "System slowdowns and freezing are usually caused by a background app consuming 100% CPU/RAM, full disk storage, or pending Windows updates.\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Check Task Manager for Runaway Apps\n" +
                    "1. Press **`Ctrl + Shift + Esc`** on your keyboard to open **Task Manager**.\n" +
                    "2. Click on the **Processes** tab and click on the **CPU** or **Memory** header to sort apps by highest usage.\n" +
                    "3. If you see an app (like Chrome, Teams, or an unknown process) taking 80-100% of resources, click on it and click **End task** in the top-right corner.\n\n" +
                    "#### Step 2: Go to Windows Settings and Clear Temporary Storage\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Storage**.\n" +
                    "3. Click on **Temporary files**, check **Temporary files** and **DirectX Shader Cache**, and click **Remove files**.\n" +
                    "4. Make sure **Storage Sense** is toggled **ON** to automatically free up cache in the future.\n\n" +
                    "#### Step 3: Check Windows Update in Settings\n" +
                    "1. In **Settings**, click on **Windows Update** in the left sidebar.\n" +
                    "2. Click **Check for updates** and let Windows install any pending cumulative patches.\n" +
                    "3. Restart your laptop once updates finish installing.\n\n" +
                    "*(Optional Quick Command: Run a system file integrity check in PowerShell as Administrator):*\n" +
                    "```powershell\n" +
                    "sfc /scannow\n" +
                    "```";
            newSteps.add(new RawDiagnosticStep(
                    "Check Task Manager & Clear Storage in Settings",
                    "Open Task Manager (Ctrl+Shift+Esc) to close runaway apps, and go to Settings > System > Storage to delete temporary files.",
                    "ms-settings:storagesense"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Scan System Integrity (SFC Scan)",
                    "Scans Windows system files for corruption and repairs missing binaries.",
                    "sfc /scannow"
            ));
        }
        // 13. General Technical Inquiry (Fallback)
        else {
            citation = "SOP-GEN-001: General Enterprise IT Diagnostic Standard.pdf";
            reply = "### 🔍 Diagnostic Guidance\n" +
                    "I've received your inquiry. To resolve this issue quickly, let's follow standard IT resolution steps:\n\n" +
                    "---\n\n" +
                    "### 🛠️ Step-by-Step Resolution Guide\n\n" +
                    "#### Step 1: Run the Windows Built-in Troubleshooter in Settings\n" +
                    "1. Press **`Windows Key + I`** to open **Settings**.\n" +
                    "2. Go to **System** > **Troubleshoot** > **Other troubleshooters**.\n" +
                    "3. Find the category matching your issue (such as Network, Audio, Bluetooth, Printer, or Power) and click **Run**.\n" +
                    "4. Follow the on-screen prompts to apply the automatic fix.\n\n" +
                    "#### Step 2: Check Device Manager for Hardware Errors\n" +
                    "1. Press **`Windows Key + X`** and choose **Device Manager**.\n" +
                    "2. Look for any category with a yellow exclamation point (`⚠️`) or downward arrow (`⬇️`).\n" +
                    "3. Right-click the affected item, choose **Enable device** or **Update driver**.\n\n" +
                    "#### Step 3: Open Google Chrome and Update Manufacturer Drivers\n" +
                    "1. Open **Google Chrome** and visit your laptop brand's support site (Dell Support, HP Support, or Lenovo Support).\n" +
                    "2. Enter your serial number or Service Tag, click **Drivers & Downloads**, and run the **Automatic Driver Scan** to install all missing firmware and drivers.\n\n" +
                    "#### Step 4: Restart Your Computer\n" +
                    "- Click the **Start menu** > click the **Power** icon > select **Restart** (this clears temporary system memory and reloads all hardware device drivers).";
            newSteps.add(new RawDiagnosticStep(
                    "Run Windows Troubleshooter in Settings",
                    "Press Win + I > System > Troubleshoot > Other troubleshooters > Run the appropriate diagnostic tool.",
                    "ms-settings:troubleshoot"
            ));
            newSteps.add(new RawDiagnosticStep(
                    "Check Device Manager & Restart Computer",
                    "Press Win + X > Device Manager to inspect driver states, then perform a clean computer restart.",
                    "devmgmt.msc"
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
