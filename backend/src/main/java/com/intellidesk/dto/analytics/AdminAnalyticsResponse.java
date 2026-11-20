package com.intellidesk.dto.analytics;

import java.util.List;
import java.util.Map;

public class AdminAnalyticsResponse {

    // Ticket Volumes
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long criticalTickets;
    private long highTickets;
    private long mediumTickets;
    private long lowTickets;

    // AI Deflection Metrics
    private long aiTotalConversations;
    private long aiSelfResolvedConversations;
    private long aiEscalatedConversations;
    private long aiActiveConversations;
    private double aiDeflectionRate;

    // SLA Telemetry
    private long slaTrackedCount;
    private long slaBreachedCount;
    private long slaNearBreachCount;
    private double slaComplianceRate;

    // Mean Time to Resolution (MTTR)
    private double meanTimeToResolveMinutes;
    private String formattedMttr;

    // Breakdown Distributions
    private List<CategoryMetricDto> categoryBreakdown;
    private Map<String, Long> priorityBreakdown;
    private List<EngineerWorkloadDto> engineerWorkloads;
    private List<SlaBreachTicketDto> urgentSlaTickets;

    public AdminAnalyticsResponse() {}

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getOpenTickets() {
        return openTickets;
    }

    public void setOpenTickets(long openTickets) {
        this.openTickets = openTickets;
    }

    public long getInProgressTickets() {
        return inProgressTickets;
    }

    public void setInProgressTickets(long inProgressTickets) {
        this.inProgressTickets = inProgressTickets;
    }

    public long getResolvedTickets() {
        return resolvedTickets;
    }

    public void setResolvedTickets(long resolvedTickets) {
        this.resolvedTickets = resolvedTickets;
    }

    public long getClosedTickets() {
        return closedTickets;
    }

    public void setClosedTickets(long closedTickets) {
        this.closedTickets = closedTickets;
    }

    public long getCriticalTickets() {
        return criticalTickets;
    }

    public void setCriticalTickets(long criticalTickets) {
        this.criticalTickets = criticalTickets;
    }

    public long getHighTickets() {
        return highTickets;
    }

    public void setHighTickets(long highTickets) {
        this.highTickets = highTickets;
    }

    public long getMediumTickets() {
        return mediumTickets;
    }

    public void setMediumTickets(long mediumTickets) {
        this.mediumTickets = mediumTickets;
    }

    public long getLowTickets() {
        return lowTickets;
    }

    public void setLowTickets(long lowTickets) {
        this.lowTickets = lowTickets;
    }

    public long getAiTotalConversations() {
        return aiTotalConversations;
    }

    public void setAiTotalConversations(long aiTotalConversations) {
        this.aiTotalConversations = aiTotalConversations;
    }

    public long getAiSelfResolvedConversations() {
        return aiSelfResolvedConversations;
    }

    public void setAiSelfResolvedConversations(long aiSelfResolvedConversations) {
        this.aiSelfResolvedConversations = aiSelfResolvedConversations;
    }

    public long getAiEscalatedConversations() {
        return aiEscalatedConversations;
    }

    public void setAiEscalatedConversations(long aiEscalatedConversations) {
        this.aiEscalatedConversations = aiEscalatedConversations;
    }

    public long getAiActiveConversations() {
        return aiActiveConversations;
    }

    public void setAiActiveConversations(long aiActiveConversations) {
        this.aiActiveConversations = aiActiveConversations;
    }

    public double getAiDeflectionRate() {
        return aiDeflectionRate;
    }

    public void setAiDeflectionRate(double aiDeflectionRate) {
        this.aiDeflectionRate = aiDeflectionRate;
    }

    public long getSlaTrackedCount() {
        return slaTrackedCount;
    }

    public void setSlaTrackedCount(long slaTrackedCount) {
        this.slaTrackedCount = slaTrackedCount;
    }

    public long getSlaBreachedCount() {
        return slaBreachedCount;
    }

    public void setSlaBreachedCount(long slaBreachedCount) {
        this.slaBreachedCount = slaBreachedCount;
    }

    public long getSlaNearBreachCount() {
        return slaNearBreachCount;
    }

    public void setSlaNearBreachCount(long slaNearBreachCount) {
        this.slaNearBreachCount = slaNearBreachCount;
    }

    public double getSlaComplianceRate() {
        return slaComplianceRate;
    }

    public void setSlaComplianceRate(double slaComplianceRate) {
        this.slaComplianceRate = slaComplianceRate;
    }

    public double getMeanTimeToResolveMinutes() {
        return meanTimeToResolveMinutes;
    }

    public void setMeanTimeToResolveMinutes(double meanTimeToResolveMinutes) {
        this.meanTimeToResolveMinutes = meanTimeToResolveMinutes;
    }

    public String getFormattedMttr() {
        return formattedMttr;
    }

    public void setFormattedMttr(String formattedMttr) {
        this.formattedMttr = formattedMttr;
    }

    public List<CategoryMetricDto> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryMetricDto> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public Map<String, Long> getPriorityBreakdown() {
        return priorityBreakdown;
    }

    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) {
        this.priorityBreakdown = priorityBreakdown;
    }

    public List<EngineerWorkloadDto> getEngineerWorkloads() {
        return engineerWorkloads;
    }

    public void setEngineerWorkloads(List<EngineerWorkloadDto> engineerWorkloads) {
        this.engineerWorkloads = engineerWorkloads;
    }

    public List<SlaBreachTicketDto> getUrgentSlaTickets() {
        return urgentSlaTickets;
    }

    public void setUrgentSlaTickets(List<SlaBreachTicketDto> urgentSlaTickets) {
        this.urgentSlaTickets = urgentSlaTickets;
    }
}
