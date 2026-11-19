package com.intellidesk.dto.ticket;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {

    @NotNull(message = "Engineer ID is required")
    private Long engineerId;

    private String notes;

    public AssignTicketRequest() {}

    public AssignTicketRequest(Long engineerId, String notes) {
        this.engineerId = engineerId;
        this.notes = notes;
    }

    public Long getEngineerId() {
        return engineerId;
    }

    public void setEngineerId(Long engineerId) {
        this.engineerId = engineerId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
