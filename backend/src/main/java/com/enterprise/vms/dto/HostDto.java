package com.enterprise.vms.dto;

import com.enterprise.vms.model.HostProfile;

public class HostDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String department;
    private String designation;
    private String employeeCode;
    private String cabinNumber;

    public HostDto() {}

    public static HostDto fromEntity(HostProfile profile) {
        HostDto dto = new HostDto();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setName(profile.getUser().getFullName());
            dto.setEmail(profile.getUser().getEmail());
        }
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());
        dto.setEmployeeCode(profile.getEmployeeCode());
        dto.setCabinNumber(profile.getCabinNumber());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getCabinNumber() {
        return cabinNumber;
    }

    public void setCabinNumber(String cabinNumber) {
        this.cabinNumber = cabinNumber;
    }
}
