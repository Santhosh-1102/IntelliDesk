package com.intellidesk.dto.ticket;

import com.intellidesk.entity.Ticket;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;

import java.time.Instant;

public class TicketResponse {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;

    // Category info
    private Long categoryId;
    private String categoryName;
    private String categoryCode;

    // Requester info
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterDepartment;

    // Assigned Engineer info
    private Long assignedEngineerId;
    private String assignedEngineerName;
    private String assignedEngineerEmail;

    // AI diagnostic & resolution info
    private Long sourceConversationId;
    private String aiSummary;
    private String rootCause;
    private String resolutionNotes;

    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
    private Instant slaDeadline;

    public TicketResponse() {}

    public static TicketResponse fromEntity(Ticket ticket) {
        TicketResponse dto = new TicketResponse();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());

        if (ticket.getCategory() != null) {
            dto.setCategoryId(ticket.getCategory().getId());
            dto.setCategoryName(ticket.getCategory().getName());
            dto.setCategoryCode(ticket.getCategory().getCode());
        }

        if (ticket.getRequester() != null) {
            dto.setRequesterId(ticket.getRequester().getId());
            dto.setRequesterName(ticket.getRequester().getFirstName() + " " + ticket.getRequester().getLastName());
            dto.setRequesterEmail(ticket.getRequester().getEmail());
            dto.setRequesterDepartment(ticket.getRequester().getDepartment());
        }

        if (ticket.getAssignedEngineer() != null) {
            dto.setAssignedEngineerId(ticket.getAssignedEngineer().getId());
            dto.setAssignedEngineerName(ticket.getAssignedEngineer().getFirstName() + " " + ticket.getAssignedEngineer().getLastName());
            dto.setAssignedEngineerEmail(ticket.getAssignedEngineer().getEmail());
        }

        if (ticket.getSourceConversation() != null) {
            dto.setSourceConversationId(ticket.getSourceConversation().getId());
        }

        dto.setAiSummary(ticket.getAiSummary());
        dto.setRootCause(ticket.getRootCause());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setSlaDeadline(ticket.getSlaDeadline());

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryCode() {
        return categoryCode;
    }

    public void setCategoryCode(String categoryCode) {
        this.categoryCode = categoryCode;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getRequesterDepartment() {
        return requesterDepartment;
    }

    public void setRequesterDepartment(String requesterDepartment) {
        this.requesterDepartment = requesterDepartment;
    }

    public Long getAssignedEngineerId() {
        return assignedEngineerId;
    }

    public void setAssignedEngineerId(Long assignedEngineerId) {
        this.assignedEngineerId = assignedEngineerId;
    }

    public String getAssignedEngineerName() {
        return assignedEngineerName;
    }

    public void setAssignedEngineerName(String assignedEngineerName) {
        this.assignedEngineerName = assignedEngineerName;
    }

    public String getAssignedEngineerEmail() {
        return assignedEngineerEmail;
    }

    public void setAssignedEngineerEmail(String assignedEngineerEmail) {
        this.assignedEngineerEmail = assignedEngineerEmail;
    }

    public Long getSourceConversationId() {
        return sourceConversationId;
    }

    public void setSourceConversationId(Long sourceConversationId) {
        this.sourceConversationId = sourceConversationId;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public String getRootCause() {
        return rootCause;
    }

    public void setRootCause(String rootCause) {
        this.rootCause = rootCause;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Instant getSlaDeadline() {
        return slaDeadline;
    }

    public void setSlaDeadline(Instant slaDeadline) {
        this.slaDeadline = slaDeadline;
    }
}
