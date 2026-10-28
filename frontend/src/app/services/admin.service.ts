import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AuditLog, CheckInRecord, DashboardStats, ScanResultResponse, VisitorPassDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminApiUrl = 'http://localhost:8080/api/admin';
  private hostApiUrl = 'http://localhost:8080/api/host';

  constructor(private http: HttpClient) {}

  scanQr(qrPayload: string, terminalLocation = 'Main Reception Gate', notes = ''): Observable<ApiResponse<ScanResultResponse>> {
    return this.http.post<ApiResponse<ScanResultResponse>>(`${this.adminApiUrl}/scan`, {
      qrPayload,
      terminalLocation,
      notes
    });
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.adminApiUrl}/stats`);
  }

  getAllPasses(): Observable<ApiResponse<VisitorPassDto[]>> {
    return this.http.get<ApiResponse<VisitorPassDto[]>>(`${this.adminApiUrl}/passes`);
  }

  getCheckInHistory(): Observable<ApiResponse<CheckInRecord[]>> {
    return this.http.get<ApiResponse<CheckInRecord[]>>(`${this.adminApiUrl}/check-in-history`);
  }

  getAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.adminApiUrl}/audit-logs`);
  }

  updatePassStatus(passId: number, status: string, remarks = ''): Observable<ApiResponse<VisitorPassDto>> {
    return this.http.post<ApiResponse<VisitorPassDto>>(`${this.adminApiUrl}/pass-decision`, {
      passId,
      status,
      remarks
    });
  }

  getPendingHostApprovals(): Observable<ApiResponse<VisitorPassDto[]>> {
    return this.http.get<ApiResponse<VisitorPassDto[]>>(`${this.hostApiUrl}/pending-approvals`);
  }

  makeHostDecision(passId: number, status: string, remarks = ''): Observable<ApiResponse<VisitorPassDto>> {
    return this.http.post<ApiResponse<VisitorPassDto>>(`${this.hostApiUrl}/decision`, {
      passId,
      status,
      remarks
    });
  }
}
