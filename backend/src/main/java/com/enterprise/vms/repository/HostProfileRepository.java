package com.enterprise.vms.repository;

import com.enterprise.vms.model.HostProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HostProfileRepository extends JpaRepository<HostProfile, Long> {
    Optional<HostProfile> findByUserId(Long userId);
    Optional<HostProfile> findByEmployeeCode(String employeeCode);
    List<HostProfile> findByIsAvailableTrue();
}
