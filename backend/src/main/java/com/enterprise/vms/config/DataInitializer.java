package com.enterprise.vms.config;

import com.enterprise.vms.model.HostProfile;
import com.enterprise.vms.model.Role;
import com.enterprise.vms.model.User;
import com.enterprise.vms.repository.HostProfileRepository;
import com.enterprise.vms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final HostProfileRepository hostProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:rajputkartikey10@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.default-password:Admin@12345}")
    private String adminPassword;

    public DataInitializer(UserRepository userRepository,
                           HostProfileRepository hostProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.hostProfileRepository = hostProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedSampleHosts();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setFirstName("Kartikey");
            admin.setLastName("Rajput");
            admin.setPhone("+91 9876543210");
            admin.setCompany("Enterprise Headquarters");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setEmailVerified(true);
            admin.setAadhaarVerified(true);

            userRepository.save(admin);
            logger.info("==========================================================");
            logger.info("ADMIN SEEDED SUCCESSFULLY: {}", adminEmail);
            logger.info("DEFAULT ADMIN PASSWORD: {}", adminPassword);
            logger.info("==========================================================");
        }
    }

    private void seedSampleHosts() {
        createHostIfMissing("vikram.sarabhai@enterprise.com", "Dr. Vikram", "Sarabhai",
                "Engineering & R&D", "Chief Technology Officer", "EMP-101", "Tower A - 402");

        createHostIfMissing("priya.sharma@enterprise.com", "Priya", "Sharma",
                "People Operations", "Director of Human Resources", "EMP-102", "Tower B - 201");

        createHostIfMissing("anand.patel@enterprise.com", "Anand", "Patel",
                "Infrastructure & Security", "VP of Operations", "EMP-103", "Main Block - 105");

        createHostIfMissing("meera.iyer@enterprise.com", "Meera", "Iyer",
                "Product & Experience", "Head of Digital Experience", "EMP-104", "Creative Studio - 310");
    }

    private void createHostIfMissing(String email, String first, String last,
                                     String department, String designation, String empCode, String cabin) {
        if (!userRepository.existsByEmail(email)) {
            User hostUser = new User();
            hostUser.setEmail(email);
            hostUser.setPassword(passwordEncoder.encode("Host@12345"));
            hostUser.setFirstName(first);
            hostUser.setLastName(last);
            hostUser.setPhone("+91 9811122233");
            hostUser.setCompany("Enterprise HQ");
            hostUser.setRole(Role.ROLE_HOST);
            hostUser.setEmailVerified(true);
            hostUser.setAadhaarVerified(true);
            userRepository.save(hostUser);

            HostProfile profile = new HostProfile(hostUser, department, designation, empCode, cabin);
            hostProfileRepository.save(profile);
            logger.info("Host seeded: {} ({})", hostUser.getFullName(), department);
        }
    }
}
