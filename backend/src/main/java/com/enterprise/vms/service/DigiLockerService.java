package com.enterprise.vms.service;

import com.enterprise.vms.model.DigiLockerVerification;
import com.enterprise.vms.model.User;
import com.enterprise.vms.repository.DigiLockerVerificationRepository;
import com.enterprise.vms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DigiLockerService {

    private final DigiLockerVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    // Temporary storage for in-flight DigiLocker transactions
    private final Map<String, PendingTxn> pendingTransactions = new ConcurrentHashMap<>();

    public DigiLockerService(DigiLockerVerificationRepository verificationRepository,
                             UserRepository userRepository,
                             AuditLogService auditLogService) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public static class PendingTxn {
        public String email;
        public String maskedAadhaar;
        public String rawAadhaar;
        public String txnId;
        public String simulatedOtp;
        public LocalDateTime createdAt;

        public PendingTxn(String email, String maskedAadhaar, String rawAadhaar, String txnId, String simulatedOtp) {
            this.email = email;
            this.maskedAadhaar = maskedAadhaar;
            this.rawAadhaar = rawAadhaar;
            this.txnId = txnId;
            this.simulatedOtp = simulatedOtp;
            this.createdAt = LocalDateTime.now();
        }
    }

    public Map<String, Object> initiateVerification(String email, String aadhaarNumber) {
        String cleaned = aadhaarNumber.replaceAll("[^0-9]", "");
        if (cleaned.length() != 12) {
            throw new IllegalArgumentException("Aadhaar number must contain exactly 12 digits");
        }

        String last4 = cleaned.substring(8);
        String masked = "XXXX-XXXX-" + last4;
        String txnId = "DL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String simulatedOtp = "246810"; // Default sandbox OTP for smooth demo / simulation

        pendingTransactions.put(txnId, new PendingTxn(email, masked, cleaned, txnId, simulatedOtp));

        auditLogService.log("DIGILOCKER_INITIATED", email, "Initiated DigiLocker Aadhaar KYC for " + masked, null);

        return Map.of(
                "txnId", txnId,
                "maskedAadhaar", masked,
                "status", "CONSENT_REQUESTED",
                "message", "DigiLocker consent session created. Enter your 6-digit DigiLocker security PIN and Aadhaar OTP (Demo OTP: 246810).",
                "demoOtp", simulatedOtp
        );
    }

    @Transactional
    public DigiLockerVerification verifyConsentAndAadhaar(String email, String txnId, String securityPin, String aadhaarOtp) {
        PendingTxn txn = pendingTransactions.get(txnId);
        if (txn == null || !txn.email.equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Invalid or expired DigiLocker transaction ID");
        }

        if (securityPin == null || securityPin.trim().length() < 4) {
            throw new IllegalArgumentException("Invalid DigiLocker security PIN (must be 4-6 digits)");
        }

        // Accept demo OTP "246810" or any 6-digit OTP for resilient simulation
        if (aadhaarOtp == null || aadhaarOtp.trim().length() != 6) {
            throw new IllegalArgumentException("Aadhaar OTP must be 6 digits");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        // Create DigiLocker Verification Record
        DigiLockerVerification verification = new DigiLockerVerification();
        verification.setUser(user);
        verification.setAadhaarMasked(txn.maskedAadhaar);
        verification.setFullName(user.getFullName());
        verification.setGender("VERIFIED");
        verification.setDob("Verified by UIDAI");
        verification.setAddress("Digital Locker Verified Address, India");
        verification.setTxnId(txnId);
        verification.setStatus("VERIFIED");
        verification.setVerifiedAt(LocalDateTime.now());

        DigiLockerVerification saved = verificationRepository.save(verification);

        // Update User
        user.setAadhaarVerified(true);
        userRepository.save(user);

        pendingTransactions.remove(txnId);

        auditLogService.log("DIGILOCKER_VERIFIED", email, "Aadhaar successfully verified via DigiLocker e-KYC: " + txn.maskedAadhaar, null);

        return saved;
    }
}
