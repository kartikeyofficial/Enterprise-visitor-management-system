import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-badge">
            <i class="ri-shield-star-fill"></i>
            <span>Enterprise Security • DigiLocker e-KYC • QR Pass</span>
          </div>

          <h1 class="hero-title">
            Enterprise Visitor <br/>
            <span class="text-gradient">Management System</span>
          </h1>

          <p class="hero-subtitle">
            Engineered with Java Spring Boot, MySQL, and Angular. Features real-time visitor registration, 
            OTP mail verification, DigiLocker Aadhaar e-KYC, host authorization, and instant QR scan check-in.
          </p>

          <div class="hero-cta-group">
            <a routerLink="/register" class="btn btn-primary btn-lg">
              <i class="ri-user-add-line"></i>
              <span>Register for Visitor Pass</span>
            </a>
            <a routerLink="/admin" class="btn btn-secondary btn-lg">
              <i class="ri-qr-scan-2-line"></i>
              <span>Launch Reception Scanner</span>
            </a>
          </div>

          <!-- Feature Cards Grid -->
          <div class="features-grid">
            <div class="feature-card card-modern">
              <div class="f-icon olive"><i class="ri-mail-check-line"></i></div>
              <h3>Email OTP Verification</h3>
              <p>Instant verification powered by Spring Mail starter with cryptographic 6-digit OTP delivery.</p>
            </div>

            <div class="feature-card card-modern">
              <div class="f-icon green"><i class="ri-fingerprint-line"></i></div>
              <h3>DigiLocker Aadhaar e-KYC</h3>
              <p>Government ID verification via DigiLocker consent, PIN validation, and masked Aadhaar storage.</p>
            </div>

            <div class="feature-card card-modern">
              <div class="f-icon gold"><i class="ri-qr-code-line"></i></div>
              <h3>Signed Digital Badges</h3>
              <p>Instant ZXing-generated scannable QR tokens containing encrypted visitor & host authorization data.</p>
            </div>

            <div class="feature-card card-modern">
              <div class="f-icon dark"><i class="ri-database-2-line"></i></div>
              <h3>Real-Time Check-In Audit</h3>
              <p>Camera and laser QR scanning logs arrival date, time, and admin ID directly into MySQL relational tables.</p>
            </div>
          </div>

          <!-- Workflow Infographic -->
          <div class="workflow-card card-modern">
            <h3 class="wf-title"><i class="ri-node-tree"></i> End-to-End Enterprise Check-in Pipeline</h3>
            <div class="workflow-steps">
              <div class="wf-step">
                <div class="wf-num">1</div>
                <strong>Email & OTP</strong>
                <span>Mail OTP verification</span>
              </div>
              <div class="wf-arrow"><i class="ri-arrow-right-line"></i></div>
              <div class="wf-step">
                <div class="wf-num">2</div>
                <strong>Profile & Host</strong>
                <span>Designate employee host</span>
              </div>
              <div class="wf-arrow"><i class="ri-arrow-right-line"></i></div>
              <div class="wf-step">
                <div class="wf-num">3</div>
                <strong>DigiLocker KYC</strong>
                <span>Aadhaar ID authorization</span>
              </div>
              <div class="wf-arrow"><i class="ri-arrow-right-line"></i></div>
              <div class="wf-step">
                <div class="wf-num">4</div>
                <strong>QR Code Pass</strong>
                <span>Generate printable badge</span>
              </div>
              <div class="wf-arrow"><i class="ri-arrow-right-line"></i></div>
              <div class="wf-step highlight-step">
                <div class="wf-num">5</div>
                <strong>Reception Scan</strong>
                <span>Check-in date & time in MySQL</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      background-color: var(--bg-main);
      min-height: calc(100vh - 65px);
      padding-bottom: 80px;
    }
    .hero-section {
      padding: 60px 20px 40px;
    }
    .hero-container {
      max-width: 1140px;
      margin: 0 auto;
      text-align: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 18px;
      background: var(--olive-100);
      color: var(--olive-800);
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }
    .hero-title {
      font-size: 54px;
      line-height: 1.1;
      margin-bottom: 20px;
      font-weight: 800;
    }
    .text-gradient {
      background: linear-gradient(135deg, var(--olive-900), var(--olive-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 18px;
      color: var(--text-secondary);
      max-width: 720px;
      margin: 0 auto 36px;
      line-height: 1.6;
    }
    .hero-cta-group {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 64px;
      flex-wrap: wrap;
    }
    .btn-lg {
      padding: 14px 28px;
      font-size: 16px;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 22px;
      margin-bottom: 48px;
      text-align: left;
    }
    .feature-card {
      padding: 28px 24px;
    }
    .f-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }
    .f-icon.olive { background: var(--olive-100); color: var(--olive-800); }
    .f-icon.green { background: #E8F5E9; color: #2E7D32; }
    .f-icon.gold  { background: #FFF8E1; color: #B78103; }
    .f-icon.dark  { background: var(--olive-900); color: #F7F7F2; }
    .feature-card h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    .feature-card p {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .workflow-card {
      padding: 32px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
    }
    .wf-title {
      font-size: 18px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--olive-900);
    }
    .workflow-steps {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .wf-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
      min-width: 140px;
    }
    .wf-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--olive-100);
      color: var(--olive-800);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .wf-step strong {
      font-size: 14px;
      color: var(--olive-900);
    }
    .wf-step span {
      font-size: 11.5px;
      color: var(--text-muted);
      text-align: center;
    }
    .highlight-step .wf-num {
      background: var(--olive-700);
      color: #FFFFFF;
    }
    .wf-arrow {
      color: var(--border-strong);
      font-size: 20px;
    }
    @media (max-width: 768px) {
      .hero-title { font-size: 38px; }
      .wf-arrow { display: none; }
    }
  `]
})
export class HomeComponent {}
