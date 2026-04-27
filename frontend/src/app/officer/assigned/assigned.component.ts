import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfficerService } from '../../services/officer.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-assigned',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-dot">🏙️</div>
          <div class="brand-text">Civic<span>Pulse</span></div>
        </div>
        <div class="user-pill">
          <div class="user-dot" style="background:#a78bfa"></div>
          <div>
            <div class="user-role" style="color:#a78bfa">OFFICER</div>
            <div class="user-name">&#64;{{ auth.getUsername() }}</div>
          </div>
        </div>
        <div class="nav-section-label">WORK</div>
        <div class="nav-item" (click)="router.navigate(['/officer/dashboard'])"><span class="nav-icon">🏠</span> Overview</div>
        <div class="nav-item active"><span class="nav-icon">📋</span> Assigned to Me <span class="nav-badge" style="background:#a78bfa">{{ grievances.length }}</span></div>
        <div class="nav-item"><span class="nav-icon">🔧</span> In Progress <span class="nav-badge">{{ inProgress }}</span></div>
        <div class="nav-item"><span class="nav-icon">✅</span> Completed</div>
        <div class="nav-section-label">ANALYTICS</div>
        <div class="nav-item"><span class="nav-icon">📊</span> Analytics</div>
        <div class="nav-section-label">INFO</div>
        <div class="nav-item"><span class="nav-icon">👤</span> My Profile</div>
        <div class="nav-item"><span class="nav-icon">🔔</span> Notifications <span class="nav-badge" style="background:#f59e0b">3</span></div>
        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Assigned Grievances</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <div class="role-badge" style="border-color:#a78bfa; color:#a78bfa">OFFICER</div>
            <div class="avatar" style="background:#7c3aed">O</div>
          </div>
        </div>

        <div class="page-content">
          <div class="page-header" style="display:flex; align-items:center; justify-content:space-between;">
            <div>
              <h1>📋 Assigned to Me
                <span style="font-size:16px; background:#7c3aed; color:#fff; border-radius:20px; padding:2px 12px; margin-left:8px; vertical-align:middle;">
                  {{ grievances.length }}
                </span>
              </h1>
              <p>Manage and resolve your assigned civic complaints.</p>
            </div>
          </div>

          <div *ngIf="loading" class="empty-state">
            <div class="empty-icon">⏳</div>
            <h3>Loading assigned grievances...</h3>
          </div>

          <div *ngIf="loadError" class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3 style="color:#f87171">{{ loadError }}</h3>
          </div>

          <div *ngIf="!loading && !loadError && grievances.length === 0" class="card">
            <div class="empty-state">
              <div class="empty-icon">✅</div>
              <h3>No grievances assigned yet</h3>
              <p>You will see assigned complaints here once admin assigns them to you</p>
            </div>
          </div>

          <div *ngFor="let g of grievances" class="grievance-card"
               [class.overdue]="isOverdue(g)">
            <div class="gc-top">
              <div class="g-icon" style="width:44px; height:44px;">{{ getCatIcon(g.category) }}</div>
              <div style="flex:1; min-width:0;">
                <div class="g-title" style="font-size:15px;">{{ g.title }}</div>
                <div class="g-meta">📍 {{ g.location }} · 👤 {{ g.deadline ? 'Due: ' + (g.deadline | date:'dd MMM yyyy') : 'No deadline' }}</div>
              </div>
              <div class="g-badges" style="gap:8px; flex-shrink:0;">
                <span class="badge badge-red" *ngIf="isOverdue(g)">OVERDUE</span>
                <span class="badge" [ngClass]="getPriorityClass(g.priority)">P{{ g.priority }}</span>
                <span class="badge" [ngClass]="g.status === 'PENDING' ? 'badge-new' : 'badge-progress'">
                  {{ g.status === 'PENDING' ? 'NEW' : 'IN PROGRESS' }}
                </span>
              </div>
            </div>

            <div class="gc-desc" *ngIf="g.description">{{ g.description }}</div>

            <div class="gc-footer">
              <div class="deadline-info" *ngIf="g.deadline">
                <span style="color:#64748b; font-size:13px;">Deadline: </span>
                <span [style.color]="isOverdue(g) ? '#f87171' : '#e2e8f0'" style="font-size:13px; font-weight:600;">
                  {{ g.deadline | date:'dd MMM yyyy, hh:mm a' }}
                </span>
                <span style="color:#0d9488; font-size:12px; margin-left:8px;" *ngIf="!isOverdue(g)">
                  ({{ daysLeft(g) }} days left)
                </span>
              </div>
              <button (click)="router.navigate(['/officer/resolve', g.id])"
                style="padding:8px 20px; background:#7c3aed; border:none; border-radius:8px; color:#fff; font-size:13px; font-weight:600; cursor:pointer;">
                Update Status →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .grievance-card {
      background: #161d2e; border: 1px solid #1e293b; border-radius: 12px;
      padding: 18px 20px; margin-bottom: 14px;
      border-left: 4px solid #1e293b; transition: border-color 0.2s;
    }
    .grievance-card:hover { border-left-color: #7c3aed; }
    .grievance-card.overdue { border-left-color: #ef4444; background: #1a1010; }
    .gc-top { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
    .gc-desc { font-size: 13px; color: #64748b; padding: 0 0 10px 58px; line-height: 1.5; }
    .gc-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid #1e293b; }
    .deadline-info { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .badge-red { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
  `]
})
export class AssignedComponent implements OnInit {
  grievances: any[] = [];
  inProgress = 0;
  loading = true;
  loadError = '';
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(private os: OfficerService, public auth: AuthService, public router: Router) { }

  ngOnInit() {
    this.os.getAssigned().subscribe({
      next: d => {
        this.loading = false;
        this.grievances = d;
        this.inProgress = d.filter((g: any) => g.status === 'IN_PROGRESS').length;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Failed to load assigned grievances. Please refresh.';
      }
    });
  }

  isOverdue(g: any): boolean {
    return g.deadline && new Date(g.deadline) < new Date() && g.status !== 'RESOLVED';
  }

  daysLeft(g: any): number {
    return Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
  }

  getCatIcon(cat: string): string {
    const m: any = { WATER: '💧', ROAD: '🛣️', SANITATION: '🗑️', ELECTRICITY: '⚡', STREET_LIGHT: '💡', OTHER: '📋' };
    return m[cat] || '📋';
  }

  getPriorityClass(p: number): string {
    if (p >= 3) return 'badge-high';
    if (p === 2) return 'badge-medium';
    return 'badge-low';
  }
}
