import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminComponent } from './components/admin/admin.component';
import { HostComponent } from './components/host/host.component';
import { LoginComponent } from './components/login/login.component';
import { BadgeViewComponent } from './components/badge-view/badge-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Enterprise Visitor Management System' },
  { path: 'register', component: RegisterComponent, title: 'Visitor Registration & DigiLocker e-KYC' },
  { path: 'admin', component: AdminComponent, title: 'Reception Desk & QR Scanner' },
  { path: 'host', component: HostComponent, title: 'Host Employee Approvals' },
  { path: 'login', component: LoginComponent, title: 'System Login' },
  { path: 'badge/:passCode', component: BadgeViewComponent, title: 'Digital Visitor Badge' },
  { path: '**', redirectTo: '' }
];
