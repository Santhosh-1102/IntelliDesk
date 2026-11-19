package com.intellidesk.dto.ticket;

import com.intellidesk.entity.TicketHistory;

import java.time.Instant;

public class TicketHistoryResponse {

    private Long id;
    private Long ticketId;
    private Long changedById;
    private String changedByName;
    private String fieldChanged;
    private String oldValue;
    private String newValue;
    private String comment;
    private Instant createdAt;

    public TicketHistoryResponse() {}

    public static TicketHistoryResponse fromEntity(TicketHistory history) {
        TicketHistoryResponse dto = new TicketHistoryResponse();
        dto.setId(history.getId());
        dto.setTicketId(history.getTicket().getId());
        dto.setChangedById(history.getChangedBy().getId());
        dto.setChangedByName(history.getChangedBy().getFirstName() + " " + history.getChangedBy().getLastName());
        dto.setFieldChanged(history.getFieldChanged());
        dto.setOldValue(history.getOldValue());
        dto.setNewValue(history.getNewValue());
        dto.setComment(history.getComment());
        dto.setCreatedAt(history.getCreatedAt());
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

    public Long getChangedById() {
        return changedById;
    }

    public void setChangedById(Long changedById) {
        this.changedById = changedById;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getFieldChanged() {
        return fieldChanged;
    }

    public void setFieldChanged(String fieldChanged) {
        this.fieldChanged = fieldChanged;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
