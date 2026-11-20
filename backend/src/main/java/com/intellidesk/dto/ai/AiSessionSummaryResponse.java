package com.intellidesk.dto.ai;

import java.time.Instant;

public class AiSessionSummaryResponse {

    private String sessionId;
    private String initialQuery;
    private String identifiedCategory;
    private String status;
    private Instant startedAt;
    private Instant endedAt;
    private int messageCount;
    private String escalatedTicketNumber;

    public AiSessionSummaryResponse() {}

    public AiSessionSummaryResponse(String sessionId, String initialQuery, String identifiedCategory, String status, Instant startedAt, Instant endedAt, int messageCount, String escalatedTicketNumber) {
        this.sessionId = sessionId;
        this.initialQuery = initialQuery;
        this.identifiedCategory = identifiedCategory;
        this.status = status;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.messageCount = messageCount;
        this.escalatedTicketNumber = escalatedTicketNumber;
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

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public String getEscalatedTicketNumber() {
        return escalatedTicketNumber;
    }

    public void setEscalatedTicketNumber(String escalatedTicketNumber) {
        this.escalatedTicketNumber = escalatedTicketNumber;
    }
}
