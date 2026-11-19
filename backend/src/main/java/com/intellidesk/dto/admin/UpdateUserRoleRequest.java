package com.intellidesk.dto.admin;

import jakarta.validation.constraints.NotBlank;

public class UpdateUserRoleRequest {

    @NotBlank(message = "Role is required")
    private String role; // ROLE_EMPLOYEE, ROLE_SUPPORT_ENGINEER, ROLE_ADMIN

    public UpdateUserRoleRequest() {}

    public UpdateUserRoleRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
