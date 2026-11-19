package com.intellidesk.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ticket_messages")
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_internal_note", nullable = false)
    private boolean isInternalNote = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public TicketMessage() {}

    public TicketMessage(Ticket ticket, User sender, String message, boolean isInternalNote) {
        this.ticket = ticket;
        this.sender = sender;
        this.message = message;
        this.isInternalNote = isInternalNote;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isInternalNote() {
        return isInternalNote;
    }

    public void setInternalNote(boolean internalNote) {
        isInternalNote = internalNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
