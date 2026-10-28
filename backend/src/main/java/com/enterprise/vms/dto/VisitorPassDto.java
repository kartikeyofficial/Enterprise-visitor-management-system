package com.enterprise.vms.dto;

import com.enterprise.vms.model.PassStatus;
import com.enterprise.vms.model.VisitorPass;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VisitorPassDto {
    private Long id;
    private String passCode;
    private Long visitorId;
    private String visitorName;
    private String visitorEmail;
    private String visitorPhone;
    private String company;
    private boolean aadhaarVerified;
    private Long hostId;
    private String hostName;
    private String hostEmail;
    private String hostDepartment;
    private String hostDesignation;
    private String hostCabin;
    private String purpose;
    private LocalDate visitDate;
    private PassStatus status;
    private String remarks;
    private String qrCodeBase64;
    private LocalDateTime createdAt;

    public VisitorPassDto() {}

    public static VisitorPassDto fromEntity(VisitorPass pass) {
        VisitorPassDto dto = new VisitorPassDto();
        dto.setId(pass.getId());
        dto.setPassCode(pass.getPassCode());
        if (pass.getVisitor() != null) {
            dto.setVisitorId(pass.getVisitor().getId());
            dto.setVisitorName(pass.getVisitor().getFullName());
            dto.setVisitorEmail(pass.getVisitor().getEmail());
            dto.setVisitorPhone(pass.getVisitor().getPhone());
            dto.setCompany(pass.getVisitor().getCompany());
            dto.setAadhaarVerified(pass.getVisitor().isAadhaarVerified());
        }
        if (pass.getHost() != null) {
            dto.setHostId(pass.getHost().getId());
            dto.setHostName(pass.getHost().getFullName());
            dto.setHostEmail(pass.getHost().getEmail());
        }
        dto.setPurpose(pass.getPurpose());
        dto.setVisitDate(pass.getVisitDate());
        dto.setStatus(pass.getStatus());
        dto.setRemarks(pass.getRemarks());
        dto.setQrCodeBase64(pass.getQrCodeBase64());
        dto.setCreatedAt(pass.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPassCode() {
        return passCode;
    }

    public void setPassCode(String passCode) {
        this.passCode = passCode;
    }

    public Long getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(Long visitorId) {
        this.visitorId = visitorId;
    }

    public String getVisitorName() {
        return visitorName;
    }

    public void setVisitorName(String visitorName) {
        this.visitorName = visitorName;
    }

    public String getVisitorEmail() {
        return visitorEmail;
    }

    public void setVisitorEmail(String visitorEmail) {
        this.visitorEmail = visitorEmail;
    }

    public String getVisitorPhone() {
        return visitorPhone;
    }

    public void setVisitorPhone(String visitorPhone) {
        this.visitorPhone = visitorPhone;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public boolean isAadhaarVerified() {
        return aadhaarVerified;
    }

    public void setAadhaarVerified(boolean aadhaarVerified) {
        this.aadhaarVerified = aadhaarVerified;
    }

    public Long getHostId() {
        return hostId;
    }

    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getHostEmail() {
        return hostEmail;
    }

    public void setHostEmail(String hostEmail) {
        this.hostEmail = hostEmail;
    }

    public String getHostDepartment() {
        return hostDepartment;
    }

    public void setHostDepartment(String hostDepartment) {
        this.hostDepartment = hostDepartment;
    }

    public String getHostDesignation() {
        return hostDesignation;
    }

    public void setHostDesignation(String hostDesignation) {
        this.hostDesignation = hostDesignation;
    }

    public String getHostCabin() {
        return hostCabin;
    }

    public void setHostCabin(String hostCabin) {
        this.hostCabin = hostCabin;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
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

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
