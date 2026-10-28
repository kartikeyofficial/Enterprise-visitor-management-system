package com.enterprise.vms.repository;

import com.enterprise.vms.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);
    Optional<OtpToken> findTopByEmailAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(String email, String otpCode, LocalDateTime now);
}
