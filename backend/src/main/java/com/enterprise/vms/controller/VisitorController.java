package com.enterprise.vms.controller;

import com.enterprise.vms.dto.ApiResponse;
import com.enterprise.vms.dto.HostDto;
import com.enterprise.vms.dto.VisitorPassDto;
import com.enterprise.vms.model.User;
import com.enterprise.vms.model.VisitorPass;
import com.enterprise.vms.repository.HostProfileRepository;
import com.enterprise.vms.repository.UserRepository;
import com.enterprise.vms.repository.VisitorPassRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visitor")
public class VisitorController {

    private final VisitorPassRepository passRepository;
    private final HostProfileRepository hostProfileRepository;
    private final UserRepository userRepository;

    public VisitorController(VisitorPassRepository passRepository,
                             HostProfileRepository hostProfileRepository,
                             UserRepository userRepository) {
        this.passRepository = passRepository;
        this.hostProfileRepository = hostProfileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/pass/{passCode}")
    public ResponseEntity<ApiResponse<VisitorPassDto>> getPassByCode(@PathVariable String passCode) {
        VisitorPass pass = passRepository.findByPassCode(passCode)
                .orElseThrow(() -> new IllegalArgumentException("Pass not found with code: " + passCode));

        return ResponseEntity.ok(ApiResponse.ok("Pass details retrieved", VisitorPassDto.fromEntity(pass)));
    }

    @GetMapping("/hosts")
    public ResponseEntity<ApiResponse<List<HostDto>>> getAvailableHosts() {
        List<HostDto> hosts = hostProfileRepository.findByIsAvailableTrue().stream()
                .map(HostDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Available hosts list", hosts));
    }

    @GetMapping("/my-passes")
    public ResponseEntity<ApiResponse<List<VisitorPassDto>>> getMyPasses() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User visitor = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<VisitorPassDto> passes = passRepository.findByVisitorIdOrderByCreatedAtDesc(visitor.getId()).stream()
                .map(VisitorPassDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("My passes retrieved", passes));
    }
}
