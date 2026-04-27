import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OfficerService } from '../services/officer.service';
import { ThemeService } from '../services/theme.service';
import { SidebarComponent, NavItem } from '../shared/sidebar.component';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="OFFICER" homeRoute="/officer/dashboard" [sections]="nav"></app-sidebar>

      <div class="main-content">
        <div class="topbar">
          <div>
            <h2 class="pt">Officer Dashboard</h2>
            <p class="ps">Pulse Resolution Center</p>
          </div>
          <div class="tr">
            <button class="theme-icon" (click)="theme.toggle()">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <span class="role-tag">OFFICER</span>
            <button class="logout-btn" (click)="auth.logout()">LOGOUT</button>
          </div>
        </div>

        <div class="content">
          <!-- Stats -->
          <div class="stats-row">
            <div class="stat">
              <div class="sn" style="color:var(--text)">{{ total }}</div>
              <div class="sl">ASSIGNED</div>
            </div>
            <div class="stat">
              <div class="sn" style="color:var(--gold)">{{ pending }}</div>
              <div class="sl">PENDING</div>
            </div>
            <div class="stat">
              <div class="sn" style="color:var(--blue)">{{ inProgress }}</div>
              <div class="sl">WORKING</div>
            </div>
            <div class="stat">
              <div class="sn" style="color:var(--green)">{{ resolved }}</div>
              <div class="sl">RESOLVED</div>
            </div>
          </div>

          <h3 class="section-title">
            <span class="hl">Pulse</span> Resolution Center
          </h3>
          <p class="section-sub">Manage your assigned grievances and provide resolutions</p>

          <!-- Empty -->
          <div *ngIf="!loading && !loadError && grievances.length === 0" class="empty">
            <div style="font-size:48px;margin-bottom:12px">✅</div>
            <h4>No grievances assigned yet</h4>
            <p>You will see assigned complaints here once admin assigns them to you</p>
          </div>

          <div *ngIf="loading" class="loading">Loading...</div>
          <div *ngIf="loadError" class="empty" style="color:var(--red)">{{ loadError }}</div>

          <!-- Cards -->
          <div class="cards-grid" *ngIf="!loading && grievances.length > 0">
            <div class="g-card" *ngFor="let g of grievances"
                 [class.overdue]="isOverdue(g)">
              <div class="card-top">
                <div class="badges">
                  <span class="badge-pill" [ngClass]="getPClass(g.priority)">
                    {{ getPLabel(g.priority) }}
                  </span>
                  <span class="badge-pill" [ngClass]="'badge-' + g.status?.toLowerCase()">
                    {{ g.status }}
                  </span>
                </div>
              </div>
              <h4 class="g-title">{{ g.title }}</h4>
              <p class="g-desc">{{ g.description }}</p>
              <p class="g-loc" *ngIf="g.location">📍 {{ g.location }}</p>
              <p class="g-deadline" *ngIf="g.deadline">
                ⏰ Deadline: {{ g.deadline | date:'MMM d, yyyy' }}
                <span class="overdue-tag" *ngIf="isOverdue(g)"> OVERDUE</span>
              </p>
              <div class="card-btns">
                <button class="resolve-btn"
                  *ngIf="g.status !== 'RESOLVED' && g.status !== 'CLOSED'"
                  (click)="router.navigate(['/officer/resolve', g.id])">
                  Resolve Now
                </button>
                <button class="view-btn"
                  (click)="router.navigate(['/officer/resolve', g.id])">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .topbar { background:var(--bg-card); border-bottom:1px solid var(--border);
      padding:13px 24px; display:flex; justify-content:space-between; align-items:center; }
    .pt { color:var(--text); font-size:18px; font-weight:700; }
    .ps { color:var(--text3); font-size:12px; }
    .tr { display:flex; align-items:center; gap:10px; }
    .theme-icon { background:transparent; border:1px solid var(--border);
      border-radius:8px; padding:6px 9px; cursor:pointer; font-size:15px; }
    .role-tag { background:rgba(14,165,160,0.15); color:var(--teal);
      font-size:11px; font-weight:700; padding:3px 12px; border-radius:20px; }
    .logout-btn { padding:7px 16px; background:var(--red); color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }

    .content { padding:22px; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
    .stat { background:var(--bg-card); border:1px solid var(--border);
      border-radius:12px; padding:20px; text-align:center; }
    .sn { font-size:38px; font-weight:800; }
    .sl { font-size:11px; color:var(--text3); font-weight:700;
      letter-spacing:1px; margin-top:4px; }

    .section-title { color:var(--text); font-size:20px; font-weight:700;
      margin-bottom:4px; }
    .hl { color:var(--gold); }
    .section-sub { color:var(--text3); font-size:13px; margin-bottom:18px; }

    .loading, .empty { text-align:center; padding:48px; color:var(--text3); }
    .empty h4 { color:var(--text); font-size:18px; margin-bottom:8px; }

    .cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    @media(max-width:1100px) { .cards-grid { grid-template-columns:1fr 1fr; } }

    .g-card { background:var(--bg-card); border:1px solid var(--border);
      border-radius:14px; padding:18px; border-left:4px solid transparent; }
    .g-card.overdue { border-left-color:var(--red); background:rgba(239,68,68,0.04); }
    .card-top { margin-bottom:10px; }
    .badges { display:flex; gap:6px; flex-wrap:wrap; }
    .g-title { color:var(--text); font-size:15px; font-weight:700; margin-bottom:6px; }
    .g-desc { color:var(--text3); font-size:12px; line-height:1.5; margin-bottom:8px;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .g-loc { font-size:11px; color:var(--text3); margin-bottom:4px; }
    .g-deadline { font-size:11px; color:var(--text3); margin-bottom:12px; }
    .overdue-tag { color:var(--red); font-weight:700; }
    .card-btns { display:flex; gap:8px; }
    .resolve-btn { flex:1; padding:8px; background:var(--green); color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }
    .view-btn { flex:1; padding:8px; background:var(--teal); color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }
  `]
})
export class OfficerDashboardComponent implements OnInit {
  grievances: any[] = [];
  loading = true;
  loadError = '';
  total = 0; pending = 0; inProgress = 0; resolved = 0;

  nav: { label: string; items: NavItem[] }[] = [{
    label: 'WORK', items: [
      { icon: '🏠', label: 'My Tasks', route: '/officer/dashboard', active: true },
      { icon: '📋', label: 'Analytics', route: '/admin/analytics' },
    ]
  }];

  constructor(public auth: AuthService, public router: Router,
    public theme: ThemeService, private os: OfficerService) { }

  ngOnInit() {
    this.os.getAssigned().subscribe({
      next: data => {
        this.loading = false;
        this.grievances = data;
        this.total = data.length;
        this.pending = data.filter((g: any) => g.status === 'PENDING').length;
        this.inProgress = data.filter((g: any) => g.status === 'IN_PROGRESS').length;
        this.resolved = data.filter((g: any) =>
          g.status === 'RESOLVED' || g.status === 'CLOSED').length;
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Failed to load assigned grievances. Please refresh the page.';
      }
    });
  }

  isOverdue(g: any) {
    if (!g.deadline) return false;
    return new Date(g.deadline) < new Date() && g.status !== 'RESOLVED';
  }

  getPLabel(p: number) { return ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][p] || 'MEDIUM'; }
  getPClass(p: number) {
    return ['', 'badge-low', 'badge-medium', 'badge-high', 'badge-critical'][p] || 'badge-medium';
  }
}