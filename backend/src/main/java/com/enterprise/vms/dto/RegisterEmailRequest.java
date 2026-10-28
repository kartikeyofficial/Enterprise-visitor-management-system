package com.enterprise.vms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterEmailRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email address is required")
    private String email;

    public RegisterEmailRequest() {}

    public RegisterEmailRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
