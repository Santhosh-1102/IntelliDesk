package com.intellidesk.dto.analytics;

import com.intellidesk.entity.Ticket;

import java.time.Duration;
import java.time.Instant;

public class SlaBreachTicketDto {

    private Long ticketId;
    private String ticketNumber;
    private String title;
    private String priority;
    private String status;
    private String categoryName;
    private String assignedEngineerName;
    private Instant createdAt;
    private Instant slaDeadline;
    private boolean breached;
    private long minutesRemaining;
    private String formattedTimeRemaining;

    public SlaBreachTicketDto() {}

    public static SlaBreachTicketDto fromTicket(Ticket ticket) {
        SlaBreachTicketDto dto = new SlaBreachTicketDto();
        dto.setTicketId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setTitle(ticket.getTitle());
        dto.setPriority(ticket.getPriority() != null ? ticket.getPriority().name() : "MEDIUM");
        dto.setStatus(ticket.getStatus() != null ? ticket.getStatus().name() : "OPEN");
        dto.setCategoryName(ticket.getCategory() != null ? ticket.getCategory().getName() : "General");

        if (ticket.getAssignedEngineer() != null) {
            String firstName = ticket.getAssignedEngineer().getFirstName() != null ? ticket.getAssignedEngineer().getFirstName() : "";
            String lastName = ticket.getAssignedEngineer().getLastName() != null ? ticket.getAssignedEngineer().getLastName() : "";
            dto.setAssignedEngineerName((firstName + " " + lastName).trim());
        } else {
            dto.setAssignedEngineerName("Unassigned");
        }

        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setSlaDeadline(ticket.getSlaDeadline());

        Instant now = Instant.now();
        if (ticket.getSlaDeadline() != null) {
            boolean isBreached = ticket.getSlaDeadline().isBefore(now);
            dto.setBreached(isBreached);
            long diffMins = Duration.between(now, ticket.getSlaDeadline()).toMinutes();
            dto.setMinutesRemaining(diffMins);

            if (isBreached) {
                long overdue = Math.abs(diffMins);
                if (overdue >= 60) {
                    dto.setFormattedTimeRemaining("BREACHED (" + (overdue / 60) + "h " + (overdue % 60) + "m ago)");
                } else {
                    dto.setFormattedTimeRemaining("BREACHED (" + overdue + "m ago)");
                }
            } else {
                if (diffMins < 60) {
                    dto.setFormattedTimeRemaining(diffMins + "m left");
                } else {
                    dto.setFormattedTimeRemaining((diffMins / 60) + "h " + (diffMins % 60) + "m left");
                }
            }
        } else {
            dto.setBreached(false);
            dto.setMinutesRemaining(0);
            dto.setFormattedTimeRemaining("No SLA");
        }

        return dto;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getAssignedEngineerName() {
        return assignedEngineerName;
    }

    public void setAssignedEngineerName(String assignedEngineerName) {
        this.assignedEngineerName = assignedEngineerName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getSlaDeadline() {
        return slaDeadline;
    }

    public void setSlaDeadline(Instant slaDeadline) {
        this.slaDeadline = slaDeadline;
    }

    public boolean isBreached() {
        return breached;
    }

    public void setBreached(boolean breached) {
        this.breached = breached;
    }

    public long getMinutesRemaining() {
        return minutesRemaining;
    }

    public void setMinutesRemaining(long minutesRemaining) {
        this.minutesRemaining = minutesRemaining;
    }

    public String getFormattedTimeRemaining() {
        return formattedTimeRemaining;
    }

    public void setFormattedTimeRemaining(String formattedTimeRemaining) {
        this.formattedTimeRemaining = formattedTimeRemaining;
    }
}
