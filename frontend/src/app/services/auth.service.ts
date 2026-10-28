import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthResponse, DigiLockerInitResponse, VisitorPassDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  // Signals for reactive state management
  currentUserSignal = signal<AuthResponse | null>(this.getStoredUser());

  isLoggedIn = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ROLE_ADMIN');
  isHost = computed(() => this.currentUserSignal()?.role === 'ROLE_HOST');
  isVisitor = computed(() => this.currentUserSignal()?.role === 'ROLE_VISITOR');
  userName = computed(() => this.currentUserSignal()?.name || this.currentUserSignal()?.email || 'User');

  constructor(private http: HttpClient) {}

  private getStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem('vms_user_info');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  registerEmail(email: string): Observable<ApiResponse<{ email: string; message: string; devOtpPreview?: string }>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register-email`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  completeProfile(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    company?: string;
    purpose: string;
    hostId: number;
    visitDate?: string;
  }): Observable<ApiResponse<VisitorPassDto>> {
    return this.http.post<ApiResponse<VisitorPassDto>>(`${this.apiUrl}/complete-profile`, data);
  }

  initiateDigiLocker(email: string, aadhaarNumber: string): Observable<ApiResponse<DigiLockerInitResponse>> {
    return this.http.post<ApiResponse<DigiLockerInitResponse>>(`${this.apiUrl}/digilocker/initiate`, {
      email,
      aadhaarNumber
    });
  }

  verifyDigiLocker(email: string, txnId: string, securityPin: string, aadhaarOtp: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/digilocker/verify`, {
      email,
      txnId,
      securityPin,
      aadhaarOtp
    }).pipe(
      tap(res => {
        if (res.success) {
          const current = this.currentUserSignal();
          if (current) {
            const updated = { ...current, aadhaarVerified: true };
            this.setSession(updated);
          }
        }
      })
    );
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  private setSession(authData: AuthResponse) {
    localStorage.setItem('vms_jwt_token', authData.token);
    localStorage.setItem('vms_user_info', JSON.stringify(authData));
    this.currentUserSignal.set(authData);
  }

  logout() {
    localStorage.removeItem('vms_jwt_token');
    localStorage.removeItem('vms_user_info');
    this.currentUserSignal.set(null);
  }
}
