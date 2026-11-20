package com.intellidesk.dto.ai;

import jakarta.validation.constraints.NotBlank;

public class EscalateSessionRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    private String priority; // Optional user preference (e.g. HIGH, CRITICAL, or default auto-calculated)

    private String additionalNotes;

    public EscalateSessionRequest() {}

    public EscalateSessionRequest(String sessionId, String priority, String additionalNotes) {
        this.sessionId = sessionId;
        this.priority = priority;
        this.additionalNotes = additionalNotes;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
}
