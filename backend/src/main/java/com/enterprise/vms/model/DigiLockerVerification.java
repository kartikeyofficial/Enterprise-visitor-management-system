package com.enterprise.vms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "digilocker_verifications")
public class DigiLockerVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "aadhaar_masked", nullable = false, length = 20)
    private String aadhaarMasked;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(length = 20)
    private String gender;

    @Column(length = 20)
    private String dob;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "txn_id", nullable = false, unique = true, length = 100)
    private String txnId;

    @Column(nullable = false, length = 30)
    private String status = "VERIFIED";

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt = LocalDateTime.now();

    public DigiLockerVerification() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAadhaarMasked() {
        return aadhaarMasked;
    }

    public void setAadhaarMasked(String aadhaarMasked) {
        this.aadhaarMasked = aadhaarMasked;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTxnId() {
        return txnId;
    }

    public void setTxnId(String txnId) {
        this.txnId = txnId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
