package com.intellidesk.dto.ticket;

import com.intellidesk.entity.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotBlank(message = "Ticket title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Ticket description is required")
    private String description;

    private Long categoryId;

    private TicketPriority priority; // Optional, defaults to category default or MEDIUM

    private Long sourceConversationId; // Optional, when created from AI chat

    private String aiSummary; // Optional, pre-filled by AI escalation

    public CreateTicketRequest() {}

    public CreateTicketRequest(String title, String description, Long categoryId, TicketPriority priority) {
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.priority = priority;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
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
}
