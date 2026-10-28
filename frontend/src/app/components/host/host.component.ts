import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { VisitorPassDto } from '../../models/models';

@Component({
  selector: 'app-host',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="host-page">
      <div class="host-container">
        
        <div class="host-header">
          <div>
            <div class="host-pill"><i class="ri-shield-user-line"></i> Host Employee Portal</div>
            <h1 class="page-title">Visitor Approvals & Schedule</h1>
            <p class="text-secondary">
              Review visitor credentials, check government Aadhaar e-KYC status, and grant physical security access.
            </p>
          </div>

          <div *ngIf="!authService.isHost() && !authService.isAdmin()" class="card-modern staff-login-hint">
            <p><strong>Testing Note:</strong> Log in as an enterprise host employee to test real-time approvals.</p>
            <div class="quick-hosts">
              <button class="btn btn-secondary btn-xs" (click)="loginAsHost('vikram.sarabhai@enterprise.com')">
                Login as Dr. Vikram Sarabhai (CTO)
              </button>
              <button class="btn btn-secondary btn-xs" (click)="loginAsHost('priya.sharma@enterprise.com')">
                Login as Priya Sharma (HR)
              </button>
            </div>
          </div>
        </div>

        <div class="card-modern">
          <div class="section-title-row">
            <div>
              <h3>Pending Visitor Requests</h3>
              <p class="text-muted">Requests requiring your explicit authorization for entrance clearance.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="loadPendingRequests()">
              <i class="ri-refresh-line"></i> Refresh
            </button>
          </div>

          <div class="requests-grid" *ngIf="pendingRequests.length > 0">
            <div *ngFor="let pass of pendingRequests" class="request-card card-modern fade-in">
              <div class="req-top">
                <div class="visitor-avatar">
                  <i class="ri-user-star-line"></i>
                </div>
                <div>
                  <h4 class="v-name">{{ pass.visitorName }}</h4>
                  <span class="v-company">{{ pass.company || 'External Organization' }}</span>
                </div>
                <div class="status-tag">
                  <span class="badge badge-pending">PENDING</span>
                </div>
              </div>

              <div class="req-meta">
                <div class="meta-item">
                  <span class="m-lbl">Meeting Purpose:</span>
                  <span class="m-val">{{ pass.purpose }}</span>
                </div>
                <div class="meta-item">
                  <span class="m-lbl">Requested Date:</span>
                  <span class="m-val">{{ pass.visitDate }}</span>
                </div>
                <div class="meta-item">
                  <span class="m-lbl">Aadhaar e-KYC:</span>
                  <span class="m-val text-green" *ngIf="pass.aadhaarVerified">
                    <i class="ri-verified-badge-fill"></i> Verified by DigiLocker
                  </span>
                  <span class="m-val text-muted" *ngIf="!pass.aadhaarVerified">Not verified</span>
                </div>
              </div>

              <div class="remarks-input-box">
                <input
                  type="text"
                  [(ngModel)]="remarksMap[pass.id]"
                  placeholder="Optional note / security remarks..."
                  class="form-input form-input-sm"
                />
              </div>

              <div class="req-actions">
                <button class="btn btn-primary btn-sm btn-block" (click)="decision(pass.id, 'APPROVED')">
                  <i class="ri-check-line"></i> Approve Access
                </button>
                <button class="btn btn-danger btn-sm" (click)="decision(pass.id, 'REJECTED')">
                  <i class="ri-close-line"></i> Decline
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="pendingRequests.length === 0" class="empty-state">
            <div class="empty-icon"><i class="ri-checkbox-circle-line"></i></div>
            <h4>No Pending Approvals</h4>
            <p class="text-secondary">All incoming visitor passes for your department have been reviewed.</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .host-page {
      padding: 32px 20px 80px;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-main);
    }
    .host-container {
      max-width: 1080px;
      margin: 0 auto;
    }
    .host-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      gap: 20px;
      flex-wrap: wrap;
    }
    .host-pill {
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
      margin-bottom: 8px;
    }
    .page-title {
      font-size: 28px;
      margin-bottom: 4px;
    }
    .staff-login-hint {
      padding: 12px 16px;
      background: #FFFFFF;
      font-size: 13px;
    }
    .quick-hosts {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .request-card {
      border: 1px solid var(--border-strong);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .req-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }
    .visitor-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--olive-100);
      color: var(--olive-800);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .v-name {
      font-size: 16px;
      margin-bottom: 2px;
    }
    .v-company {
      font-size: 12px;
      color: var(--text-muted);
    }
    .status-tag {
      margin-left: auto;
    }
    .req-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      background: var(--bg-surface-alt);
      padding: 12px;
      border-radius: var(--radius-md);
      margin-bottom: 14px;
    }
    .meta-item {
      display: flex;
      justify-content: space-between;
    }
    .m-lbl { color: var(--text-muted); font-weight: 500; }
    .m-val { font-weight: 600; color: var(--olive-900); }
    .text-green { color: #2E7D32; }
    .remarks-input-box {
      margin-bottom: 14px;
    }
    .form-input-sm {
      padding: 8px 12px;
      font-size: 13px;
    }
    .req-actions {
      display: flex;
      gap: 10px;
    }
    .empty-state {
      padding: 48px 20px;
      text-align: center;
    }
    .empty-icon {
      font-size: 48px;
      color: #2E7D32;
      margin-bottom: 12px;
    }
    .btn-xs {
      padding: 4px 10px;
      font-size: 11px;
    }
  `]
})
export class HostComponent implements OnInit {
  pendingRequests: VisitorPassDto[] = [];
  remarksMap: { [key: number]: string } = {};

  constructor(
    public authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadPendingRequests();
  }

  loadPendingRequests() {
    this.adminService.getPendingHostApprovals().subscribe({
      next: res => {
        if (res.success) {
          this.pendingRequests = res.data;
        }
      },
      error: () => {
        // Fallback: load all pending passes if not logged in as specific host
        this.adminService.getAllPasses().subscribe({
          next: res => {
            if (res.success) {
              this.pendingRequests = res.data.filter(p => p.status === 'PENDING_APPROVAL');
            }
          }
        });
      }
    });
  }

  decision(passId: number, status: string) {
    const remarks = this.remarksMap[passId] || '';
    this.adminService.makeHostDecision(passId, status, remarks).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(p => p.id !== passId);
      },
      error: () => {
        // Fallback: admin override
        this.adminService.updatePassStatus(passId, status, remarks).subscribe({
          next: () => {
            this.pendingRequests = this.pendingRequests.filter(p => p.id !== passId);
          }
        });
      }
    });
  }

  loginAsHost(email: string) {
    this.authService.login(email, 'Host@12345').subscribe({
      next: () => {
        this.loadPendingRequests();
      }
    });
  }
}
