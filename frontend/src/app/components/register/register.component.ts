import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VisitorService } from '../../services/visitor.service';
import { HostDto, VisitorPassDto } from '../../models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-page">
      <div class="register-container">
        
        <!-- Header -->
        <div class="page-header text-center">
          <div class="header-pill">Visitor Check-In Portal</div>
          <h1 class="page-title">Digital Visitor Registration</h1>
          <p class="page-desc">
            Complete email verification, visitor details, and instant DigiLocker Aadhaar e-KYC to generate your QR pass.
          </p>
        </div>

        <!-- Stepper Indicators -->
        <div class="stepper-bar">
          <div class="step-item" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
            <div class="step-circle">
              <i *ngIf="currentStep > 1" class="ri-check-line"></i>
              <span *ngIf="currentStep <= 1">1</span>
            </div>
            <span class="step-label">Email & OTP</span>
          </div>
          <div class="step-line" [class.filled]="currentStep > 1"></div>

          <div class="step-item" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
            <div class="step-circle">
              <i *ngIf="currentStep > 2" class="ri-check-line"></i>
              <span *ngIf="currentStep <= 2">2</span>
            </div>
            <span class="step-label">Visitor Details</span>
          </div>
          <div class="step-line" [class.filled]="currentStep > 2"></div>

          <div class="step-item" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
            <div class="step-circle">
              <i *ngIf="currentStep > 3" class="ri-check-line"></i>
              <span *ngIf="currentStep <= 3">3</span>
            </div>
            <span class="step-label">DigiLocker KYC</span>
          </div>
          <div class="step-line" [class.filled]="currentStep > 3"></div>

          <div class="step-item" [class.active]="currentStep === 4" [class.completed]="currentStep === 4">
            <div class="step-circle">
              <i class="ri-qr-code-line"></i>
            </div>
            <span class="step-label">Digital Badge</span>
          </div>
        </div>

        <!-- Notification Banner -->
        <div *ngIf="statusMessage" class="alert-box" [ngClass]="isError ? 'alert-error' : 'alert-success'">
          <i [class]="isError ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
          <div class="alert-content">
            <p>{{ statusMessage }}</p>
            <div *ngIf="devOtpHelper" class="dev-otp-helper">
              <strong>Evaluation Hint:</strong> One-Time Password sent to your email is 
              <span class="otp-pill" (click)="fillOtp(devOtpHelper)">{{ devOtpHelper }} (Click to auto-fill)</span>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- STEP 1: EMAIL REGISTRATION & OTP VERIFICATION -->
        <!-- ============================================================== -->
        <div *ngIf="currentStep === 1" class="card-modern step-card fade-in">
          <div class="card-head">
            <div class="icon-circle">
              <i class="ri-mail-send-line"></i>
            </div>
            <div>
              <h3>Step 1: Verify Email Address</h3>
              <p class="text-muted">Enter your official or personal email to receive a 6-digit verification code.</p>
            </div>
          </div>

          <div *ngIf="!otpSent" class="form-section">
            <div class="form-group">
              <label class="form-label" for="reg-email">Email Address</label>
              <div class="input-with-icon">
                <i class="ri-at-line input-icon"></i>
                <input
                  id="reg-email"
                  type="email"
                  [(ngModel)]="email"
                  placeholder="e.g. rahul.sharma@example.com"
                  class="form-input"
                  [disabled]="loading"
                />
              </div>
            </div>

            <button
              class="btn btn-primary btn-block"
              [disabled]="loading || !email || !isValidEmail(email)"
              (click)="sendEmailOtp()"
            >
              <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
              <i *ngIf="!loading" class="ri-send-plane-fill"></i>
              <span>{{ loading ? 'Dispatching OTP via Mail...' : 'Send Verification OTP' }}</span>
            </button>
          </div>

          <!-- OTP Input Section -->
          <div *ngIf="otpSent" class="form-section fade-in">
            <div class="verified-email-chip">
              <i class="ri-mail-check-line"></i>
              <span>OTP dispatched to <strong>{{ email }}</strong></span>
              <button class="btn-link" (click)="otpSent = false">Change</button>
            </div>

            <div class="form-group">
              <label class="form-label" for="otp-input">Enter 6-Digit Verification Code</label>
              <input
                id="otp-input"
                type="text"
                maxlength="6"
                [(ngModel)]="otpCode"
                placeholder="123456"
                class="form-input otp-input-field"
                [disabled]="loading"
              />
            </div>

            <div class="action-buttons">
              <button
                class="btn btn-primary btn-block"
                [disabled]="loading || !otpCode || otpCode.length < 6"
                (click)="verifyOtp()"
              >
                <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
                <i *ngIf="!loading" class="ri-shield-check-line"></i>
                <span>{{ loading ? 'Validating...' : 'Verify Email & Continue' }}</span>
              </button>
              <button class="btn btn-secondary" (click)="sendEmailOtp()" [disabled]="loading">
                <i class="ri-refresh-line"></i> Resend OTP
              </button>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- STEP 2: VISITOR & VISIT DETAILS -->
        <!-- ============================================================== -->
        <div *ngIf="currentStep === 2" class="card-modern step-card fade-in">
          <div class="card-head">
            <div class="icon-circle">
              <i class="ri-profile-line"></i>
            </div>
            <div>
              <h3>Step 2: Visitor Profile & Host Selection</h3>
              <p class="text-muted">Provide your contact details and designate the employee or team you are meeting.</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="v-fname">First Name *</label>
              <input id="v-fname" type="text" [(ngModel)]="firstName" placeholder="First Name" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="v-lname">Last Name *</label>
              <input id="v-lname" type="text" [(ngModel)]="lastName" placeholder="Last Name" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="v-phone">Mobile Phone Number *</label>
              <input id="v-phone" type="tel" [(ngModel)]="phone" placeholder="+91 9876543210" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="v-company">Company / Organization</label>
              <input id="v-company" type="text" [(ngModel)]="company" placeholder="e.g. Acme Tech Solutions" class="form-input" />
            </div>

            <div class="form-group full-width">
              <label class="form-label" for="v-host">Select Enterprise Host to Meet *</label>
              <select id="v-host" [(ngModel)]="selectedHostId" class="form-select">
                <option [ngValue]="null" disabled selected>-- Select Host Employee --</option>
                <option *ngFor="let h of availableHosts" [ngValue]="h.userId">
                  {{ h.name }} — {{ h.designation }} ({{ h.department }}, Cabin: {{ h.cabinNumber || 'Main' }})
                </option>
              </select>
            </div>

            <div class="form-group full-width">
              <label class="form-label" for="v-purpose">Purpose of Visit *</label>
              <input id="v-purpose" type="text" [(ngModel)]="purpose" placeholder="e.g., Strategic Partnership Review, Product Demo, or Interview" class="form-input" />
            </div>
          </div>

          <div class="action-buttons-right">
            <button
              class="btn btn-primary"
              [disabled]="loading || !firstName || !lastName || !phone || !purpose || !selectedHostId"
              (click)="submitVisitorDetails()"
            >
              <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
              <span>Next: DigiLocker Aadhaar Verification</span>
              <i *ngIf="!loading" class="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- STEP 3: DIGILOCKER AADHAAR VERIFICATION -->
        <!-- ============================================================== -->
        <div *ngIf="currentStep === 3" class="card-modern step-card fade-in">
          <div class="digilocker-badge-header">
            <div class="digilocker-logo-box">
              <i class="ri-fingerprint-line"></i>
              <span>DigiLocker</span>
            </div>
            <div class="uidai-pill">
              <i class="ri-shield-check-fill"></i>
              <span>Govt. of India e-KYC</span>
            </div>
          </div>

          <div class="card-head">
            <div>
              <h3>Government ID Verification</h3>
              <p class="text-muted">
                Enterprise security policy mandates verified government identity. Verify your 12-digit Aadhaar Card seamlessly via DigiLocker.
              </p>
            </div>
          </div>

          <!-- Phase A: Aadhaar Input -->
          <div *ngIf="!digiLockerSession" class="digilocker-content">
            <div class="form-group">
              <label class="form-label" for="aadhaar-input">12-Digit Aadhaar Card Number *</label>
              <div class="input-with-icon">
                <i class="ri-id-card-line input-icon"></i>
                <input
                  id="aadhaar-input"
                  type="text"
                  maxlength="14"
                  [(ngModel)]="aadhaarNumber"
                  (input)="formatAadhaar()"
                  placeholder="5432 9876 1234"
                  class="form-input"
                />
              </div>
              <small class="helper-text">Your Aadhaar number is encrypted and processed via DigiLocker sandbox compliance.</small>
            </div>

            <div class="consent-box">
              <label class="checkbox-container">
                <input type="checkbox" [(ngModel)]="digiLockerConsent" />
                <span class="checkbox-label">
                  I grant consent to Enterprise VMS to verify my identity and pull e-KYC data from DigiLocker / UIDAI.
                </span>
              </label>
            </div>

            <button
              class="btn btn-primary btn-block"
              [disabled]="loading || !digiLockerConsent || !isValidAadhaar(aadhaarNumber)"
              (click)="initiateDigiLocker()"
            >
              <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
              <i *ngIf="!loading" class="ri-lock-2-line"></i>
              <span>{{ loading ? 'Connecting to DigiLocker...' : 'Authenticate via DigiLocker' }}</span>
            </button>
          </div>

          <!-- Phase B: DigiLocker PIN & Aadhaar OTP Consent Drawer -->
          <div *ngIf="digiLockerSession" class="digilocker-consent-panel fade-in">
            <div class="dl-session-banner">
              <div class="dl-icon"><i class="ri-shield-keyhole-line"></i></div>
              <div class="dl-info">
                <strong>DigiLocker Session: {{ digiLockerSession.txnId }}</strong>
                <p>Verifying Aadhaar: <strong>{{ digiLockerSession.maskedAadhaar }}</strong></p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="dl-pin">6-Digit DigiLocker Security PIN *</label>
                <input
                  id="dl-pin"
                  type="password"
                  maxlength="6"
                  [(ngModel)]="digiLockerPin"
                  placeholder="PIN (e.g. 123456)"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="dl-otp">UIDAI Aadhaar OTP *</label>
                <input
                  id="dl-otp"
                  type="text"
                  maxlength="6"
                  [(ngModel)]="digiLockerOtp"
                  placeholder="6-digit OTP"
                  class="form-input"
                />
                <small class="helper-text">
                  Sandbox OTP: <strong (click)="digiLockerOtp = '246810'" class="otp-pill">246810</strong>
                </small>
              </div>
            </div>

            <div class="action-buttons">
              <button
                class="btn btn-primary btn-block"
                [disabled]="loading || !digiLockerPin || !digiLockerOtp"
                (click)="verifyDigiLockerConsent()"
              >
                <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
                <i *ngIf="!loading" class="ri-checkbox-circle-fill"></i>
                <span>{{ loading ? 'Verifying e-KYC...' : 'Authorize & Issue Digital Badge' }}</span>
              </button>
              <button class="btn btn-secondary" (click)="digiLockerSession = null">Back</button>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- STEP 4: GENERATED DIGITAL BADGE & SCANNABLE QR CODE -->
        <!-- ============================================================== -->
        <div *ngIf="currentStep === 4 && generatedPass" class="badge-success-layout fade-in">
          
          <div class="badge-card-wrapper card-modern printable-badge-area">
            <!-- Badge Header -->
            <div class="badge-header">
              <div class="badge-org">
                <i class="ri-shield-star-line"></i>
                <span>ENTERPRISE VISITOR PASS</span>
              </div>
              <div class="badge-status-chip">
                <span class="badge badge-approved">
                  <i class="ri-check-double-line"></i> APPROVED PASS
                </span>
              </div>
            </div>

            <!-- Pass Body -->
            <div class="badge-body">
              <div class="badge-photo-and-qr">
                <!-- QR Code Box -->
                <div class="qr-container">
                  <img
                    *ngIf="generatedPass.qrCodeBase64"
                    [src]="generatedPass.qrCodeBase64"
                    alt="Visitor QR Code"
                    class="qr-image"
                  />
                  <div class="qr-subtext">Present this QR Code at Reception</div>
                  <div class="pass-code-tag">{{ generatedPass.passCode }}</div>
                </div>

                <!-- Visitor ID Card Info -->
                <div class="visitor-details-box">
                  <div class="visitor-avatar-large">
                    <i class="ri-user-smile-line"></i>
                  </div>
                  <h2 class="visitor-fullname">{{ generatedPass.visitorName }}</h2>
                  <div class="visitor-org">{{ generatedPass.company || 'External Visitor' }}</div>

                  <div class="kyc-verified-ribbon">
                    <i class="ri-verified-badge-fill"></i>
                    <span>DigiLocker Aadhaar e-KYC Verified</span>
                  </div>

                  <div class="details-list">
                    <div class="detail-row">
                      <span class="detail-title">Host:</span>
                      <span class="detail-val">{{ generatedPass.hostName }} ({{ generatedPass.hostDepartment }})</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-title">Purpose:</span>
                      <span class="detail-val">{{ generatedPass.purpose }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-title">Visit Date:</span>
                      <span class="detail-val">{{ generatedPass.visitDate }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-title">Email:</span>
                      <span class="detail-val">{{ generatedPass.visitorEmail }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Badge Footer -->
            <div class="badge-footer">
              <span>Security Terminal: Main Gate</span>
              <span>•</span>
              <span>Encrypted Identity Token</span>
              <span>•</span>
              <span>Valid Today</span>
            </div>
          </div>

          <!-- Post-Registration Action Toolbar (no-print) -->
          <div class="actions-toolbar card-modern no-print">
            <h3>Visitor Registration Complete!</h3>
            <p class="text-muted">
              Your pass has been recorded in the database. Scan this pass at the reception desk to check in.
            </p>
            <div class="toolbar-buttons">
              <button class="btn btn-secondary" (click)="printBadge()">
                <i class="ri-printer-line"></i> Print Badge
              </button>
              <button class="btn btn-primary" (click)="goToAdminScanner()">
                <i class="ri-qr-scan-2-line"></i> Open Reception Scanner to Check In
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .register-page {
      padding: 40px 20px 80px;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-main);
    }
    .register-container {
      max-width: 760px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 32px;
    }
    .header-pill {
      display: inline-block;
      padding: 4px 14px;
      background-color: var(--olive-100);
      color: var(--olive-800);
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .page-title {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .page-desc {
      color: var(--text-secondary);
      font-size: 15px;
      max-width: 580px;
      margin: 0 auto;
    }
    /* Stepper Bar */
    .stepper-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      padding: 0 10px;
    }
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 2;
    }
    .step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 2px solid var(--border-strong);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      transition: all var(--transition-normal);
    }
    .step-item.active .step-circle {
      background: var(--olive-700);
      border-color: var(--olive-700);
      color: #FFFFFF;
      box-shadow: 0 0 0 4px var(--olive-100);
    }
    .step-item.completed .step-circle {
      background: var(--olive-600);
      border-color: var(--olive-600);
      color: #FFFFFF;
    }
    .step-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }
    .step-item.active .step-label, .step-item.completed .step-label {
      color: var(--olive-900);
    }
    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border-subtle);
      margin: 0 8px -18px;
    }
    .step-line.filled {
      background: var(--olive-500);
    }
    /* Card details */
    .step-card {
      padding: 32px;
      margin-bottom: 24px;
    }
    .card-head {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--olive-100);
      color: var(--olive-800);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .input-with-icon {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 18px;
    }
    .input-with-icon .form-input {
      padding-left: 42px;
    }
    .btn-block {
      width: 100%;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .action-buttons-right {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .otp-input-field {
      text-align: center;
      font-size: 24px;
      letter-spacing: 8px;
      font-weight: 700;
      color: var(--olive-900);
    }
    .verified-email-chip {
      background: var(--bg-surface-alt);
      padding: 10px 16px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      font-size: 13.5px;
      color: var(--olive-800);
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--olive-700);
      text-decoration: underline;
      font-weight: 600;
      cursor: pointer;
      margin-left: auto;
    }
    /* Alerts */
    .alert-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      font-size: 14px;
    }
    .alert-success {
      background-color: var(--olive-50);
      border: 1px solid var(--olive-200);
      color: var(--olive-800);
    }
    .alert-error {
      background-color: var(--danger-light);
      border: 1px solid #FFCDD2;
      color: var(--danger);
    }
    .otp-pill {
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      border: 1px solid var(--olive-300);
      font-weight: 700;
      color: var(--olive-800);
      cursor: pointer;
      margin-left: 4px;
    }
    .otp-pill:hover {
      background: var(--olive-100);
    }
    /* DigiLocker */
    .digilocker-badge-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .digilocker-logo-box {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 18px;
      color: #003366;
    }
    .uidai-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      color: #2E7D32;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
    }
    .consent-box {
      margin: 18px 0;
      padding: 12px;
      background: var(--bg-surface-alt);
      border-radius: var(--radius-md);
      font-size: 13px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .helper-text {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      display: block;
    }
    .dl-session-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #EBF3FA;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      border: 1px solid #B8D5E5;
      margin-bottom: 20px;
      color: #0E4968;
    }
    /* Digital Badge */
    .badge-card-wrapper {
      background: #FFFFFF;
      border: 2px solid var(--olive-600);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      margin-bottom: 24px;
    }
    .badge-header {
      background: linear-gradient(135deg, var(--olive-800), var(--olive-900));
      color: #F7F7F2;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge-org {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.08em;
    }
    .badge-body {
      padding: 32px 28px;
    }
    .badge-photo-and-qr {
      display: flex;
      gap: 32px;
      align-items: center;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      flex-shrink: 0;
    }
    .qr-image {
      width: 180px;
      height: 180px;
      border-radius: 8px;
      background: #FFFFFF;
    }
    .qr-subtext {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 8px;
    }
    .pass-code-tag {
      font-family: monospace;
      font-weight: 700;
      color: var(--olive-800);
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: 4px;
      margin-top: 6px;
      font-size: 11.5px;
      border: 1px solid var(--border-subtle);
    }
    .visitor-details-box {
      flex: 1;
    }
    .visitor-avatar-large {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--olive-100);
      color: var(--olive-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin-bottom: 12px;
    }
    .visitor-fullname {
      font-size: 24px;
      margin-bottom: 2px;
    }
    .visitor-org {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 12px;
    }
    .kyc-verified-ribbon {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      color: #2E7D32;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11.5px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .details-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13.5px;
    }
    .detail-row {
      display: flex;
      gap: 8px;
    }
    .detail-title {
      font-weight: 600;
      color: var(--text-secondary);
      width: 80px;
    }
    .detail-val {
      color: var(--text-primary);
      font-weight: 500;
    }
    .badge-footer {
      background: var(--bg-surface-alt);
      padding: 12px 24px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: center;
      gap: 14px;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .actions-toolbar {
      padding: 24px;
      text-align: center;
    }
    .toolbar-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 18px;
    }
    @media (max-width: 650px) {
      .badge-photo-and-qr { flex-direction: column; text-align: center; }
      .detail-row { justify-content: center; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent implements OnInit {
  currentStep = 1;
  loading = false;
  statusMessage = '';
  isError = false;
  devOtpHelper = '';

  // Step 1: Email & OTP
  email = '';
  otpSent = false;
  otpCode = '';

  // Step 2: Personal Details
  firstName = '';
  lastName = '';
  phone = '';
  company = '';
  purpose = 'Enterprise Business Meeting';
  selectedHostId: number | null = null;
  availableHosts: HostDto[] = [];

  // Step 3: DigiLocker
  aadhaarNumber = '';
  digiLockerConsent = true;
  digiLockerSession: any = null;
  digiLockerPin = '123456';
  digiLockerOtp = '246810';

  // Step 4: Digital Badge
  generatedPass: VisitorPassDto | null = null;

  constructor(
    private authService: AuthService,
    private visitorService: VisitorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadHosts();
  }

  loadHosts() {
    this.visitorService.getHosts().subscribe({
      next: res => {
        if (res.success) {
          this.availableHosts = res.data;
          if (this.availableHosts.length > 0) {
            this.selectedHostId = this.availableHosts[0].userId;
          }
        }
      },
      error: () => {}
    });
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sendEmailOtp() {
    this.loading = true;
    this.statusMessage = '';
    this.authService.registerEmail(this.email).subscribe({
      next: res => {
        this.loading = false;
        this.isError = false;
        this.otpSent = true;
        this.statusMessage = res.message || 'OTP dispatched to email';
        if (res.data?.devOtpPreview) {
          this.devOtpHelper = res.data.devOtpPreview;
        }
      },
      error: err => {
        this.loading = false;
        this.isError = true;
        this.statusMessage = err.error?.message || 'Failed to dispatch verification email';
      }
    });
  }

  fillOtp(code: string) {
    this.otpCode = code;
  }

  verifyOtp() {
    this.loading = true;
    this.statusMessage = '';
    this.authService.verifyOtp(this.email, this.otpCode).subscribe({
      next: res => {
        this.loading = false;
        this.isError = false;
        this.statusMessage = 'Email verified successfully!';
        this.devOtpHelper = '';
        this.currentStep = 2;
      },
      error: err => {
        this.loading = false;
        this.isError = true;
        this.statusMessage = err.error?.message || 'Invalid or expired OTP';
      }
    });
  }

  submitVisitorDetails() {
    if (!this.selectedHostId) return;
    this.loading = true;
    this.statusMessage = '';

    const payload = {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      company: this.company,
      purpose: this.purpose,
      hostId: this.selectedHostId
    };

    this.authService.completeProfile(payload).subscribe({
      next: res => {
        this.loading = false;
        this.isError = false;
        this.generatedPass = res.data;
        this.currentStep = 3; // Go to DigiLocker Aadhaar verification!
      },
      error: err => {
        this.loading = false;
        this.isError = true;
        this.statusMessage = err.error?.message || 'Error saving visitor details';
      }
    });
  }

  formatAadhaar() {
    let clean = this.aadhaarNumber.replace(/[^0-9]/g, '');
    if (clean.length > 12) clean = clean.substring(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    this.aadhaarNumber = parts.join(' ');
  }

  isValidAadhaar(val: string): boolean {
    const clean = val.replace(/[^0-9]/g, '');
    return clean.length === 12;
  }

  initiateDigiLocker() {
    this.loading = true;
    this.statusMessage = '';
    this.authService.initiateDigiLocker(this.email, this.aadhaarNumber).subscribe({
      next: res => {
        this.loading = false;
        this.isError = false;
        this.digiLockerSession = res.data;
      },
      error: err => {
        this.loading = false;
        this.isError = true;
        this.statusMessage = err.error?.message || 'DigiLocker initiation failed';
      }
    });
  }

  verifyDigiLockerConsent() {
    if (!this.digiLockerSession) return;
    this.loading = true;
    this.statusMessage = '';

    this.authService.verifyDigiLocker(
      this.email,
      this.digiLockerSession.txnId,
      this.digiLockerPin,
      this.digiLockerOtp
    ).subscribe({
      next: res => {
        this.loading = false;
        this.isError = false;
        if (this.generatedPass) {
          this.generatedPass.aadhaarVerified = true;
        }
        this.currentStep = 4; // Complete and show generated digital badge!
      },
      error: err => {
        this.loading = false;
        this.isError = true;
        this.statusMessage = err.error?.message || 'DigiLocker verification failed';
      }
    });
  }

  printBadge() {
    window.print();
  }

  goToAdminScanner() {
    this.router.navigate(['/admin'], { queryParams: { autoScan: this.generatedPass?.passCode } });
  }
}
