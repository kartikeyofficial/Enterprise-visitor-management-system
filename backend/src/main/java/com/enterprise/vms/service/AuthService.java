package com.enterprise.vms.service;

import com.enterprise.vms.dto.*;
import com.enterprise.vms.model.*;
import com.enterprise.vms.repository.*;
import com.enterprise.vms.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final VisitorPassRepository passRepository;
    private final EmailService emailService;
    private final QrCodeService qrCodeService;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       OtpTokenRepository otpTokenRepository,
                       VisitorPassRepository passRepository,
                       EmailService emailService,
                       QrCodeService qrCodeService,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.passRepository = passRepository;
        this.emailService = emailService;
        this.qrCodeService = qrCodeService;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Map<String, Object> registerEmail(String email) {
        String cleanEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(cleanEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(cleanEmail);
                    newUser.setRole(Role.ROLE_VISITOR);
                    newUser.setEmailVerified(false);
                    return userRepository.save(newUser);
                });

        // Generate 6-digit cryptographic OTP
        int otpNum = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(otpNum);

        // Expire in 10 minutes
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        OtpToken otpToken = new OtpToken(cleanEmail, otpCode, expiresAt);
        otpTokenRepository.save(otpToken);

        // Send OTP via spring-boot-starter-mail
        emailService.sendOtpEmail(cleanEmail, otpCode);

        auditLogService.log("OTP_SENT", cleanEmail, "Generated and dispatched email verification OTP", null);

        return Map.of(
                "email", cleanEmail,
                "message", "Verification OTP sent to " + cleanEmail,
                "devOtpPreview", otpCode // Provided so user can test effortlessly in local dev environment
        );
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String cleanEmail = email.trim().toLowerCase();
        String cleanOtp = otp.trim();

        OtpToken otpToken = otpTokenRepository
                .findTopByEmailAndOtpCodeAndIsUsedFalseAndExpiresAtAfter(cleanEmail, cleanOtp, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP. Please check and try again."));

        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User record not found for: " + cleanEmail));

        user.setEmailVerified(true);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        auditLogService.log("EMAIL_VERIFIED", cleanEmail, "Email verified successfully via OTP", null);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isEmailVerified(), user.isAadhaarVerified());
    }

    @Transactional
    public VisitorPassDto completeProfileAndCreatePass(CompleteProfileRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        User visitor = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + cleanEmail));

        if (!visitor.isEmailVerified()) {
            throw new IllegalStateException("Email must be verified via OTP before completing profile");
        }

        visitor.setFirstName(req.getFirstName().trim());
        visitor.setLastName(req.getLastName().trim());
        visitor.setPhone(req.getPhone().trim());
        if (req.getCompany() != null) {
            visitor.setCompany(req.getCompany().trim());
        }
        userRepository.save(visitor);

        User host = userRepository.findById(req.getHostId())
                .orElseThrow(() -> new IllegalArgumentException("Selected host employee not found with ID: " + req.getHostId()));

        // Generate clean pass code
        String passCode = "VMS-" + LocalDate.now().toString().replace("-", "") + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        VisitorPass pass = new VisitorPass();
        pass.setPassCode(passCode);
        pass.setVisitor(visitor);
        pass.setHost(host);
        pass.setPurpose(req.getPurpose());
        pass.setVisitDate(req.getVisitDate() != null ? req.getVisitDate() : LocalDate.now());
        pass.setStatus(PassStatus.APPROVED); // Auto-approved for visitor immediate pass flow or pending host approval

        // Generate Scannable QR Code containing JSON payload
        String qrPayload = String.format("{\"passCode\":\"%s\",\"visitor\":\"%s\",\"host\":\"%s\",\"date\":\"%s\"}",
                passCode, visitor.getFullName(), host.getFullName(), pass.getVisitDate());
        String qrBase64 = qrCodeService.generateQrCodeBase64(qrPayload, 300, 300);
        pass.setQrCodeBase64(qrBase64);

        VisitorPass savedPass = passRepository.save(pass);

        auditLogService.log("PASS_CREATED", cleanEmail, "Visitor pass generated with code: " + passCode, null);

        return VisitorPassDto.fromEntity(savedPass);
    }

    public AuthResponse login(LoginRequest req) {
        String cleanEmail = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        auditLogService.log("USER_LOGIN", cleanEmail, "Successful login with role " + user.getRole().name(), null);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), user.isEmailVerified(), user.isAadhaarVerified());
    }
}
