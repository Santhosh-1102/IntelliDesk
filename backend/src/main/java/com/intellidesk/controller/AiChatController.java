package com.intellidesk.controller;

import com.intellidesk.dto.ai.*;
import com.intellidesk.security.UserDetailsImpl;
import com.intellidesk.service.AiTroubleshootingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiTroubleshootingService aiTroubleshootingService;

    public AiChatController(AiTroubleshootingService aiTroubleshootingService) {
        this.aiTroubleshootingService = aiTroubleshootingService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> sendMessage(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        AiChatResponse response = aiTroubleshootingService.sendMessage(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/steps/feedback")
    public ResponseEntity<AiChatResponse> submitStepFeedback(
            @Valid @RequestBody StepFeedbackRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        AiChatResponse response = aiTroubleshootingService.submitStepFeedback(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalate")
    public ResponseEntity<AiChatResponse> escalateSession(
            @Valid @RequestBody EscalateSessionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        AiChatResponse response = aiTroubleshootingService.escalateSession(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<Page<AiSessionSummaryResponse>> getUserSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startedAt").descending());
        Page<AiSessionSummaryResponse> sessions = aiTroubleshootingService.getUserSessions(userDetails.getId(), pageable);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<AiConversationDetailResponse> getSessionDetails(
            @PathVariable String sessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        AiConversationDetailResponse details = aiTroubleshootingService.getSessionDetails(userDetails.getId(), sessionId);
        return ResponseEntity.ok(details);
    }
}
