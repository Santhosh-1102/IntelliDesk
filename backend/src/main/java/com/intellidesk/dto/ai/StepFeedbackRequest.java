package com.intellidesk.dto.ai;

import jakarta.validation.constraints.NotNull;

public class StepFeedbackRequest {

    @NotNull(message = "Step ID is required")
    private Long stepId;

    @NotNull(message = "Feedback status (worked) is required")
    private Boolean worked;

    private String userNotes;

    public StepFeedbackRequest() {}

    public StepFeedbackRequest(Long stepId, Boolean worked, String userNotes) {
        this.stepId = stepId;
        this.worked = worked;
        this.userNotes = userNotes;
    }

    public Long getStepId() {
        return stepId;
    }

    public void setStepId(Long stepId) {
        this.stepId = stepId;
    }

    public Boolean getWorked() {
        return worked;
    }

    public void setWorked(Boolean worked) {
        this.worked = worked;
    }

    public String getUserNotes() {
        return userNotes;
    }

    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }
}
