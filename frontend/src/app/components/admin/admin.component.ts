import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AuditLog, CheckInRecord, DashboardStats, ScanResultResponse, VisitorPassDto } from '../../models/models';
import confetti from 'canvas-confetti';

declare var Html5Qrcode: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-page">
      <div class="admin-container">
        
        <!-- Header Banner -->
        <div class="admin-header">
          <div>
            <div class="reception-tag">
              <i class="ri-building-line"></i> Main Reception Gate Terminal
            </div>
            <h1 class="page-title">Reception Command & QR Scanner</h1>
            <p class="text-secondary">
              Real-time visitor check-ins, QR badge verification, host approvals, and database audit logs.
            </p>
          </div>

          <!-- Admin Status / Quick Switch -->
          <div class="admin-user-card" [class.is-admin]="authService.isAdmin()">
            <div class="status-indicator" [class.online]="authService.isAdmin()"></div>
            <div class="admin-user-info">
              <span class="user-role-lbl">Terminal Operator</span>
              <span class="user-email-val">{{ authService.currentUserSignal()?.email || 'Not Authenticated' }}</span>
            </div>
            <button *ngIf="!authService.isAdmin()" class="btn btn-primary btn-sm" (click)="quickLoginAdmin()">
              <i class="ri-login-box-line"></i> Login as rajputkartikey10&#64;gmail.com
            </button>
          </div>
        </div>

        <!-- Dashboard Stat Cards -->
        <div class="stats-grid">
          <div class="stat-card card-modern">
            <div class="stat-icon-wrapper olive">
              <i class="ri-user-follow-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Visitors Today</span>
              <span class="stat-val">{{ stats?.totalVisitorsToday || 0 }}</span>
            </div>
          </div>

          <div class="stat-card card-modern">
            <div class="stat-icon-wrapper green">
              <i class="ri-building-2-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Active Inside Building</span>
              <span class="stat-val">{{ stats?.activeInsideBuilding || 0 }}</span>
            </div>
          </div>

          <div class="stat-card card-modern">
            <div class="stat-icon-wrapper amber">
              <i class="ri-time-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Pending Approvals</span>
              <span class="stat-val">{{ stats?.pendingApprovals || 0 }}</span>
            </div>
          </div>

          <div class="stat-card card-modern">
            <div class="stat-icon-wrapper dark">
              <i class="ri-database-2-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Check-Ins in DB</span>
              <span class="stat-val">{{ stats?.totalCheckInsAllTime || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="tab-bar">
          <button class="tab-btn" [class.active]="activeTab === 'scanner'" (click)="activeTab = 'scanner'">
            <i class="ri-qr-scan-2-line"></i> QR Scanner & Check-In
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'history'" (click)="loadCheckInHistory(); activeTab = 'history'">
            <i class="ri-history-line"></i> Check-In Scan History (MySQL)
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'passes'" (click)="loadAllPasses(); activeTab = 'passes'">
            <i class="ri-id-card-line"></i> Visitor Passes & Approvals
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'audit'" (click)="loadAuditLogs(); activeTab = 'audit'">
            <i class="ri-shield-line"></i> Security Audit Logs
          </button>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 1: QR SCANNER & LIVE CHECK-IN -->
        <!-- ============================================================== -->
        <div *ngIf="activeTab === 'scanner'" class="scanner-section fade-in">
          
          <div class="scanner-layout">
            <!-- Left: Camera Viewfinder & File / Code input -->
            <div class="card-modern scanner-box">
              <div class="scanner-header">
                <h3><i class="ri-camera-lens-line"></i> Optical QR Scanner</h3>
                <span class="scanner-status pulse-active">READY TO SCAN</span>
              </div>

              <!-- Interactive Camera / Video scanner viewport -->
              <div class="viewfinder-container">
                <div id="qr-reader" class="html5-qr-reader"></div>
                <div class="viewfinder-overlay" *ngIf="!cameraActive">
                  <div class="laser-scanner"></div>
                  <div class="viewfinder-center">
                    <i class="ri-qr-code-line"></i>
                    <span>Position Visitor Badge QR Code</span>
                  </div>
                </div>
              </div>

              <div class="scanner-controls">
                <button *ngIf="!cameraActive" class="btn btn-secondary btn-block" (click)="startCameraScan()">
                  <i class="ri-camera-switch-line"></i> Turn On Web Camera Scanner
                </button>
                <button *ngIf="cameraActive" class="btn btn-danger btn-block" (click)="stopCameraScan()">
                  <i class="ri-stop-circle-line"></i> Stop Camera Scanner
                </button>
              </div>

              <!-- Quick / Manual Pass Scan Input -->
              <div class="manual-scan-box">
                <div class="divider-text"><span>OR ENTER / TEST PASS CODE</span></div>
                <div class="input-with-button">
                  <input
                    type="text"
                    [(ngModel)]="manualCodeInput"
                    placeholder="e.g. VMS-20261028-A1B2C3"
                    class="form-input"
                    (keyup.enter)="processScan(manualCodeInput)"
                  />
                  <button
                    class="btn btn-primary"
                    [disabled]="!manualCodeInput || isScanning"
                    (click)="processScan(manualCodeInput)"
                  >
                    <i *ngIf="isScanning" class="ri-loader-4-line ri-spin"></i>
                    <i *ngIf="!isScanning" class="ri-scan-2-line"></i>
                    <span>Scan</span>
                  </button>
                </div>

                <div class="file-upload-hint">
                  <label class="btn-file-upload">
                    <i class="ri-image-line"></i> Upload QR Code Image to Scan
                    <input type="file" accept="image/*" (change)="onFileSelected($event)" style="display: none;" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Right: Real-time Scan Verification Result & Database Entry -->
            <div class="scan-result-column">
              
              <!-- Result Banner when Scanned -->
              <div *ngIf="scanResult" class="card-modern result-card fade-in" [ngClass]="scanResult.success ? 'success-border' : 'error-border'">
                <div class="result-header">
                  <div class="action-icon" [ngClass]="scanResult.actionType">
                    <i [class]="getActionIcon(scanResult.actionType)"></i>
                  </div>
                  <div>
                    <h3 class="result-title">{{ scanResult.actionType === 'CHECKED_IN' ? 'Check-In Successful' : 'Check-Out Recorded' }}</h3>
                    <span class="db-sync-badge">
                      <i class="ri-database-2-fill"></i> Stored in MySQL at {{ scanResult.scanDateTime | date:'mediumTime' }}
                    </span>
                  </div>
                </div>

                <div class="result-details-grid">
                  <div class="r-row">
                    <span class="r-lbl">Visitor:</span>
                    <span class="r-val font-bold">{{ scanResult.visitorName }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Company:</span>
                    <span class="r-val">{{ scanResult.company }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Host:</span>
                    <span class="r-val">{{ scanResult.hostName }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Pass Code:</span>
                    <span class="r-val mono">{{ scanResult.passCode }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Scanned By Admin:</span>
                    <span class="r-val">{{ scanResult.scannedByAdmin }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Scan Timestamp:</span>
                    <span class="r-val highlight">{{ scanResult.scanDateTime | date:'dd MMM yyyy, hh:mm:ss a' }}</span>
                  </div>
                  <div class="r-row">
                    <span class="r-lbl">Gate / Terminal:</span>
                    <span class="r-val">{{ scanResult.terminalLocation }}</span>
                  </div>
                </div>

                <div class="result-footer">
                  <div class="badge badge-approved">
                    <i class="ri-shield-check-line"></i> Verified & Check-in Stored
                  </div>
                  <button class="btn btn-secondary btn-sm" (click)="scanResult = null">Clear Result</button>
                </div>
              </div>

              <!-- Waiting State Placeholder -->
              <div *ngIf="!scanResult" class="card-modern empty-scanner-card">
                <div class="empty-icon">
                  <i class="ri-qr-code-fill"></i>
                </div>
                <h3>Awaiting Visitor Badge Scan</h3>
                <p class="text-secondary">
                  Scan visitor QR Code via camera or type pass code to automatically log arrival date, time, and admin credentials in MySQL.
                </p>
                <div class="feature-bullets">
                  <div><i class="ri-check-line"></i> Real-time host notification</div>
                  <div><i class="ri-check-line"></i> Instant timestamped check-in record</div>
                  <div><i class="ri-check-line"></i> Tamper-proof audit trail</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- ============================================================== -->
        <!-- TAB 2: CHECK-IN SCAN HISTORY (MYSQL PERSISTENCE) -->
        <!-- ============================================================== -->
        <div *ngIf="activeTab === 'history'" class="card-modern fade-in">
          <div class="table-header">
            <div>
              <h3>Check-In Scan History (MySQL Database)</h3>
              <p class="text-secondary">Real-time scan logs with date, time, admin operator, and terminal gate.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="loadCheckInHistory()">
              <i class="ri-refresh-line"></i> Refresh History
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Visitor Name</th>
                  <th>Company</th>
                  <th>Pass Code</th>
                  <th>Check-In Scan Time</th>
                  <th>Check-Out Time</th>
                  <th>Scanned By Admin</th>
                  <th>Terminal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of checkInHistory">
                  <td>#{{ record.id }}</td>
                  <td class="font-bold">{{ record.pass.visitorName || 'Visitor' }}</td>
                  <td>{{ record.pass.company || 'N/A' }}</td>
                  <td><span class="code-chip">{{ record.pass.passCode }}</span></td>
                  <td class="font-bold text-olive">{{ record.checkInTime | date:'dd MMM yyyy, hh:mm:ss a' }}</td>
                  <td>
                    <span *ngIf="record.checkOutTime">{{ record.checkOutTime | date:'hh:mm:ss a' }}</span>
                    <span *ngIf="!record.checkOutTime" class="badge badge-checkedin">INSIDE</span>
                  </td>
                  <td>{{ record.scannedByAdmin }}</td>
                  <td>{{ record.terminalLocation }}</td>
                  <td>
                    <span class="badge" [ngClass]="record.checkOutTime ? 'badge-checkedout' : 'badge-checkedin'">
                      {{ record.checkOutTime ? 'COMPLETED' : 'CHECKED IN' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="checkInHistory.length === 0">
                  <td colspan="9" class="text-center py-4 text-muted">
                    No check-in scans recorded yet. Scan a visitor badge above!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 3: VISITOR PASSES & APPROVAL OVERRIDES -->
        <!-- ============================================================== -->
        <div *ngIf="activeTab === 'passes'" class="card-modern fade-in">
          <div class="table-header">
            <div>
              <h3>All Enterprise Visitor Passes</h3>
              <p class="text-secondary">Manage visitor requests, check identity KYC status, and override approval decisions.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="loadAllPasses()">
              <i class="ri-refresh-line"></i> Refresh
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pass Code</th>
                  <th>Visitor</th>
                  <th>Host Employee</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>KYC Status</th>
                  <th>Pass Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let pass of allPasses">
                  <td><span class="code-chip">{{ pass.passCode }}</span></td>
                  <td>
                    <div class="user-cell">
                      <strong>{{ pass.visitorName }}</strong>
                      <small>{{ pass.visitorEmail }}</small>
                    </div>
                  </td>
                  <td>{{ pass.hostName }}</td>
                  <td>{{ pass.purpose }}</td>
                  <td>{{ pass.visitDate }}</td>
                  <td>
                    <span class="uidai-tag" *ngIf="pass.aadhaarVerified">
                      <i class="ri-verified-badge-fill"></i> Aadhaar Verified
                    </span>
                    <span class="text-muted" *ngIf="!pass.aadhaarVerified">Pending KYC</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusBadgeClass(pass.status)">
                      {{ pass.status }}
                    </span>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        *ngIf="pass.status === 'PENDING_APPROVAL'"
                        class="btn btn-primary btn-xs"
                        (click)="adminPassDecision(pass.id, 'APPROVED')"
                      >
                        Approve
                      </button>
                      <button
                        *ngIf="pass.status === 'PENDING_APPROVAL'"
                        class="btn btn-danger btn-xs"
                        (click)="adminPassDecision(pass.id, 'REJECTED')"
                      >
                        Reject
                      </button>
                      <button
                        class="btn btn-secondary btn-xs"
                        (click)="simulateScanFromTable(pass.passCode)"
                      >
                        Scan Pass
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- TAB 4: SECURITY AUDIT LOGS -->
        <!-- ============================================================== -->
        <div *ngIf="activeTab === 'audit'" class="card-modern fade-in">
          <div class="table-header">
            <div>
              <h3>Security & Compliance Audit Trail</h3>
              <p class="text-secondary">Immutable log of authentications, KYC verifications, scans, and approvals.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="loadAuditLogs()">
              <i class="ri-refresh-line"></i> Refresh
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Audit Details</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of auditLogs">
                  <td class="text-muted">{{ log.timestamp | date:'dd MMM yyyy, hh:mm:ss a' }}</td>
                  <td><span class="audit-action-chip">{{ log.action }}</span></td>
                  <td class="font-bold">{{ log.performedBy }}</td>
                  <td>{{ log.details }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      padding: 32px 20px 80px;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-main);
    }
    .admin-container {
      max-width: 1280px;
      margin: 0 auto;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      gap: 20px;
      flex-wrap: wrap;
    }
    .reception-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: var(--olive-100);
      color: var(--olive-800);
      font-size: 11.5px;
      font-weight: 700;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    .page-title {
      font-size: 28px;
      margin-bottom: 4px;
    }
    .admin-user-card {
      background: #FFFFFF;
      padding: 12px 18px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }
    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #BA3C2A;
    }
    .status-indicator.online {
      background: #2E7D32;
      box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.2);
    }
    .admin-user-info {
      display: flex;
      flex-direction: column;
    }
    .user-role-lbl {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
    }
    .user-email-val {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--olive-900);
    }
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 28px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .stat-icon-wrapper.olive { background: var(--olive-100); color: var(--olive-800); }
    .stat-icon-wrapper.green { background: #E8F5E9; color: #2E7D32; }
    .stat-icon-wrapper.amber { background: #FFF8E1; color: #B78103; }
    .stat-icon-wrapper.dark  { background: var(--olive-900); color: #F7F7F2; }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 12.5px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .stat-val {
      font-size: 26px;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--olive-900);
      line-height: 1.1;
    }
    /* Tab Bar */
    .tab-bar {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid var(--border-subtle);
      margin-bottom: 24px;
      overflow-x: auto;
    }
    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: none;
      border: none;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: var(--olive-800);
      background: rgba(222, 230, 216, 0.3);
    }
    .tab-btn.active {
      color: var(--olive-800);
      border-bottom-color: var(--olive-700);
      font-weight: 700;
    }
    /* Scanner Layout */
    .scanner-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .scanner-box {
      padding: 24px;
    }
    .scanner-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .scanner-status {
      font-size: 11px;
      font-weight: 700;
      color: #2E7D32;
      background: #E8F5E9;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }
    .viewfinder-container {
      position: relative;
      height: 280px;
      background: #1A2118;
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .html5-qr-reader {
      width: 100%;
      height: 100%;
    }
    .viewfinder-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      pointer-events: none;
    }
    .viewfinder-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #DEE6D8;
    }
    .viewfinder-center i {
      font-size: 56px;
      color: #8F9E85;
    }
    .laser-scanner {
      position: absolute;
      top: 0;
      left: 10%;
      right: 10%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #4CAF50, transparent);
      box-shadow: 0 0 10px #4CAF50;
      animation: scanLaser 2.2s infinite ease-in-out;
    }
    @keyframes scanLaser {
      0% { top: 15%; opacity: 0.8; }
      50% { top: 85%; opacity: 1; }
      100% { top: 15%; opacity: 0.8; }
    }
    .scanner-controls {
      margin-bottom: 20px;
    }
    .divider-text {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 16px 0;
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    .divider-text::before, .divider-text::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--border-subtle);
    }
    .divider-text span {
      padding: 0 10px;
    }
    .input-with-button {
      display: flex;
      gap: 10px;
    }
    .btn-file-upload {
      display: block;
      margin-top: 12px;
      text-align: center;
      font-size: 13px;
      color: var(--olive-700);
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-md);
      border: 1px dashed var(--olive-300);
      background: var(--bg-surface-alt);
    }
    .btn-file-upload:hover {
      background: var(--olive-100);
    }
    /* Results Column */
    .result-card {
      padding: 24px;
      border-left: 6px solid #2E7D32;
    }
    .result-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .action-icon.CHECKED_IN { background: #E8F5E9; color: #2E7D32; }
    .action-icon.CHECKED_OUT { background: #E3F2FD; color: #1976D2; }
    .action-icon.DENIED { background: #FFEBEE; color: #D32F2F; }
    .db-sync-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      color: #2E7D32;
      font-weight: 600;
    }
    .result-details-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13.5px;
      margin-bottom: 20px;
    }
    .r-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed var(--border-subtle);
      padding-bottom: 6px;
    }
    .r-lbl { color: var(--text-muted); font-weight: 600; }
    .r-val { color: var(--text-primary); text-align: right; }
    .r-val.highlight { color: var(--olive-800); font-weight: 700; }
    .result-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
    }
    /* Empty scanner card */
    .empty-scanner-card {
      padding: 40px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--bg-surface-alt);
      color: var(--olive-400);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      margin-bottom: 16px;
    }
    .feature-bullets {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      text-align: left;
    }
    .feature-bullets i { color: #2E7D32; margin-right: 6px; font-weight: 700; }
    /* Table styles */
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
      text-align: left;
    }
    .data-table th {
      background: var(--bg-surface-alt);
      padding: 12px 14px;
      font-weight: 700;
      color: var(--olive-900);
      border-bottom: 2px solid var(--border-subtle);
      white-space: nowrap;
    }
    .data-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-primary);
    }
    .code-chip {
      font-family: monospace;
      font-weight: 700;
      background: var(--bg-surface-alt);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
      font-size: 12px;
    }
    .uidai-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      color: #2E7D32;
      font-weight: 600;
    }
    .audit-action-chip {
      background: var(--olive-100);
      color: var(--olive-800);
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .btn-xs {
      padding: 4px 10px;
      font-size: 12px;
      border-radius: var(--radius-sm);
    }
    .table-actions {
      display: flex;
      gap: 6px;
    }
    @media (max-width: 850px) {
      .scanner-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab: 'scanner' | 'history' | 'passes' | 'audit' = 'scanner';
  stats: DashboardStats | null = null;
  manualCodeInput = '';
  isScanning = false;
  scanResult: ScanResultResponse | null = null;
  cameraActive = false;
  html5QrScanner: any = null;

  checkInHistory: CheckInRecord[] = [];
  allPasses: VisitorPassDto[] = [];
  auditLogs: AuditLog[] = [];

  constructor(
    public authService: AuthService,
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadStats();
    this.route.queryParams.subscribe(params => {
      if (params['autoScan']) {
        this.manualCodeInput = params['autoScan'];
        this.processScan(params['autoScan']);
      }
    });
  }

  ngOnDestroy() {
    this.stopCameraScan();
  }

  quickLoginAdmin() {
    // 1-Click login as specific requested admin email rajputkartikey10@gmail.com
    this.authService.login('rajputkartikey10@gmail.com', 'Admin@12345').subscribe({
      next: () => {
        this.loadStats();
      },
      error: (err) => {
        console.error('Failed to log in as admin:', err);
      }
    });
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe({
      next: res => {
        if (res.success) {
          this.stats = res.data;
        }
      },
      error: () => {}
    });
  }

  loadCheckInHistory() {
    this.adminService.getCheckInHistory().subscribe({
      next: res => {
        if (res.success) {
          this.checkInHistory = res.data;
        }
      },
      error: () => {}
    });
  }

  loadAllPasses() {
    this.adminService.getAllPasses().subscribe({
      next: res => {
        if (res.success) {
          this.allPasses = res.data;
        }
      },
      error: () => {}
    });
  }

  loadAuditLogs() {
    this.adminService.getAuditLogs().subscribe({
      next: res => {
        if (res.success) {
          this.auditLogs = res.data;
        }
      },
      error: () => {}
    });
  }

  processScan(payload: string) {
    if (!payload || this.isScanning) return;
    this.isScanning = true;

    this.adminService.scanQr(payload).subscribe({
      next: res => {
        this.isScanning = false;
        if (res.success) {
          this.scanResult = res.data;
          this.loadStats();
          // Fire celebration confetti!
          this.triggerConfetti();
        }
      },
      error: err => {
        this.isScanning = false;
        alert(err.error?.message || 'Scan verification failed');
      }
    });
  }

  triggerConfetti() {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }

  simulateScanFromTable(code: string) {
    this.activeTab = 'scanner';
    this.manualCodeInput = code;
    this.processScan(code);
  }

  adminPassDecision(passId: number, status: string) {
    this.adminService.updatePassStatus(passId, status).subscribe({
      next: () => {
        this.loadAllPasses();
        this.loadStats();
      }
    });
  }

  startCameraScan() {
    this.cameraActive = true;
    setTimeout(() => {
      try {
        if (typeof Html5Qrcode !== 'undefined') {
          this.html5QrScanner = new Html5Qrcode('qr-reader');
          this.html5QrScanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              this.stopCameraScan();
              this.processScan(decodedText);
            },
            () => {}
          ).catch((e: any) => {
            console.warn('Camera start error:', e);
            this.cameraActive = false;
          });
        }
      } catch (e) {
        console.warn('QR library error:', e);
      }
    }, 100);
  }

  stopCameraScan() {
    if (this.html5QrScanner) {
      try {
        this.html5QrScanner.stop().then(() => {
          this.html5QrScanner.clear();
          this.cameraActive = false;
        }).catch(() => {
          this.cameraActive = false;
        });
      } catch {
        this.cameraActive = false;
      }
    } else {
      this.cameraActive = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (typeof Html5Qrcode !== 'undefined') {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCode.scanFile(file, true)
        .then((decodedText: string) => {
          this.processScan(decodedText);
        })
        .catch((err: any) => {
          alert('Could not decode QR code from uploaded image. Try manual pass code.');
        });
    }
  }

  getActionIcon(action: string): string {
    if (action === 'CHECKED_IN') return 'ri-login-box-line';
    if (action === 'CHECKED_OUT') return 'ri-logout-box-line';
    return 'ri-close-circle-line';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'CHECKED_IN': return 'badge-checkedin';
      case 'CHECKED_OUT': return 'badge-checkedout';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }
}
