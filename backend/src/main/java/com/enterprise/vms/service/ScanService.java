package com.enterprise.vms.service;

import com.enterprise.vms.dto.ScanQrRequest;
import com.enterprise.vms.dto.ScanResultResponse;
import com.enterprise.vms.model.CheckInRecord;
import com.enterprise.vms.model.PassStatus;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.CheckInRecordRepository;
import com.enterprise.vms.repository.VisitorPassRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ScanService {

    private final VisitorPassRepository passRepository;
    private final CheckInRecordRepository checkInRecordRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public ScanService(VisitorPassRepository passRepository,
                       CheckInRecordRepository checkInRecordRepository,
                       AuditLogService auditLogService,
                       ObjectMapper objectMapper) {
        this.passRepository = passRepository;
        this.checkInRecordRepository = checkInRecordRepository;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ScanResultResponse processQrScan(ScanQrRequest request, String adminEmail) {
        String passCode = extractPassCode(request.getQrPayload());

        VisitorPass pass = passRepository.findByPassCode(passCode)
                .orElseThrow(() -> new IllegalArgumentException("No visitor pass found matching scanned code: " + passCode));

        LocalDateTime now = LocalDateTime.now();
        String scannedBy = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail : "rajputkartikey10@gmail.com";
        String terminal = (request.getTerminalLocation() != null) ? request.getTerminalLocation() : "Main Reception Gate";

        ScanResultResponse response = new ScanResultResponse();
        response.setPassId(pass.getId());
        response.setPassCode(pass.getPassCode());
        response.setVisitorName(pass.getVisitor() != null ? pass.getVisitor().getFullName() : "N/A");
        response.setVisitorEmail(pass.getVisitor() != null ? pass.getVisitor().getEmail() : "N/A");
        response.setVisitorPhone(pass.getVisitor() != null ? pass.getVisitor().getPhone() : "N/A");
        response.setCompany(pass.getVisitor() != null ? pass.getVisitor().getCompany() : "N/A");
        response.setHostName(pass.getHost() != null ? pass.getHost().getFullName() : "N/A");
        response.setPurpose(pass.getPurpose());
        response.setScannedByAdmin(scannedBy);
        response.setTerminalLocation(terminal);
        response.setScanDateTime(now);

        // Check current lifecycle status
        if (pass.getStatus() == PassStatus.REJECTED) {
            response.setSuccess(false);
            response.setMessage("Visitor pass has been REJECTED by host. Entry denied.");
            response.setActionType("DENIED");
            return response;
        }

        if (pass.getStatus() == PassStatus.CHECKED_OUT) {
            response.setSuccess(false);
            response.setMessage("Visitor has already checked out with this pass.");
            response.setActionType("ALREADY_COMPLETED");
            return response;
        }

        if (pass.getStatus() == PassStatus.CHECKED_IN) {
            // Check-out workflow
            Optional<CheckInRecord> recordOpt = checkInRecordRepository.findTopByPassIdOrderByCheckInTimeDesc(pass.getId());
            if (recordOpt.isPresent()) {
                CheckInRecord record = recordOpt.get();
                record.setCheckOutTime(now);
                checkInRecordRepository.save(record);
            }

            pass.setStatus(PassStatus.CHECKED_OUT);
            passRepository.save(pass);

            response.setSuccess(true);
            response.setActionType("CHECKED_OUT");
            response.setMessage("Visitor successfully CHECKED OUT. Exit scan timestamp logged in database.");

            auditLogService.log("SCAN_CHECK_OUT", scannedBy,
                    "Checked out visitor pass: " + passCode + " at " + now, null);
        } else {
            // Check-in workflow (for PENDING_APPROVAL or APPROVED)
            CheckInRecord checkInRecord = new CheckInRecord(
                    pass,
                    now,
                    scannedBy,
                    terminal,
                    request.getNotes() != null ? request.getNotes() : "Reception QR scanner verification"
            );
            checkInRecordRepository.save(checkInRecord);

            pass.setStatus(PassStatus.CHECKED_IN);
            passRepository.save(pass);

            response.setSuccess(true);
            response.setActionType("CHECKED_IN");
            response.setMessage("Visitor successfully CHECKED IN. Scan date & time logged in MySQL database.");

            auditLogService.log("SCAN_CHECK_IN", scannedBy,
                    "Scanned & checked in visitor pass: " + passCode + " at " + now, null);
        }

        return response;
    }

    private String extractPassCode(String payload) {
        if (payload == null || payload.isBlank()) {
            throw new IllegalArgumentException("Scan payload cannot be empty");
        }

        String trimmed = payload.trim();
        // Check if raw string is already the passCode (e.g., VMS-20261028-...)
        if (trimmed.startsWith("VMS-") && !trimmed.contains("{")) {
            return trimmed;
        }

        // Try parsing JSON payload
        try {
            JsonNode root = objectMapper.readTree(trimmed);
            if (root.has("passCode")) {
                return root.get("passCode").asText();
            }
        } catch (Exception ignored) {
        }

        // Try extracting with regex or prefix
        if (trimmed.contains("VMS-")) {
            int idx = trimmed.indexOf("VMS-");
            int end = trimmed.indexOf("\"", idx);
            if (end == -1) end = trimmed.indexOf(" ", idx);
            if (end == -1) end = trimmed.indexOf("}", idx);
            if (end != -1) {
                return trimmed.substring(idx, end).trim();
            }
            return trimmed.substring(idx).trim();
        }

        return trimmed;
    }
}
