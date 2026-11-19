package com.intellidesk.entity;

import com.intellidesk.entity.enums.SenderType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_messages")
public class AiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiConversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 20)
    private SenderType senderType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "context_citations", columnDefinition = "TEXT")
    private String contextCitations;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public AiMessage() {}

    public AiMessage(AiConversation conversation, SenderType senderType, String content) {
        this.conversation = conversation;
        this.senderType = senderType;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AiConversation getConversation() {
        return conversation;
    }

    public void setConversation(AiConversation conversation) {
        this.conversation = conversation;
    }

    public SenderType getSenderType() {
        return senderType;
    }

    public void setSenderType(SenderType senderType) {
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
