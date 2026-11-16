package com.enterprise.vms.service;

import com.enterprise.vms.dto.HostDto;
import com.enterprise.vms.dto.HostRequest;
import com.enterprise.vms.model.HostProfile;
import com.enterprise.vms.model.Role;
import com.enterprise.vms.model.User;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.CheckInRecordRepository;
import com.enterprise.vms.repository.HostProfileRepository;
import com.enterprise.vms.repository.UserRepository;
import com.enterprise.vms.repository.VisitorPassRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HostManagementService {

    private final HostProfileRepository hostProfileRepository;
    private final UserRepository userRepository;
    private final VisitorPassRepository passRepository;
    private final CheckInRecordRepository checkInRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public HostManagementService(HostProfileRepository hostProfileRepository,
                                 UserRepository userRepository,
                                 VisitorPassRepository passRepository,
                                 CheckInRecordRepository checkInRecordRepository,
                                 PasswordEncoder passwordEncoder,
                                 AuditLogService auditLogService) {
        this.hostProfileRepository = hostProfileRepository;
        this.userRepository = userRepository;
        this.passRepository = passRepository;
        this.checkInRecordRepository = checkInRecordRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<HostDto> getAllHosts() {
        return hostProfileRepository.findAllByOrderByIdAsc().stream()
                .map(HostDto::fromEntity)
                .collect(Collectors.toList());
    }

    public HostDto getHostById(Long id) {
        HostProfile profile = hostProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Host profile not found with ID: " + id));
        return HostDto.fromEntity(profile);
    }

    @Transactional
    public HostDto createHost(HostRequest request, String performedBy) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A user with this email address already exists: " + email);
        }

        String empCode = request.getEmployeeCode().trim().toUpperCase();
        if (hostProfileRepository.existsByEmployeeCode(empCode)) {
            throw new IllegalArgumentException("A host with this employee code already exists: " + empCode);
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Host@12345"));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : "");
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        user.setCompany("Enterprise HQ");
        user.setRole(Role.ROLE_HOST);
        user.setEmailVerified(true);
        user.setAadhaarVerified(true);
        user = userRepository.save(user);

        HostProfile profile = new HostProfile(
                user,
                request.getDepartment().trim(),
                request.getDesignation().trim(),
                empCode,
                request.getCabinNumber() != null ? request.getCabinNumber().trim() : ""
        );
        if (request.getAvailable() != null) {
            profile.setAvailable(request.getAvailable());
        }
        profile = hostProfileRepository.save(profile);

        auditLogService.log("HOST_CREATED", performedBy,
                "Created enterprise host: " + user.getFullName() + " (" + empCode + ")", null);

        return HostDto.fromEntity(profile);
    }

    @Transactional
    public HostDto updateHost(Long id, HostRequest request, String performedBy) {
        HostProfile profile = hostProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Host profile not found with ID: " + id));

        String empCode = request.getEmployeeCode().trim().toUpperCase();
        if (hostProfileRepository.existsByEmployeeCodeAndIdNot(empCode, id)) {
            throw new IllegalArgumentException("Another host already has employee code: " + empCode);
        }

        User user = profile.getUser();
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new IllegalArgumentException("Another user already has email: " + email);
        }

        user.setEmail(email);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null ? request.getLastName().trim() : "");
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        user = userRepository.save(user);

        profile.setDepartment(request.getDepartment().trim());
        profile.setDesignation(request.getDesignation().trim());
        profile.setEmployeeCode(empCode);
        profile.setCabinNumber(request.getCabinNumber() != null ? request.getCabinNumber().trim() : "");
        if (request.getAvailable() != null) {
            profile.setAvailable(request.getAvailable());
        }
        profile = hostProfileRepository.save(profile);

        auditLogService.log("HOST_UPDATED", performedBy,
                "Updated enterprise host: " + user.getFullName() + " (" + empCode + ")", null);

        return HostDto.fromEntity(profile);
    }

    @Transactional
    public void deleteHost(Long id, String performedBy) {
        HostProfile profile = hostProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Host profile not found with ID: " + id));

        User user = profile.getUser();
        String hostName = (user != null) ? user.getFullName() : "ID " + id;
        String empCode = profile.getEmployeeCode();

        if (user != null) {
            List<VisitorPass> passes = passRepository.findByHostIdOrderByCreatedAtDesc(user.getId());
            for (VisitorPass p : passes) {
                checkInRecordRepository.deleteByPassId(p.getId());
                passRepository.delete(p);
            }
        }

        hostProfileRepository.delete(profile);
        if (user != null) {
            userRepository.delete(user);
        }

        auditLogService.log("HOST_DELETED", performedBy,
                "Deleted enterprise host: " + hostName + " (" + empCode + ")", null);
    }
}
