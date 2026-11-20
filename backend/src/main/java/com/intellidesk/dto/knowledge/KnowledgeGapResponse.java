package com.intellidesk.dto.knowledge;

import java.time.Instant;

public class KnowledgeGapResponse {

    private Long conversationId;
    private String sessionId;
    private String query;
    private String category;
    private Instant occurredAt;
    private String status;
    private String escalatedTicketNumber;
    private String suggestedAction;

    public KnowledgeGapResponse() {}

    public KnowledgeGapResponse(
            Long conversationId,
            String sessionId,
            String query,
            String category,
            Instant occurredAt,
            String status,
            String escalatedTicketNumber,
            String suggestedAction
    ) {
        this.conversationId = conversationId;
        this.sessionId = sessionId;
        this.query = query;
        this.category = category;
        this.occurredAt = occurredAt;
        this.status = status;
        this.escalatedTicketNumber = escalatedTicketNumber;
        this.suggestedAction = suggestedAction;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEscalatedTicketNumber() {
        return escalatedTicketNumber;
    }

    public void setEscalatedTicketNumber(String escalatedTicketNumber) {
        this.escalatedTicketNumber = escalatedTicketNumber;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }
}
