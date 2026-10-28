package com.enterprise.vms.controller;

import com.enterprise.vms.dto.*;
import com.enterprise.vms.model.DigiLockerVerification;
import com.enterprise.vms.model.User;
import com.enterprise.vms.repository.UserRepository;
import com.enterprise.vms.service.AuthService;
import com.enterprise.vms.service.DigiLockerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final DigiLockerService digiLockerService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
                          DigiLockerService digiLockerService,
                          UserRepository userRepository) {
        this.authService = authService;
        this.digiLockerService = digiLockerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerEmail(@Valid @RequestBody RegisterEmailRequest req) {
        Map<String, Object> result = authService.registerEmail(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Verification OTP dispatched to " + req.getEmail(), result));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        AuthResponse response = authService.verifyOtp(req.getEmail(), req.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", response));
    }

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<VisitorPassDto>> completeProfile(@Valid @RequestBody CompleteProfileRequest req) {
        VisitorPassDto pass = authService.completeProfileAndCreatePass(req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated and visitor pass generated with QR code", pass));
    }

    @PostMapping("/digilocker/initiate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiateDigiLocker(@Valid @RequestBody DigiLockerInitiateRequest req) {
        Map<String, Object> result = digiLockerService.initiateVerification(req.getEmail(), req.getAadhaarNumber());
        return ResponseEntity.ok(ApiResponse.ok("DigiLocker Aadhaar KYC initiated", result));
    }

    @PostMapping("/digilocker/verify")
    public ResponseEntity<ApiResponse<DigiLockerVerification>> verifyDigiLocker(@Valid @RequestBody DigiLockerVerifyRequest req) {
        DigiLockerVerification verification = digiLockerService.verifyConsentAndAadhaar(
                req.getEmail(), req.getTxnId(), req.getSecurityPin(), req.getAadhaarOtp());
        return ResponseEntity.ok(ApiResponse.ok("Aadhaar successfully verified via DigiLocker", verification));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok("User profile", user));
    }
}
