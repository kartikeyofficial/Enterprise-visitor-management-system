import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <!-- Brand -->
        <a routerLink="/" class="brand">
          <div class="brand-icon">
            <i class="ri-shield-keyhole-line"></i>
          </div>
          <div class="brand-text">
            <span class="brand-title">AegisPass</span>
            <span class="brand-subtitle">Enterprise VMS</span>
          </div>
        </a>

        <!-- Navigation Links -->
        <nav class="nav-menu">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <i class="ri-home-4-line"></i>
            <span>Overview</span>
          </a>
          <a routerLink="/register" routerLinkActive="active" class="nav-link">
            <i class="ri-user-add-line"></i>
            <span>Visitor Check-In</span>
          </a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-link">
            <i class="ri-qr-scan-2-line"></i>
            <span>Reception Scanner</span>
          </a>
          <a routerLink="/host" routerLinkActive="active" class="nav-link">
            <i class="ri-shield-user-line"></i>
            <span>Host Approvals</span>
          </a>
        </nav>

        <!-- User Actions / Profile -->
        <div class="nav-actions">
          <ng-container *ngIf="authService.isLoggedIn(); else loginButton">
            <div class="user-badge-container">
              <div class="user-avatar">
                <i class="ri-user-3-line"></i>
              </div>
              <div class="user-details">
                <span class="user-name">{{ authService.userName() }}</span>
                <span class="user-role-pill" [ngClass]="getRoleClass()">
                  {{ getRoleLabel() }}
                </span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="onLogout()">
              <i class="ri-logout-box-r-line"></i>
              <span>Logout</span>
            </button>
          </ng-container>

          <ng-template #loginButton>
            <a routerLink="/login" class="btn btn-primary btn-sm">
              <i class="ri-lock-line"></i>
              <span>Sign In / Admin</span>
            </a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(44, 58, 37, 0.05);
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--olive-700), var(--olive-900));
      color: #F7F7F2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 10px rgba(44, 58, 37, 0.2);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 19px;
      font-weight: 700;
      color: var(--olive-900);
      line-height: 1.1;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--olive-500);
    }
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-secondary);
      border-radius: var(--radius-full);
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    .nav-link:hover {
      background-color: var(--bg-surface-tint);
      color: var(--olive-900);
    }
    .nav-link.active {
      background-color: var(--olive-100);
      color: var(--olive-800);
      font-weight: 600;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-badge-container {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: var(--bg-surface-alt);
      padding: 4px 12px 4px 6px;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-subtle);
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--olive-200);
      color: var(--olive-800);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--olive-900);
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role-pill {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .role-admin { color: #BA3C2A; }
    .role-host { color: #2E7D32; }
    .role-visitor { color: var(--olive-600); }
    .btn-sm {
      padding: 6px 14px;
      font-size: 13px;
    }
    @media (max-width: 768px) {
      .nav-menu { display: none; }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  getRoleLabel(): string {
    const role = this.authService.currentUserSignal()?.role;
    if (role === 'ROLE_ADMIN') return 'Admin (Reception)';
    if (role === 'ROLE_HOST') return 'Host Staff';
    return 'Visitor';
  }

  getRoleClass(): string {
    const role = this.authService.currentUserSignal()?.role;
    if (role === 'ROLE_ADMIN') return 'role-admin';
    if (role === 'ROLE_HOST') return 'role-host';
    return 'role-visitor';
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
