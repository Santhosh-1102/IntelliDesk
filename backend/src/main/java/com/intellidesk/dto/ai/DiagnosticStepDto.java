package com.intellidesk.dto.ai;

public class DiagnosticStepDto {

    private Long id;
    private Integer stepNumber;
    private String title;
    private String instructions;
    private String commandToRun;
    private String status;
    private String userFeedback;

    public DiagnosticStepDto() {}

    public DiagnosticStepDto(Long id, Integer stepNumber, String title, String instructions, String commandToRun, String status, String userFeedback) {
        this.id = id;
        this.stepNumber = stepNumber;
        this.title = title;
        this.instructions = instructions;
        this.commandToRun = commandToRun;
        this.status = status;
        this.userFeedback = userFeedback;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getCommandToRun() {
        return commandToRun;
    }

    public void setCommandToRun(String commandToRun) {
        this.commandToRun = commandToRun;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUserFeedback() {
        return userFeedback;
    }

    public void setUserFeedback(String userFeedback) {
        this.userFeedback = userFeedback;
    }
}
