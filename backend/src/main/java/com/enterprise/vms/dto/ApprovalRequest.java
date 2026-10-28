package com.enterprise.vms.dto;

import com.enterprise.vms.model.PassStatus;
import jakarta.validation.constraints.NotNull;

public class ApprovalRequest {

    @NotNull(message = "Pass ID is required")
    private Long passId;

    @NotNull(message = "Decision status is required (APPROVED or REJECTED)")
    private PassStatus status;

    private String remarks;

    public ApprovalRequest() {}

    public Long getPassId() {
        return passId;
    }

    public void setPassId(Long passId) {
        this.passId = passId;
    }

    public PassStatus getStatus() {
        return status;
    }

    public void setStatus(PassStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
