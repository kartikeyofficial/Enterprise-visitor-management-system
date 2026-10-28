package com.enterprise.vms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class DigiLockerInitiateRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}$", message = "Invalid 12-digit Aadhaar number format")
    private String aadhaarNumber;

    public DigiLockerInitiateRequest() {}

    public DigiLockerInitiateRequest(String email, String aadhaarNumber) {
        this.email = email;
        this.aadhaarNumber = aadhaarNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }
}
