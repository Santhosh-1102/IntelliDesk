package com.intellidesk.dto.ai;

public class DiagnosticHandoverDto {

    private String executiveSummary;
    private String rootCauseHypothesis;
    private String attemptedDiagnostics;
    private String recommendedTier2Actions;
    private String suggestedPriority;
    private String suggestedCategory;

    public DiagnosticHandoverDto() {}

    public DiagnosticHandoverDto(
            String executiveSummary,
            String rootCauseHypothesis,
            String attemptedDiagnostics,
            String recommendedTier2Actions,
            String suggestedPriority,
            String suggestedCategory
    ) {
        this.executiveSummary = executiveSummary;
        this.rootCauseHypothesis = rootCauseHypothesis;
        this.attemptedDiagnostics = attemptedDiagnostics;
        this.recommendedTier2Actions = recommendedTier2Actions;
        this.suggestedPriority = suggestedPriority;
        this.suggestedCategory = suggestedCategory;
    }

    public String getExecutiveSummary() {
        return executiveSummary;
    }

    public void setExecutiveSummary(String executiveSummary) {
        this.executiveSummary = executiveSummary;
    }

    public String getRootCauseHypothesis() {
        return rootCauseHypothesis;
    }

    public void setRootCauseHypothesis(String rootCauseHypothesis) {
        this.rootCauseHypothesis = rootCauseHypothesis;
    }

    public String getAttemptedDiagnostics() {
        return attemptedDiagnostics;
    }

    public void setAttemptedDiagnostics(String attemptedDiagnostics) {
        this.attemptedDiagnostics = attemptedDiagnostics;
    }

    public String getRecommendedTier2Actions() {
        return recommendedTier2Actions;
    }

    public void setRecommendedTier2Actions(String recommendedTier2Actions) {
        this.recommendedTier2Actions = recommendedTier2Actions;
    }

    public String getSuggestedPriority() {
        return suggestedPriority;
    }

    public void setSuggestedPriority(String suggestedPriority) {
        this.suggestedPriority = suggestedPriority;
    }

    public String getSuggestedCategory() {
        return suggestedCategory;
    }

    public void setSuggestedCategory(String suggestedCategory) {
        this.suggestedCategory = suggestedCategory;
    }
}
