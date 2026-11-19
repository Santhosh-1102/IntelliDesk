package com.intellidesk.dto.ticket;

import jakarta.validation.constraints.NotBlank;

public class AddTicketCommentRequest {

    @NotBlank(message = "Comment message cannot be empty")
    private String message;

    private boolean isInternalNote = false;

    public AddTicketCommentRequest() {}

    public AddTicketCommentRequest(String message, boolean isInternalNote) {
        this.message = message;
        this.isInternalNote = isInternalNote;
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
}
