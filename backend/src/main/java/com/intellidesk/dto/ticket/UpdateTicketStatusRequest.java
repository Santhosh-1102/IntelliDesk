package com.intellidesk.dto.ticket;

import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTicketStatusRequest {

    @NotNull(message = "Ticket status is required")
    private TicketStatus status;

    private TicketPriority priority; // Optional, if also updating priority

    private String resolutionNotes;

    private String rootCause;

    private String comment; // Reason or note for the status transition

    public UpdateTicketStatusRequest() {}

    public UpdateTicketStatusRequest(TicketStatus status, String resolutionNotes, String rootCause) {
        this.status = status;
        this.resolutionNotes = resolutionNotes;
        this.rootCause = rootCause;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
