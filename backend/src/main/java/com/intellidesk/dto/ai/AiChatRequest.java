package com.intellidesk.dto.ai;

public class AiChatRequest {

    private String sessionId; // Optional: If null/blank, backend starts a new conversation session

    private String message;

    private String categoryHint;

    private String imageBase64; // Optional: Base64-encoded image data or data URI

    private String imageMimeType; // e.g. "image/png", "image/jpeg"

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

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImageMimeType() {
        return imageMimeType;
    }

    public void setImageMimeType(String imageMimeType) {
        this.imageMimeType = imageMimeType;
    }
}
