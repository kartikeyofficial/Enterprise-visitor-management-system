package com.enterprise.vms;

import com.enterprise.vms.dto.HostDto;
import com.enterprise.vms.dto.HostRequest;
import com.enterprise.vms.service.HostManagementService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class HostManagementTest {

    @Autowired
    private HostManagementService hostManagementService;

    @Test
    public void testHostCrudLifecycle() {
        // 1. Initial hosts seeded
        List<HostDto> initialHosts = hostManagementService.getAllHosts();
        Assertions.assertFalse(initialHosts.isEmpty(), "Initial hosts should not be empty");
        int countBefore = initialHosts.size();

        // 2. Create new host
        HostRequest newHost = new HostRequest();
        newHost.setFirstName("Rohan");
        newHost.setLastName("Verma");
        newHost.setEmail("rohan.verma@enterprise.com");
        newHost.setPhone("+91 9988776655");
        newHost.setDepartment("Cybersecurity");
        newHost.setDesignation("Lead Security Architect");
        newHost.setEmployeeCode("EMP-999");
        newHost.setCabinNumber("Block C - 101");
        newHost.setAvailable(true);

        HostDto created = hostManagementService.createHost(newHost, "admin-test");
        Assertions.assertNotNull(created.getId());
        Assertions.assertEquals("Rohan Verma", created.getName());
        Assertions.assertEquals("Cybersecurity", created.getDepartment());

        // 3. Update host
        newHost.setDesignation("Chief Information Security Officer");
        newHost.setCabinNumber("Executive Tower - 901");
        HostDto updated = hostManagementService.updateHost(created.getId(), newHost, "admin-test");
        Assertions.assertEquals("Chief Information Security Officer", updated.getDesignation());
        Assertions.assertEquals("Executive Tower - 901", updated.getCabinNumber());

        // 4. Verify in all hosts
        List<HostDto> hostsAfterAdd = hostManagementService.getAllHosts();
        Assertions.assertEquals(countBefore + 1, hostsAfterAdd.size());

        // 5. Delete host
        hostManagementService.deleteHost(created.getId(), "admin-test");
        List<HostDto> hostsAfterDelete = hostManagementService.getAllHosts();
        Assertions.assertEquals(countBefore, hostsAfterDelete.size());
    }
}
