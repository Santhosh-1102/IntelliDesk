package com.intellidesk.dto.ai;

import java.util.ArrayList;
import java.util.List;

public class AiChatResponse {

    private String sessionId;
    private String reply;
    private String identifiedCategory;
    private Double confidenceScore;
    private List<DiagnosticStepDto> steps = new ArrayList<>();
    private boolean canEscalate = true;
    private boolean isResolved = false;
    private String escalatedTicketNumber;

    public AiChatResponse() {}

    public AiChatResponse(String sessionId, String reply, String identifiedCategory, Double confidenceScore) {
        this.sessionId = sessionId;
        this.reply = reply;
        this.identifiedCategory = identifiedCategory;
        this.confidenceScore = confidenceScore;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getIdentifiedCategory() {
        return identifiedCategory;
    }

    public void setIdentifiedCategory(String identifiedCategory) {
        this.identifiedCategory = identifiedCategory;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public List<DiagnosticStepDto> getSteps() {
        return steps;
    }

    public void setSteps(List<DiagnosticStepDto> steps) {
        this.steps = steps;
    }

    public boolean isCanEscalate() {
        return canEscalate;
    }

    public void setCanEscalate(boolean canEscalate) {
        this.canEscalate = canEscalate;
    }

    public boolean isResolved() {
        return isResolved;
    }

    public void setResolved(boolean resolved) {
        isResolved = resolved;
    }

    public String getEscalatedTicketNumber() {
        return escalatedTicketNumber;
    }

    public void setEscalatedTicketNumber(String escalatedTicketNumber) {
        this.escalatedTicketNumber = escalatedTicketNumber;
    }
}
