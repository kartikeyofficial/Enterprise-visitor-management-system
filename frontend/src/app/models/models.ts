export type Role = 'ROLE_ADMIN' | 'ROLE_HOST' | 'ROLE_VISITOR';

export type PassStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'EXPIRED' | 'CANCELLED';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  company?: string;
  role: Role;
  emailVerified: boolean;
  aadhaarVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  aadhaarVerified: boolean;
}

export interface HostDto {
  id: number;
  userId: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeCode: string;
  cabinNumber?: string;
}

export interface VisitorPassDto {
  id: number;
  passCode: string;
  visitorId: number;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  company: string;
  aadhaarVerified: boolean;
  hostId: number;
  hostName: string;
  hostEmail: string;
  hostDepartment: string;
  hostDesignation: string;
  hostCabin: string;
  purpose: string;
  visitDate: string;
  status: PassStatus;
  remarks?: string;
  qrCodeBase64?: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: number;
  pass: VisitorPassDto;
  checkInTime: string;
  checkOutTime?: string;
  scannedByAdmin: string;
  terminalLocation: string;
  scanNotes?: string;
  createdAt: string;
}

export interface ScanResultResponse {
  success: boolean;
  message: string;
  actionType: 'CHECKED_IN' | 'CHECKED_OUT' | 'DENIED' | 'ALREADY_COMPLETED';
  passId?: number;
  passCode: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  company: string;
  hostName: string;
  hostDepartment: string;
  purpose: string;
  scanDateTime: string;
  scannedByAdmin: string;
  terminalLocation: string;
}

export interface DashboardStats {
  totalVisitorsToday: number;
  activeInsideBuilding: number;
  pendingApprovals: number;
  totalPassesGenerated: number;
  totalCheckInsAllTime: number;
}

export interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface DigiLockerInitResponse {
  txnId: string;
  maskedAadhaar: string;
  status: string;
  message: string;
  demoOtp: string;
}
