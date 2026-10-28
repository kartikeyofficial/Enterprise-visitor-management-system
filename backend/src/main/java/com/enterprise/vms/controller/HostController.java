package com.enterprise.vms.controller;

import com.enterprise.vms.dto.ApiResponse;
import com.enterprise.vms.dto.ApprovalRequest;
import com.enterprise.vms.dto.VisitorPassDto;
import com.enterprise.vms.model.PassStatus;
import com.enterprise.vms.model.User;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.UserRepository;
import com.enterprise.vms.repository.VisitorPassRepository;
import com.enterprise.vms.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/host")
public class HostController {

    private final VisitorPassRepository passRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public HostController(VisitorPassRepository passRepository,
                          UserRepository userRepository,
                          AuditLogService auditLogService) {
        this.passRepository = passRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<ApiResponse<List<VisitorPassDto>>> getPendingApprovals() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User host = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Host user not found"));

        List<VisitorPassDto> pending = passRepository.findByHostIdAndStatus(host.getId(), PassStatus.PENDING_APPROVAL).stream()
                .map(VisitorPassDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Pending approval requests", pending));
    }

    @GetMapping("/my-visitors")
    public ResponseEntity<ApiResponse<List<VisitorPassDto>>> getMyVisitors() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User host = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Host user not found"));

        List<VisitorPassDto> passes = passRepository.findByHostIdOrderByCreatedAtDesc(host.getId()).stream()
                .map(VisitorPassDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Host visitors list", passes));
    }

    @PostMapping("/decision")
    public ResponseEntity<ApiResponse<VisitorPassDto>> makeDecision(@Valid @RequestBody ApprovalRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        VisitorPass pass = passRepository.findById(request.getPassId())
                .orElseThrow(() -> new IllegalArgumentException("Pass not found with ID: " + request.getPassId()));

        pass.setStatus(request.getStatus());
        if (request.getRemarks() != null) {
            pass.setRemarks(request.getRemarks());
        }
        VisitorPass saved = passRepository.save(pass);

        auditLogService.log("HOST_DECISION", auth.getName(),
                "Host decided pass " + pass.getPassCode() + " -> " + request.getStatus(), null);

        return ResponseEntity.ok(ApiResponse.ok("Decision recorded: " + request.getStatus(), VisitorPassDto.fromEntity(saved)));
    }
}
