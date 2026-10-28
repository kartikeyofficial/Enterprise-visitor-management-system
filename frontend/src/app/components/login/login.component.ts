import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card card-modern fade-in">
        
        <div class="login-header text-center">
          <div class="brand-badge">
            <i class="ri-shield-keyhole-fill"></i>
          </div>
          <h2>System Sign In</h2>
          <p class="text-secondary">Enter credentials to access Admin Reception, Host approvals, or Visitor records.</p>
        </div>

        <div *ngIf="errorMessage" class="alert-box alert-error">
          <i class="ri-error-warning-line"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Address</label>
            <div class="input-with-icon">
              <i class="ri-mail-line input-icon"></i>
              <input
                id="login-email"
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="name@enterprise.com"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <div class="input-with-icon">
              <i class="ri-lock-line input-icon"></i>
              <input
                id="login-password"
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••••••"
                class="form-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="loading || !email || !password"
          >
            <i *ngIf="loading" class="ri-loader-4-line ri-spin"></i>
            <span *ngIf="!loading">Sign In to Dashboard</span>
            <span *ngIf="loading">Authenticating...</span>
          </button>
        </form>

        <!-- Quick Access Pre-Fill for Admin specified in prompt -->
        <div class="quick-credentials-box">
          <span class="box-title">System Role Credentials:</span>
          
          <div class="cred-item" (click)="fillAdmin()">
            <div class="cred-info">
              <strong>Admin: rajputkartikey10&#64;gmail.com</strong>
              <small>Reception gate scanner, check-in history, audit logs</small>
            </div>
            <span class="btn-fill">Click to Use</span>
          </div>

          <div class="cred-item" (click)="fillHost()">
            <div class="cred-info">
              <strong>Host: vikram.sarabhai&#64;enterprise.com</strong>
              <small>Host employee approval portal</small>
            </div>
            <span class="btn-fill">Click to Use</span>
          </div>
        </div>

        <div class="login-footer text-center">
          <span>New visitor?</span>
          <a routerLink="/register" class="link-bold"> Register for a Pass</a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 65px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      background-color: var(--bg-main);
    }
    .login-card {
      max-width: 460px;
      width: 100%;
      padding: 36px 32px;
    }
    .login-header {
      margin-bottom: 24px;
    }
    .brand-badge {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--olive-700), var(--olive-900));
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(44, 58, 37, 0.2);
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
      margin-top: 10px;
    }
    .alert-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      margin-bottom: 18px;
      font-size: 13.5px;
    }
    .alert-error {
      background: var(--danger-light);
      color: var(--danger);
      border: 1px solid #FFCDD2;
    }
    .quick-credentials-box {
      margin-top: 24px;
      padding: 14px;
      background: var(--bg-surface-alt);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .box-title {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--olive-700);
      margin-bottom: 10px;
      display: block;
    }
    .cred-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      margin-bottom: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cred-item:hover {
      border-color: var(--olive-500);
      background: var(--olive-50);
    }
    .cred-info {
      display: flex;
      flex-direction: column;
      font-size: 12.5px;
    }
    .cred-info small {
      color: var(--text-muted);
      font-size: 11px;
    }
    .btn-fill {
      font-size: 11px;
      font-weight: 700;
      color: var(--olive-800);
      background: var(--olive-100);
      padding: 4px 8px;
      border-radius: 4px;
    }
    .login-footer {
      margin-top: 24px;
      font-size: 13.5px;
      color: var(--text-muted);
    }
    .link-bold {
      font-weight: 700;
      color: var(--olive-700);
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  fillAdmin() {
    this.email = 'rajputkartikey10@gmail.com';
    this.password = 'Admin@12345';
  }

  fillHost() {
    this.email = 'vikram.sarabhai@enterprise.com';
    this.password = 'Host@12345';
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: res => {
        this.loading = false;
        if (res.data?.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
        } else if (res.data?.role === 'ROLE_HOST') {
          this.router.navigate(['/host']);
        } else {
          this.router.navigate(['/register']);
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }
}
