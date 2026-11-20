package com.intellidesk.dto.analytics;

public class EngineerWorkloadDto {

    private Long engineerId;
    private String name;
    private String email;
    private String department;
    private long activeTickets;
    private long resolvedTickets;
    private long totalAssigned;

    public EngineerWorkloadDto() {}

    public EngineerWorkloadDto(Long engineerId, String name, String email, String department, long activeTickets, long resolvedTickets, long totalAssigned) {
        this.engineerId = engineerId;
        this.name = name;
        this.email = email;
        this.department = department;
        this.activeTickets = activeTickets;
        this.resolvedTickets = resolvedTickets;
        this.totalAssigned = totalAssigned;
    }

    public Long getEngineerId() {
        return engineerId;
    }

    public void setEngineerId(Long engineerId) {
        this.engineerId = engineerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public long getActiveTickets() {
        return activeTickets;
    }

    public void setActiveTickets(long activeTickets) {
        this.activeTickets = activeTickets;
    }

    public long getResolvedTickets() {
        return resolvedTickets;
    }

    public void setResolvedTickets(long resolvedTickets) {
        this.resolvedTickets = resolvedTickets;
    }

    public long getTotalAssigned() {
        return totalAssigned;
    }

    public void setTotalAssigned(long totalAssigned) {
        this.totalAssigned = totalAssigned;
    }
}
