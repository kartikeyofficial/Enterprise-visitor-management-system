import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { VisitorPassDto } from '../../models/models';

@Component({
  selector: 'app-badge-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="badge-view-page">
      <div class="badge-container" *ngIf="pass">
        
        <div class="badge-card card-modern printable-badge-area">
          <div class="b-header">
            <div class="b-brand">
              <i class="ri-shield-check-fill"></i>
              <span>OFFICIAL ENTERPRISE VISITOR PASS</span>
            </div>
            <div class="b-status">
              <span class="badge badge-approved">{{ pass.status }}</span>
            </div>
          </div>

          <div class="b-body">
            <div class="b-qr-box">
              <img *ngIf="pass.qrCodeBase64" [src]="pass.qrCodeBase64" alt="QR Code" class="qr-img" />
              <span class="pass-code">{{ pass.passCode }}</span>
            </div>

            <div class="b-info-box">
              <div class="avatar-circle">
                <i class="ri-user-smile-line"></i>
              </div>
              <h2 class="v-name">{{ pass.visitorName }}</h2>
              <div class="v-company">{{ pass.company || 'External Guest' }}</div>

              <div class="aadhaar-badge" *ngIf="pass.aadhaarVerified">
                <i class="ri-verified-badge-fill"></i>
                <span>DigiLocker Aadhaar e-KYC Verified</span>
              </div>

              <div class="meta-rows">
                <div class="meta-r">
                  <span class="m-k">Host:</span>
                  <span class="m-v">{{ pass.hostName }} ({{ pass.hostDepartment }})</span>
                </div>
                <div class="meta-r">
                  <span class="m-k">Purpose:</span>
                  <span class="m-v">{{ pass.purpose }}</span>
                </div>
                <div class="meta-r">
                  <span class="m-k">Date:</span>
                  <span class="m-v">{{ pass.visitDate }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="b-footer">
            <span>Terminal: Reception Gate 1</span>
            <span>•</span>
            <span>Security Verified</span>
          </div>
        </div>

        <div class="badge-actions no-print">
          <button class="btn btn-primary" (click)="printBadge()">
            <i class="ri-printer-line"></i> Print Visitor Badge
          </button>
          <a [routerLink]="['/admin']" [queryParams]="{autoScan: pass.passCode}" class="btn btn-secondary">
            <i class="ri-qr-scan-2-line"></i> Test Scan in Reception Desk
          </a>
        </div>

      </div>

      <div *ngIf="loading" class="text-center py-5">
        <i class="ri-loader-4-line ri-spin" style="font-size: 36px; color: var(--olive-700);"></i>
        <p class="text-muted mt-2">Loading digital badge...</p>
      </div>

      <div *ngIf="!loading && !pass" class="text-center py-5">
        <h3>Pass Not Found</h3>
        <p class="text-muted">The requested visitor pass code could not be found or has expired.</p>
        <a routerLink="/register" class="btn btn-primary mt-3">Register New Pass</a>
      </div>
    </div>
  `,
  styles: [`
    .badge-view-page {
      padding: 40px 20px;
      min-height: calc(100vh - 65px);
      background-color: var(--bg-main);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .badge-container {
      max-width: 600px;
      width: 100%;
    }
    .badge-card {
      border: 2px solid var(--olive-700);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      background: #FFFFFF;
      margin-bottom: 24px;
    }
    .b-header {
      background: linear-gradient(135deg, var(--olive-800), var(--olive-900));
      color: #FFFFFF;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .b-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .b-body {
      padding: 32px 24px;
      display: flex;
      gap: 28px;
      align-items: center;
    }
    .b-qr-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px;
      background: var(--bg-surface-alt);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-strong);
    }
    .qr-img {
      width: 160px;
      height: 160px;
      border-radius: 6px;
    }
    .pass-code {
      font-family: monospace;
      font-weight: 700;
      font-size: 11px;
      margin-top: 8px;
      color: var(--olive-900);
    }
    .avatar-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--olive-100);
      color: var(--olive-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .v-name {
      font-size: 22px;
      margin-bottom: 2px;
    }
    .v-company {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    .aadhaar-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      color: #2E7D32;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 14px;
    }
    .meta-rows {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }
    .meta-r {
      display: flex;
      gap: 8px;
    }
    .m-k { font-weight: 600; color: var(--text-secondary); width: 70px; }
    .m-v { font-weight: 500; color: var(--text-primary); }
    .b-footer {
      background: var(--bg-surface-alt);
      padding: 12px 24px;
      display: flex;
      justify-content: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-subtle);
    }
    .badge-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  `]
})
export class BadgeViewComponent implements OnInit {
  pass: VisitorPassDto | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private visitorService: VisitorService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const code = params.get('passCode');
      if (code) {
        this.visitorService.getPassByCode(code).subscribe({
          next: res => {
            this.loading = false;
            if (res.success) {
              this.pass = res.data;
            }
          },
          error: () => {
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  printBadge() {
    window.print();
  }
}
