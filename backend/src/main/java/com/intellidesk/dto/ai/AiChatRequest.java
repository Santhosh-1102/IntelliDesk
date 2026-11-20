package com.intellidesk.dto.ai;

import jakarta.validation.constraints.NotBlank;

public class AiChatRequest {

    private String sessionId; // Optional: If null/blank, backend starts a new conversation session

    @NotBlank(message = "Message content is required")
    private String message;

    private String categoryHint;

    public AiChatRequest() {}

    public AiChatRequest(String sessionId, String message) {
        this.sessionId = sessionId;
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCategoryHint() {
        return categoryHint;
    }

    public void setCategoryHint(String categoryHint) {
        this.categoryHint = categoryHint;
    }
}
