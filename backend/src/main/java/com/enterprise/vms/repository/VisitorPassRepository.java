package com.enterprise.vms.repository;

import com.enterprise.vms.model.PassStatus;
import com.enterprise.vms.model.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorPassRepository extends JpaRepository<VisitorPass, Long> {
    Optional<VisitorPass> findByPassCode(String passCode);
    List<VisitorPass> findByVisitorIdOrderByCreatedAtDesc(Long visitorId);
    List<VisitorPass> findByHostIdOrderByCreatedAtDesc(Long hostId);
    List<VisitorPass> findByHostIdAndStatus(Long hostId, PassStatus status);
    List<VisitorPass> findByStatus(PassStatus status);
    List<VisitorPass> findByVisitDateOrderByCreatedAtDesc(LocalDate visitDate);

    @Query("SELECT COUNT(p) FROM VisitorPass p WHERE p.visitDate = :date")
    long countByVisitDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(p) FROM VisitorPass p WHERE p.status = :status")
    long countByStatus(@Param("status") PassStatus status);

    List<VisitorPass> findAllByOrderByCreatedAtDesc();
}
