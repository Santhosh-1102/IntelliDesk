package com.intellidesk.dto.ai;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AiConversationDetailResponse {

    private String sessionId;
    private String initialQuery;
    private String identifiedCategory;
    private String status;
    private Instant startedAt;
    private Instant endedAt;
    private List<AiMessageDto> messages = new ArrayList<>();
    private List<DiagnosticStepDto> steps = new ArrayList<>();
    private String escalatedTicketNumber;

    public AiConversationDetailResponse() {}

    public AiConversationDetailResponse(String sessionId, String initialQuery, String identifiedCategory, String status, Instant startedAt, Instant endedAt) {
        this.sessionId = sessionId;
        this.initialQuery = initialQuery;
        this.identifiedCategory = identifiedCategory;
        this.status = status;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getInitialQuery() {
        return initialQuery;
    }

    public void setInitialQuery(String initialQuery) {
        this.initialQuery = initialQuery;
    }

    public String getIdentifiedCategory() {
        return identifiedCategory;
    }

    public void setIdentifiedCategory(String identifiedCategory) {
        this.identifiedCategory = identifiedCategory;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public List<AiMessageDto> getMessages() {
        return messages;
    }

    public void setMessages(List<AiMessageDto> messages) {
        this.messages = messages;
    }

    public List<DiagnosticStepDto> getSteps() {
        return steps;
    }

    public void setSteps(List<DiagnosticStepDto> steps) {
        this.steps = steps;
    }

    public String getEscalatedTicketNumber() {
        return escalatedTicketNumber;
    }

    public void setEscalatedTicketNumber(String escalatedTicketNumber) {
        this.escalatedTicketNumber = escalatedTicketNumber;
    }
}
