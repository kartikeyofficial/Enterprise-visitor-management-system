package com.enterprise.vms.repository;

import com.enterprise.vms.model.CheckInRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRecordRepository extends JpaRepository<CheckInRecord, Long> {
    Optional<CheckInRecord> findTopByPassIdOrderByCheckInTimeDesc(Long passId);
    List<CheckInRecord> findByCheckOutTimeIsNull();
    List<CheckInRecord> findAllByOrderByCheckInTimeDesc();

    @Query("SELECT COUNT(c) FROM CheckInRecord c WHERE c.checkInTime >= :startOfDay AND c.checkInTime < :endOfDay")
    long countCheckInsBetween(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(c) FROM CheckInRecord c WHERE c.checkOutTime IS NULL")
    long countActiveInside();
}
