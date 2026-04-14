import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrievanceService } from '../services/grievance.service';
import { SidebarComponent, NavItem } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="ADMIN" homeRoute="/admin/dashboard" [sections]="navSections"></app-sidebar>

      <div class="main-content">
        <app-topbar title="Overview" [subtitle]="today" role="ADMIN"></app-topbar>

        <div class="welcome-banner" style="background: linear-gradient(135deg, #0d1b3e 0%, #0a1628 100%); border-color:#1e3a5f">
          <div class="welcome-text">
            <h2>Hello, <span style="color:#60a5fa">{{ auth.getUsername() }} admin</span> 🛡️</h2>
            <p>You have {{ pending }} pending grievances and {{ urgent }} urgent issues requiring immediate attention.</p>
          </div>
          <div class="welcome-icon">🛡️</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(99,102,241,0.1)">📊</div>
              <div class="stat-chip chip-blue">+{{ recent }} this week</div>
            </div>
            <div class="stat-num">{{ total }}</div>
            <div class="stat-label">Total Grievances</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">⏳</div>
              <div class="stat-chip chip-red">{{ urgent }} urgent</div>
            </div>
            <div class="stat-num">{{ pending }}</div>
            <div class="stat-label">Pending Review</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(59,130,246,0.1)">⚙️</div>
              <div class="stat-chip chip-blue">Active</div>
            </div>
            <div class="stat-num">{{ inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-icon-box" style="background:rgba(245,158,11,0.1)">👤</div>
              <div class="stat-chip chip-green">On duty</div>
            </div>
            <div class="stat-num">3</div>
            <div class="stat-label">Active Officers</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="card">
            <div class="card-header">
              <div class="card-title">Recent Grievances</div>
              <button class="view-all-btn" (click)="router.navigate(['/admin/grievances'])">View all →</button>
            </div>
            <div *ngIf="grievances.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No grievances yet</h3>
            </div>
            <div class="grievance-item" *ngFor="let g of grievances.slice(0,5)"
                 (click)="router.navigate(['/admin/assign', g.id])">
              <div class="g-icon">{{ getCatIcon(g.category) }}</div>
              <div class="g-info">
                <div class="g-title">{{ g.title }}</div>
                <div class="g-meta">&#64;user · {{ g.submissionDate | date:'dd MMM yyyy' }}</div>
              </div>
              <div class="g-badges">
                <span class="badge badge-high" *ngIf="g.priority >= 3">HIGH</span>
                <span class="badge badge-medium" *ngIf="g.priority == 2">MEDIUM</span>
                <span class="badge badge-low" *ngIf="g.priority <= 1">LOW</span>
                <span class="badge" [ngClass]="getStatusClass(g.status)">{{ formatStatus(g.status) }}</span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">Quick Actions</div></div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/grievances'])">
              <div class="qa-icon">📋</div>
              <div>
                <div class="qa-label">Review All Grievances</div>
                <div class="qa-sub">{{ pending }} pending review</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/grievances'])">
              <div class="qa-icon">👤</div>
              <div>
                <div class="qa-label">Assign Officers</div>
                <div class="qa-sub">{{ pending }} unassigned</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
            <div class="quick-action-item" (click)="router.navigate(['/admin/analytics'])">
              <div class="qa-icon">📊</div>
              <div>
                <div class="qa-label">Analytics & Reports</div>
                <div class="qa-sub">View trends & SLA metrics</div>
              </div>
              <span class="qa-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../styles/shared-layout.scss'],
  styles: [':host { display: block; }']
})
export class AdminDashboardComponent implements OnInit {
  grievances: any[] = [];
  total = 0; pending = 0; inProgress = 0; resolved = 0; recent = 0; urgent = 0;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'MANAGEMENT', items: [
        { icon: '🏠', label: 'Dashboard', route: '/admin/dashboard', active: true },
        { icon: '☰', label: 'All Grievances', route: '/admin/grievances' },
        { icon: '👤', label: 'Assign Officers', route: '/admin/grievances' },
        { icon: '👥', label: 'Manage Users', route: '/admin/users' }
      ]
    },
    {
      label: 'ANALYTICS', items: [
        { icon: '📊', label: 'Analytics & Reports', route: '/admin/analytics' }
      ]
    }
  ];

  constructor(public auth: AuthService, public router: Router, private gs: GrievanceService) {}

  ngOnInit() {
    this.gs.getAllGrievances().subscribe({
      next: d => {
        this.grievances = d;
        this.total = d.length;
        this.pending    = d.filter((g: any) => g.status === 'PENDING').length;
        this.inProgress = d.filter((g: any) => g.status === 'IN_PROGRESS').length;
        this.resolved   = d.filter((g: any) => g.status === 'RESOLVED').length;
        this.urgent = d.filter((g: any) => g.priority >= 3).length;
        this.recent = Math.min(d.length, 8);
        this.navSections[0].items[1].badge = this.total;
        this.navSections[0].items[2].badge = this.pending;
      },
      error: () => {}
    });
  }

  getCatIcon(cat: string): string {
    const m: any = { WATER: '💧', ROAD: '🛣️', SANITATION: '🗑️', ELECTRICITY: '⚡', STREET_LIGHT: '💡', OTHER: '📋' };
    return m[cat] || '📋';
  }

  getStatusClass(s: string): string {
    const m: any = { PENDING: 'badge-pending', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved' };
    return m[s] || 'badge-pending';
  }

  formatStatus(s: string): string {
    return s?.replace('_', ' ') || '';
  }
}
