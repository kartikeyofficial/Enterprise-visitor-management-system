package com.enterprise.vms.dto;

import com.enterprise.vms.model.HostProfile;

public class HostDto {
    private Long id;
    private Long userId;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String employeeCode;
    private String cabinNumber;
    private boolean available = true;

    public HostDto() {}

    public static HostDto fromEntity(HostProfile profile) {
        HostDto dto = new HostDto();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setName(profile.getUser().getFullName());
            dto.setFirstName(profile.getUser().getFirstName());
            dto.setLastName(profile.getUser().getLastName());
            dto.setEmail(profile.getUser().getEmail());
            dto.setPhone(profile.getUser().getPhone());
        }
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());
        dto.setEmployeeCode(profile.getEmployeeCode());
        dto.setCabinNumber(profile.getCabinNumber());
        dto.setAvailable(profile.isAvailable());
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
