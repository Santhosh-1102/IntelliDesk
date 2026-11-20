package com.intellidesk.service;

import com.intellidesk.dto.ai.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AiTroubleshootingService {

    AiChatResponse sendMessage(Long userId, AiChatRequest request);

    AiChatResponse submitStepFeedback(Long userId, StepFeedbackRequest request);

    AiChatResponse escalateSession(Long userId, EscalateSessionRequest request);

    Page<AiSessionSummaryResponse> getUserSessions(Long userId, Pageable pageable);

    AiConversationDetailResponse getSessionDetails(Long userId, String sessionId);
}
