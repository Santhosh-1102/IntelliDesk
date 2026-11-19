package com.intellidesk.dto.ticket;

import com.intellidesk.entity.TicketMessage;

import java.time.Instant;

public class TicketCommentResponse {

    private Long id;
    private Long ticketId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String message;
    private boolean isInternalNote;
    private Instant createdAt;

    public TicketCommentResponse() {}

    public static TicketCommentResponse fromEntity(TicketMessage message) {
        TicketCommentResponse dto = new TicketCommentResponse();
        dto.setId(message.getId());
        dto.setTicketId(message.getTicket().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setMessage(message.getMessage());
        dto.setInternalNote(message.isInternalNote());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
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
