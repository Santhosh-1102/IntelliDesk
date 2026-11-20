package com.intellidesk.dto.ai;

import java.time.Instant;

public class AiMessageDto {

    private Long id;
    private String senderType; // USER, ASSISTANT, SYSTEM
    private String content;
    private String contextCitations;
    private String imageData;
    private Instant createdAt;

    public AiMessageDto() {}

    public AiMessageDto(Long id, String senderType, String content, String contextCitations, Instant createdAt) {
        this.id = id;
        this.senderType = senderType;
        this.content = content;
        this.contextCitations = contextCitations;
        this.createdAt = createdAt;
    }

    public AiMessageDto(Long id, String senderType, String content, String contextCitations, String imageData, Instant createdAt) {
        this.id = id;
        this.senderType = senderType;
        this.content = content;
        this.contextCitations = contextCitations;
        this.imageData = imageData;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContextCitations() {
        return contextCitations;
    }

    public void setContextCitations(String contextCitations) {
        this.contextCitations = contextCitations;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
