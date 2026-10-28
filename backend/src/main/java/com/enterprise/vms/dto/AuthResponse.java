package com.enterprise.vms.dto;

import com.enterprise.vms.model.Role;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;
    private Role role;
    private boolean emailVerified;
    private boolean aadhaarVerified;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, String name, Role role, boolean emailVerified, boolean aadhaarVerified) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.emailVerified = emailVerified;
        this.aadhaarVerified = aadhaarVerified;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isAadhaarVerified() {
        return aadhaarVerified;
    }

    public void setAadhaarVerified(boolean aadhaarVerified) {
        this.aadhaarVerified = aadhaarVerified;
    }
}
