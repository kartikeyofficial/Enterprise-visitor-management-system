package com.enterprise.vms.service;

import com.enterprise.vms.dto.DashboardStatsResponse;
import com.enterprise.vms.model.CheckInRecord;
import com.enterprise.vms.model.PassStatus;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.CheckInRecordRepository;
import com.enterprise.vms.repository.VisitorPassRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AnalyticsService {

    private final VisitorPassRepository passRepository;
    private final CheckInRecordRepository checkInRecordRepository;

    public AnalyticsService(VisitorPassRepository passRepository, CheckInRecordRepository checkInRecordRepository) {
        this.passRepository = passRepository;
        this.checkInRecordRepository = checkInRecordRepository;
    }

    public DashboardStatsResponse getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        long visitorsToday = passRepository.countByVisitDate(today);
        long activeInside = checkInRecordRepository.countActiveInside();
        long pending = passRepository.countByStatus(PassStatus.PENDING_APPROVAL);
        long totalPasses = passRepository.count();
        long totalCheckIns = checkInRecordRepository.count();

        return new DashboardStatsResponse(visitorsToday, activeInside, pending, totalPasses, totalCheckIns);
    }

    public List<CheckInRecord> getRecentCheckIns() {
        return checkInRecordRepository.findAllByOrderByCheckInTimeDesc();
    }

    public List<VisitorPass> getAllPasses() {
        return passRepository.findAllByOrderByCreatedAtDesc();
    }
}
