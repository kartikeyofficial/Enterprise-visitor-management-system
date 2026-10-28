-- ==============================================================================
-- Enterprise Visitor Management System - Relational Schema (MySQL)
-- Optimized with foreign keys, indexes, and audit logging support
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS visitor_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE visitor_management_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    first_name VARCHAR(60) NULL,
    last_name VARCHAR(60) NULL,
    phone VARCHAR(20) NULL,
    company VARCHAR(100) NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_VISITOR',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. OTP Tokens Table
CREATE TABLE IF NOT EXISTS otp_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email),
    INDEX idx_otp_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. DigiLocker Aadhaar Verifications Table
CREATE TABLE IF NOT EXISTS digilocker_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    aadhaar_masked VARCHAR(20) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    gender VARCHAR(10) NULL,
    dob VARCHAR(20) NULL,
    address TEXT NULL,
    txn_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_digilocker_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_digilocker_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Host Profiles Table
CREATE TABLE IF NOT EXISTS host_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    department VARCHAR(80) NOT NULL,
    designation VARCHAR(80) NOT NULL,
    employee_code VARCHAR(40) NOT NULL UNIQUE,
    cabin_number VARCHAR(30) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_host_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Visitor Passes Table
CREATE TABLE IF NOT EXISTS visitor_passes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pass_code VARCHAR(64) NOT NULL UNIQUE,
    visitor_id BIGINT NOT NULL,
    host_id BIGINT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    visit_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    remarks TEXT NULL,
    qr_code_base64 LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pass_visitor FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pass_host FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pass_code (pass_code),
    INDEX idx_pass_status (status),
    INDEX idx_pass_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Check-In / Check-Out History Table (Optimized for scan history & analytics)
CREATE TABLE IF NOT EXISTS check_in_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pass_id BIGINT NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP NULL,
    scanned_by_admin VARCHAR(120) NOT NULL,
    terminal_location VARCHAR(100) DEFAULT 'Main Reception Gate',
    scan_notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checkin_pass FOREIGN KEY (pass_id) REFERENCES visitor_passes(id) ON DELETE CASCADE,
    INDEX idx_checkin_time (check_in_time),
    INDEX idx_checkout_time (check_out_time),
    INDEX idx_scanned_by (scanned_by_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit Logs Table (For security, compliance and RBAC monitoring)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(80) NOT NULL,
    performed_by VARCHAR(120) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(50) NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action),
    INDEX idx_audit_performer (performed_by),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
