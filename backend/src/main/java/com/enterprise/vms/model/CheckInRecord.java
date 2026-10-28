package com.enterprise.vms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_in_records")
public class CheckInRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pass_id", nullable = false)
    private VisitorPass pass;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "scanned_by_admin", nullable = false, length = 120)
    private String scannedByAdmin;

    @Column(name = "terminal_location", length = 100)
    private String terminalLocation = "Main Reception Gate";

    @Column(name = "scan_notes", length = 255)
    private String scanNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CheckInRecord() {}

    public CheckInRecord(VisitorPass pass, LocalDateTime checkInTime, String scannedByAdmin, String terminalLocation, String scanNotes) {
        this.pass = pass;
        this.checkInTime = checkInTime;
        this.scannedByAdmin = scannedByAdmin;
        this.terminalLocation = terminalLocation != null ? terminalLocation : "Main Reception Gate";
        this.scanNotes = scanNotes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public VisitorPass getPass() {
        return pass;
    }

    public void setPass(VisitorPass pass) {
        this.pass = pass;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
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

    public String getScanNotes() {
        return scanNotes;
    }

    public void setScanNotes(String scanNotes) {
        this.scanNotes = scanNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
