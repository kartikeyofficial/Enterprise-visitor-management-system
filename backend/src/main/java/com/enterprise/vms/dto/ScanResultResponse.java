package com.enterprise.vms.dto;

import java.time.LocalDateTime;

public class ScanResultResponse {
    private boolean success;
    private String message;
    private String actionType; // "CHECKED_IN" or "CHECKED_OUT"
    private Long passId;
    private String passCode;
    private String visitorName;
    private String visitorEmail;
    private String visitorPhone;
    private String company;
    private String hostName;
    private String hostDepartment;
    private String purpose;
    private LocalDateTime scanDateTime;
    private String scannedByAdmin;
    private String terminalLocation;

    public ScanResultResponse() {}

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public Long getPassId() {
        return passId;
    }

    public void setPassId(Long passId) {
        this.passId = passId;
    }

    public String getPassCode() {
        return passCode;
    }

    public void setPassCode(String passCode) {
        this.passCode = passCode;
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

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getHostDepartment() {
        return hostDepartment;
    }

    public void setHostDepartment(String hostDepartment) {
        this.hostDepartment = hostDepartment;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDateTime getScanDateTime() {
        return scanDateTime;
    }

    public void setScanDateTime(LocalDateTime scanDateTime) {
        this.scanDateTime = scanDateTime;
    }

    public String getScannedByAdmin() {
        return scannedByAdmin;
    }

    public void setScannedByAdmin(String scannedByAdmin) {
        this.scannedByAdmin = scannedByAdmin;
    }

    public String getTerminalLocation() {
        return terminalLocation;
    }

    public void setTerminalLocation(String terminalLocation) {
        this.terminalLocation = terminalLocation;
    }
}
