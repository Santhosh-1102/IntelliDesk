package com.intellidesk.entity;

import com.intellidesk.entity.enums.ConversationStatus;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_conversations")
public class AiConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, unique = true, length = 64)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "initial_query", nullable = false, columnDefinition = "TEXT")
    private String initialQuery;

    @Column(name = "identified_category", length = 60)
    private String identifiedCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConversationStatus status = ConversationStatus.ACTIVE;

    @Column(name = "started_at", updatable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "ended_at")
    private Instant endedAt;

    public AiConversation() {}

    public AiConversation(String sessionId, User user, String initialQuery) {
        this.sessionId = sessionId;
        this.user = user;
        this.initialQuery = initialQuery;
        this.status = ConversationStatus.ACTIVE;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public ConversationStatus getStatus() {
        return status;
    }

    public void setStatus(ConversationStatus status) {
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
}
