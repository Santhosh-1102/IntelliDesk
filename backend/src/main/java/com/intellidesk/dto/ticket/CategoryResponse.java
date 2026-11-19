package com.intellidesk.dto.ticket;

import com.intellidesk.entity.TicketCategory;
import com.intellidesk.entity.enums.TicketPriority;

public class CategoryResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private TicketPriority defaultPriority;

    public CategoryResponse() {}

    public static CategoryResponse fromEntity(TicketCategory category) {
        CategoryResponse dto = new CategoryResponse();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setCode(category.getCode());
        dto.setDescription(category.getDescription());
        dto.setDefaultPriority(category.getDefaultPriority());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TicketPriority getDefaultPriority() {
        return defaultPriority;
    }

    public void setDefaultPriority(TicketPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }
}
