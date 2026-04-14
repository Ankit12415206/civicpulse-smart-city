import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

export interface NavItem {
  icon: string; label: string; route?: string;
  active?: boolean; badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sb-brand" (click)="router.navigate([homeRoute])">
        <span class="sb-logo">🏛️</span>
        <span class="sb-name">Civic<span class="gold">Pulse</span></span>
      </div>

      <!-- User info -->
      <div class="sb-user">
        <div class="avatar">{{ initial }}</div>
        <div class="user-info">
          <div class="u-name">{{ auth.getUsername() }}</div>
          <div class="u-role">{{ role }}</div>
        </div>
      </div>

      <!-- Nav sections -->
      <nav class="sb-nav">
        <div *ngFor="let section of sections">
          <div class="nav-section">{{ section.label }}</div>
          <a *ngFor="let item of section.items"
            class="nav-item" [class.active]="item.active"
            (click)="navigate(item)">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="item.badge && item.badge > 0">{{ item.badge }}</span>
          </a>
        </div>
      </nav>

      <!-- Bottom -->
      <div class="sb-bottom">
        <button class="theme-btn" (click)="theme.toggle()"
          [title]="theme.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>
        <button class="signout-btn" (click)="auth.logout()">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; flex-shrink: 0; width: 240px; }
    .sidebar { background:var(--bg-sidebar); 
      height:100vh; display:flex; flex-direction:column;
      border-right:1px solid var(--border); }
    .sb-brand { display:flex; align-items:center; gap:10px;
      padding:16px 20px; border-bottom:1px solid var(--border);
      cursor:pointer; }
    .sb-logo { font-size:20px; }
    .sb-name { font-size:17px; font-weight:700; color:var(--text); }
    .gold { color:var(--gold); }
    .sb-user { display:flex; align-items:center; gap:10px;
      padding:14px 20px; border-bottom:1px solid var(--border); }
    .avatar { width:34px; height:34px; border-radius:50%;
      background:var(--teal); color:#fff; display:flex;
      align-items:center; justify-content:center;
      font-weight:700; font-size:14px; flex-shrink:0; }
    .u-name { color:var(--text); font-size:13px; font-weight:600; }
    .u-role { color:var(--teal); font-size:10px; font-weight:700;
      text-transform:uppercase; }
    .sb-nav { flex:1; padding:10px 0; overflow-y:auto; }
    .nav-section { padding:10px 20px 4px;
      font-size:10px; font-weight:700; color:var(--text3);
      letter-spacing:1px; text-transform:uppercase; }
    .nav-item { display:flex; align-items:center; gap:10px;
      padding:10px 20px; color:var(--text2); font-size:13px;
      cursor:pointer; transition:all 0.15s; user-select:none; }
    .nav-item:hover { background:var(--bg-hover); color:var(--text); }
    .nav-item.active { background:rgba(14,165,160,0.12);
      color:var(--teal); border-right:3px solid var(--teal); }
    .nav-icon { font-size:15px; width:18px; text-align:center; }
    .nav-label { flex:1; }
    .nav-badge { background:var(--gold); color:#000;
      font-size:10px; font-weight:700; padding:1px 6px;
      border-radius:20px; }
    .sb-bottom { padding:12px; border-top:1px solid var(--border);
      display:flex; gap:8px; align-items:center; }
    .theme-btn { width:40px; height:36px; flex-shrink:0;
      background:var(--bg-card2); border:1px solid var(--border);
      border-radius:8px; cursor:pointer; font-size:18px;
      display:flex; align-items:center; justify-content:center; }
    .theme-btn:hover { background:var(--bg-hover); }
    .signout-btn { flex:1; padding:8px;
      background:rgba(239,68,68,0.1);
      border:1px solid rgba(239,68,68,0.2);
      border-radius:8px; color:var(--red);
      cursor:pointer; font-size:12px; font-weight:600; }
    .signout-btn:hover { background:rgba(239,68,68,0.2); }
  `]
})
export class SidebarComponent {
  @Input() role = 'CITIZEN';
  @Input() homeRoute = '/citizen/dashboard';
  @Input() sections: { label: string; items: NavItem[] }[] = [];

  get initial() {
    return (this.auth.getUsername() || 'U').charAt(0).toUpperCase();
  }

  constructor(public auth: AuthService, public router: Router, public theme: ThemeService) { }

  navigate(item: NavItem) {
    if (item.route) this.router.navigate([item.route]);
  }
}
