package com.enterprise.vms.controller;

import com.enterprise.vms.dto.*;
import com.enterprise.vms.model.AuditLog;
import com.enterprise.vms.model.CheckInRecord;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.VisitorPassRepository;
import com.enterprise.vms.service.AnalyticsService;
import com.enterprise.vms.service.AuditLogService;
import com.enterprise.vms.service.HostManagementService;
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
    private final HostManagementService hostManagementService;

    public AdminController(ScanService scanService,
                           AnalyticsService analyticsService,
                           AuditLogService auditLogService,
                           VisitorPassRepository passRepository,
                           HostManagementService hostManagementService) {
        this.scanService = scanService;
        this.analyticsService = analyticsService;
        this.auditLogService = auditLogService;
        this.passRepository = passRepository;
        this.hostManagementService = hostManagementService;
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

    // ==============================================================
    // HOST MANAGEMENT ENDPOINTS (CRUD)
    // ==============================================================

    @GetMapping("/hosts")
    public ResponseEntity<ApiResponse<List<HostDto>>> getAllHosts() {
        List<HostDto> hosts = hostManagementService.getAllHosts();
        return ResponseEntity.ok(ApiResponse.ok("Enterprise hosts list", hosts));
    }

    @GetMapping("/hosts/{id}")
    public ResponseEntity<ApiResponse<HostDto>> getHostById(@PathVariable Long id) {
        HostDto host = hostManagementService.getHostById(id);
        return ResponseEntity.ok(ApiResponse.ok("Enterprise host details", host));
    }

    @PostMapping("/hosts")
    public ResponseEntity<ApiResponse<HostDto>> createHost(@Valid @RequestBody HostRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null) ? auth.getName() : "rajputkartikey10@gmail.com";

        HostDto created = hostManagementService.createHost(request, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Enterprise host created successfully", created));
    }

    @PutMapping("/hosts/{id}")
    public ResponseEntity<ApiResponse<HostDto>> updateHost(@PathVariable Long id, @Valid @RequestBody HostRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null) ? auth.getName() : "rajputkartikey10@gmail.com";

        HostDto updated = hostManagementService.updateHost(id, request, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Enterprise host updated successfully", updated));
    }

    @DeleteMapping("/hosts/{id}")
    public ResponseEntity<ApiResponse<String>> deleteHost(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null) ? auth.getName() : "rajputkartikey10@gmail.com";

        hostManagementService.deleteHost(id, adminEmail);
        return ResponseEntity.ok(ApiResponse.ok("Enterprise host deleted successfully", "Host ID " + id + " deleted"));
    }
}
