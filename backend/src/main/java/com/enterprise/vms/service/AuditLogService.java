package com.enterprise.vms.service;

import com.enterprise.vms.model.AuditLog;
import com.enterprise.vms.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String performedBy, String details, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(action, performedBy, details, ipAddress);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log failure should not break primary operation
        }
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}
