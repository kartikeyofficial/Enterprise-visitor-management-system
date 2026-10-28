package com.enterprise.vms.controller;

import com.enterprise.vms.dto.*;
import com.enterprise.vms.model.AuditLog;
import com.enterprise.vms.model.CheckInRecord;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.VisitorPassRepository;
import com.enterprise.vms.service.AnalyticsService;
import com.enterprise.vms.service.AuditLogService;
import com.enterprise.vms.service.ScanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ScanService scanService;
    private final AnalyticsService analyticsService;
    private final AuditLogService auditLogService;
    private final VisitorPassRepository passRepository;

    public AdminController(ScanService scanService,
                           AnalyticsService analyticsService,
                           AuditLogService auditLogService,
                           VisitorPassRepository passRepository) {
        this.scanService = scanService;
        this.analyticsService = analyticsService;
        this.auditLogService = auditLogService;
        this.passRepository = passRepository;
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<ScanResultResponse>> scanVisitorQr(@Valid @RequestBody ScanQrRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null) ? auth.getName() : "rajputkartikey10@gmail.com";

        ScanResultResponse result = scanService.processQrScan(request, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok(result.getMessage(), result));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = analyticsService.getStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics", stats));
    }

    @GetMapping("/passes")
    public ResponseEntity<ApiResponse<List<VisitorPassDto>>> getAllPasses() {
        List<VisitorPassDto> passes = analyticsService.getAllPasses().stream()
                .map(VisitorPassDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All visitor passes", passes));
    }

    @GetMapping("/check-in-history")
    public ResponseEntity<ApiResponse<List<CheckInRecord>>> getCheckInHistory() {
        List<CheckInRecord> records = analyticsService.getRecentCheckIns();
        return ResponseEntity.ok(ApiResponse.ok("Check-in scan history", records));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.ok("Audit logs", logs));
    }

    @PostMapping("/pass-decision")
    public ResponseEntity<ApiResponse<VisitorPassDto>> updatePassStatus(@Valid @RequestBody ApprovalRequest request) {
        VisitorPass pass = passRepository.findById(request.getPassId())
                .orElseThrow(() -> new IllegalArgumentException("Pass not found with ID: " + request.getPassId()));

        pass.setStatus(request.getStatus());
        if (request.getRemarks() != null) {
            pass.setRemarks(request.getRemarks());
        }
        VisitorPass saved = passRepository.save(pass);

        return ResponseEntity.ok(ApiResponse.ok("Pass status updated to " + request.getStatus(), VisitorPassDto.fromEntity(saved)));
    }
}
