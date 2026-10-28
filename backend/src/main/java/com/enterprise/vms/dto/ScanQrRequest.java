package com.enterprise.vms.dto;

import jakarta.validation.constraints.NotBlank;

public class ScanQrRequest {

    @NotBlank(message = "QR Code payload or Pass Code is required")
    private String qrPayload;

    private String terminalLocation = "Main Reception Gate";

    private String notes;

    public ScanQrRequest() {}

    public ScanQrRequest(String qrPayload, String terminalLocation, String notes) {
        this.qrPayload = qrPayload;
        this.terminalLocation = terminalLocation;
        this.notes = notes;
    }

    public String getQrPayload() {
        return qrPayload;
    }

    public void setQrPayload(String qrPayload) {
        this.qrPayload = qrPayload;
    }

    public String getTerminalLocation() {
        return terminalLocation;
    }

    public void setTerminalLocation(String terminalLocation) {
        this.terminalLocation = terminalLocation;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
