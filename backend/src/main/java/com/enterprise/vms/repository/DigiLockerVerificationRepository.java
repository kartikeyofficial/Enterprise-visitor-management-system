package com.enterprise.vms.repository;

import com.enterprise.vms.model.DigiLockerVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DigiLockerVerificationRepository extends JpaRepository<DigiLockerVerification, Long> {
    Optional<DigiLockerVerification> findByUserId(Long userId);
    Optional<DigiLockerVerification> findByTxnId(String txnId);
}
