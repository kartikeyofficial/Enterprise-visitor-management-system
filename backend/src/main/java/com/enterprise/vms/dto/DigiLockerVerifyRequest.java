package com.enterprise.vms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class DigiLockerVerifyRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Transaction ID is required")
    private String txnId;

    @NotBlank(message = "DigiLocker PIN is required")
    private String securityPin;

    @NotBlank(message = "Aadhaar OTP is required")
    private String aadhaarOtp;

    public DigiLockerVerifyRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTxnId() {
        return txnId;
    }

    public void setTxnId(String txnId) {
        this.txnId = txnId;
    }

    public String getSecurityPin() {
        return securityPin;
    }

    public void setSecurityPin(String securityPin) {
        this.securityPin = securityPin;
    }

    public String getAadhaarOtp() {
        return aadhaarOtp;
    }

    public void setAadhaarOtp(String aadhaarOtp) {
        this.aadhaarOtp = aadhaarOtp;
    }
}
