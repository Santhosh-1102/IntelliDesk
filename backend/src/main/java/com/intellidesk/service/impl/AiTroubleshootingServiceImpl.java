package com.intellidesk.service.impl;

import com.intellidesk.dto.ai.*;
import com.intellidesk.dto.knowledge.RelevantChunkDto;
import com.intellidesk.entity.*;
import com.intellidesk.entity.enums.*;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.*;
import com.intellidesk.service.AiTroubleshootingService;
import com.intellidesk.service.KnowledgeDocumentService;
import com.intellidesk.utils.TicketNumberGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.model.Media;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import java.util.Base64;

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
    private final KnowledgeDocumentService knowledgeDocumentService;

    public AiTroubleshootingServiceImpl(
            AiConversationRepository conversationRepository,
            AiMessageRepository messageRepository,
            TroubleshootingStepRepository stepRepository,
            UserRepository userRepository,
            TicketRepository ticketRepository,
            TicketCategoryRepository categoryRepository,
            TicketHistoryRepository historyRepository,
            ObjectProvider<ChatClient> chatClientProvider,
            KnowledgeDocumentService knowledgeDocumentService
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.stepRepository = stepRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.categoryRepository = categoryRepository;
        this.historyRepository = historyRepository;
        this.chatClientProvider = chatClientProvider;
        this.knowledgeDocumentService = knowledgeDocumentService;
    }

    @Override
    @Transactional
    public AiChatResponse sendMessage(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String rawMsg = request.getMessage();
        boolean hasImage = request.getImageBase64() != null && !request.getImageBase64().isBlank();
        String messageText = (rawMsg != null && !rawMsg.isBlank()) ? rawMsg.trim() :
                (hasImage ? "Please inspect the attached screenshot / photo and diagnose the issue." : "");
        if (messageText.isBlank()) {
            throw new BadRequestException("Message content or an attached screenshot/photo is required");
        }

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
            String initialQuery = messageText;
            conversation = new AiConversation(newSessionId, user, initialQuery);
            conversation = conversationRepository.save(conversation);
            isNewSession = true;
        }

        // Save User Message
        AiMessage userMsg = new AiMessage(conversation, SenderType.USER, messageText);
        if (hasImage) {
            userMsg.setImageData(request.getImageBase64());
        }
        messageRepository.save(userMsg);

        // Classify domain and generate response
        String category = classifyDomain(conversation.getInitialQuery(), messageText);
        conversation.setIdentifiedCategory(category);

        // Fetch conversation history
        List<AiMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
        List<TroubleshootingStep> existingSteps = stepRepository.findByConversationIdOrderByStepNumberAsc(conversation.getId());

        // Generate AI diagnostic response and steps
        DiagnosticPlan plan = generateDiagnosticPlan(
                conversation,
                messageText,
                request.getImageBase64(),
                request.getImageMimeType(),
                history,
                existingSteps
        );

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
        response.setCitation(plan.getCitation());
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
                .map(m -> new AiMessageDto(m.getId(), m.getSenderType().name(), m.getContent(), m.getContextCitations(), m.getImageData(), m.getCreatedAt()))
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
            String imageBase64,
            String imageMimeType,
            List<AiMessage> history,
            List<TroubleshootingStep> existingSteps
    ) {
        // 1. RAG Retrieval: Dynamically retrieve verified enterprise SOP knowledge base chunks
        List<RelevantChunkDto> relevantChunks = Collections.emptyList();
        try {
            relevantChunks = knowledgeDocumentService.searchRelevantChunks(userMessage, 3);
            if (relevantChunks.isEmpty() && conversation.getInitialQuery() != null && !conversation.getInitialQuery().equalsIgnoreCase(userMessage)) {
                relevantChunks = knowledgeDocumentService.searchRelevantChunks(conversation.getInitialQuery(), 3);
            }
        } catch (Exception e) {
            log.warn("Knowledge Base RAG retrieval encountered an issue: {}", e.getMessage());
        }

        String citation = null;
        if (!relevantChunks.isEmpty()) {
            citation = relevantChunks.stream()
                    .map(c -> c.getDocumentTitle() + " (Chunk #" + c.getChunkIndex() + ")")
                    .distinct()
                    .collect(Collectors.joining(", "));
        } else {
            citation = "Google Gemini 3.5 Flash";
        }

        // 2. Use Spring AI ChatClient with connected Google Gemini LLM
        ChatClient chatClient = chatClientProvider.getIfAvailable();
        if (chatClient != null) {
            try {
                boolean hasImage = imageBase64 != null && !imageBase64.isBlank();
                String promptText = buildPrompt(conversation, userMessage, history, hasImage, relevantChunks);
                String aiReply;

                if (hasImage) {
                    // Extract Base64 bytes & MIME type
                    String rawBase64 = imageBase64;
                    String mimeStr = (imageMimeType != null && !imageMimeType.isBlank()) ? imageMimeType : "image/jpeg";
                    if (rawBase64.contains(",")) {
                        String prefix = rawBase64.substring(0, rawBase64.indexOf(","));
                        if (prefix.contains("image/")) {
                            int start = prefix.indexOf("image/");
                            int end = prefix.indexOf(";", start);
                            if (end > start) {
                                mimeStr = prefix.substring(start, end);
                            }
                        }
                        rawBase64 = rawBase64.substring(rawBase64.indexOf(",") + 1);
                    }
                    byte[] imageBytes = Base64.getDecoder().decode(rawBase64.trim());
                    MimeType mimeType = MimeTypeUtils.parseMimeType(mimeStr);
                    Media media = new Media(mimeType, imageBytes);

                    log.info("Dispatching multimodal vision prompt with image ({} bytes, mime={}) to Gemini model for session: {}",
                            imageBytes.length, mimeType, conversation.getSessionId());

                    aiReply = chatClient.prompt()
                            .user(u -> u.text(promptText).media(media))
                            .call()
                            .content();
                } else {
                    aiReply = chatClient.prompt()
                            .user(promptText)
                            .call()
                            .content();
                }

                if (aiReply != null && !aiReply.isBlank()) {
                    log.info("Successfully generated dynamic AI response from Gemini model for session: {} (RAG cited: {})",
                            conversation.getSessionId(), citation);
                    List<RawDiagnosticStep> steps = extractStepsFromReply(aiReply, conversation.getIdentifiedCategory());
                    return new DiagnosticPlan(aiReply, citation, 0.98, steps);
                }
            } catch (Exception e) {
                log.warn("Spring AI ChatClient call failed: {}", e.getMessage(), e);
            }
        }

        // Resilient lightweight fallback if external AI connection is momentarily unreachable
        String fallbackReply = "### ⚠️ Diagnostic Service Temporarily Offline\n\n" +
                "I am currently experiencing a momentary interruption reaching the AI reasoning service.\n\n" +
                "**Recommended actions:**\n" +
                "- Click **\"Convert to Human Ticket\"** above to immediately route your issue to an IT support engineer.\n" +
                "- Or wait a few moments and resend your inquiry.";

        List<RawDiagnosticStep> fallbackSteps = List.of(
                new RawDiagnosticStep(
                        "Escalate Incident to Human IT Support Engineer",
                        "Click 'Convert to Support Ticket' to route this issue to human IT support with your full diagnostic context.",
                        null
                )
        );
        return new DiagnosticPlan(fallbackReply, citation != null ? citation : "IntelliDesk Fallback Service", 0.50, fallbackSteps);
    }

    private String buildPrompt(AiConversation conversation, String userMessage, List<AiMessage> history, boolean hasImage, List<RelevantChunkDto> relevantChunks) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are the IntelliDesk Enterprise IT AI Specialist. Guide enterprise employees step-by-step with practical, user-friendly instructions:\n");
        sb.append("Formatting & Communication Style:\n");
        sb.append("- Explain what is happening in simple, clear, conversational terms (like a friendly, expert colleague).\n");
        sb.append("- Structure your solution with clean Markdown headings, bullet points, and numbered steps.\n");
        if (hasImage) {
            sb.append("- VISUAL INSPECTION DIRECTIVE: An image/photo or screenshot has been provided by the user. Carefully inspect it. Specifically identify any on-screen error dialogs, error codes, application crashes, visual hardware artifacts (such as green/pink/black vertical or horizontal lines, screen flickering, discoloration, physical damage), taskbar status, or Device Manager warnings visible in the image. State clearly what you observe in the image and provide tailored, accurate diagnosis based on the visual evidence.\n");
        }
        sb.append("- For software/configuration issues: guide them step-by-step through Windows Settings (exact paths like 'Press Win + I > System > Display > Multiple displays > Detect').\n");
        sb.append("- Guide them through Device Manager when relevant (Win + X > Device Manager > expand category > update/reinstall driver).\n");
        sb.append("- Guide them to open Google Chrome and download official drivers from their manufacturer (Dell, HP, Lenovo, Intel, etc.) when needed.\n");
        sb.append("- For physical hardware defects (e.g. green or pink lines on a laptop screen, cracked panel, liquid spill, broken keycap): clearly explain that this is a physical hardware defect that cannot be fixed by software. Give them a quick 30-second BIOS test (tap F2/F12 on reboot) or external monitor test to confirm, and recommend clicking 'Convert to Support Ticket' so the IT hardware team can replace the screen or part.\n");
        sb.append("- If terminal/PowerShell commands are helpful, format them in a ```powershell code block.\n");
        sb.append("- Address the user's latest query directly without repeating past points.\n\n");

        // Inject RAG SOP chunks if available
        if (relevantChunks != null && !relevantChunks.isEmpty()) {
            sb.append("## Verified Corporate Standard Operating Procedures (SOPs):\n");
            sb.append("The following official enterprise SOP chunks were dynamically retrieved from the knowledge base for this issue:\n\n");
            for (RelevantChunkDto chunk : relevantChunks) {
                sb.append("--- [Document: ").append(chunk.getDocumentTitle())
                        .append(" | Category: ").append(chunk.getCategory())
                        .append(" | Chunk #").append(chunk.getChunkIndex()).append("] ---\n");
                sb.append(chunk.getChunkContent().trim()).append("\n\n");
            }
            sb.append("CRITICAL INSTRUCTION: You MUST prioritize and incorporate the official policies, troubleshooting steps, URLs, and commands specified in the Verified Corporate SOPs above into your solution. Accurately cite the SOP title when referring to corporate guidelines.\n\n");
        }

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
