import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, HostDto, VisitorPassDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private apiUrl = 'http://localhost:8080/api/visitor';

  constructor(private http: HttpClient) {}

  getHosts(): Observable<ApiResponse<HostDto[]>> {
    return this.http.get<ApiResponse<HostDto[]>>(`${this.apiUrl}/hosts`);
  }

  getPassByCode(passCode: string): Observable<ApiResponse<VisitorPassDto>> {
    return this.http.get<ApiResponse<VisitorPassDto>>(`${this.apiUrl}/pass/${passCode}`);
  }

  getMyPasses(): Observable<ApiResponse<VisitorPassDto[]>> {
    return this.http.get<ApiResponse<VisitorPassDto[]>>(`${this.apiUrl}/my-passes`);
  }
}
