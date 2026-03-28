import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash">
      <div class="topbar">
        <span class="brand">CivicPulse Admin</span>
        <span class="user">{{ auth.getUsername() }}</span>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <h2>Admin Dashboard</h2>
        <div class="cards">
          <div class="nav-card"
            (click)="router.navigate(['/admin/grievances'])">
            <div class="icon">☰</div>
            <div class="label">All Grievances</div>
          </div>
          <div class="nav-card"
            (click)="router.navigate(['/admin/analytics'])">
            <div class="icon">📊</div>
            <div class="label">Analytics</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dash { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#1e40af; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:16px; }
    .brand { font-size:18px; font-weight:600; flex:1; }
    .user  { font-size:13px; opacity:0.85; }
    button { padding:6px 16px; background:#fff; color:#1e40af;
      border:none; border-radius:6px; cursor:pointer; }
    .body  { padding:40px; }
    h2     { color:#1e40af; margin-bottom:24px; }
    .cards { display:flex; gap:20px; }
    .nav-card { background:#fff; border-radius:16px; padding:32px 24px;
      text-align:center; cursor:pointer; width:180px;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      transition:transform 0.15s; }
    .nav-card:hover { transform:translateY(-3px); }
    .icon { font-size:28px; margin-bottom:12px; }
    .label { font-size:14px; color:#334155; font-weight:500; }
  `]
})
export class AdminDashboardComponent {
  constructor(public auth: AuthService, public router: Router) {}
}