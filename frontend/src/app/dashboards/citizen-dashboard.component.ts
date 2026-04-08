import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrievanceService } from '../services/grievance.service';
import { ThemeService } from '../services/theme.service';
import { SidebarComponent } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';

/* FIX: add badge in type */
type NavItem = {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
  badge?: number;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar
        role="CITIZEN"
        homeRoute="/citizen/dashboard"
        [sections]="navSections">
      </app-sidebar>

      <div class="main-content">
        <!-- FIX: null-safe subtitle -->
        <app-topbar 
          title="Overview" 
          [subtitle]="(today | date:'EEEE, d MMMM yyyy') || ''" 
          role="CITIZEN">
        </app-topbar>

        <div class="content">
          <h2 class="greeting">Welcome, <span class="gold">{{ auth.getUsername() }}</span></h2>
          <p class="g-sub">Here's an overview of your civic contributions</p>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-num" style="color:var(--text, #e2e8f0)">{{ total }}</div>
              <div class="stat-lbl">Total Submitted</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-num" style="color:var(--gold, #F0A500)">{{ pending }}</div>
              <div class="stat-lbl">Open Issues</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚙️</div>
              <div class="stat-num" style="color:var(--blue, #3b82f6)">{{ inProgress }}</div>
              <div class="stat-lbl">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-num" style="color:var(--green, #10b981)">{{ resolved }}</div>
              <div class="stat-lbl">Resolved</div>
            </div>
          </div>

          <h3 class="section-title">Quick Actions</h3>
          <div class="actions-grid">
            <div class="action-card" (click)="router.navigate(['/citizen/submit'])">
              <div class="ac-icon">📝</div>
              <div class="ac-title">File New Complaint</div>
              <div class="ac-sub">Report a civic issue in your area</div>
            </div>
            <div class="action-card" (click)="router.navigate(['/citizen/my-complaints'])">
              <div class="ac-icon">🔍</div>
              <div class="ac-title">Track My Issues</div>
              <div class="ac-sub">{{ total }} total submissions</div>
            </div>
          </div>

          <div class="section-header" *ngIf="recent.length > 0">
            <h3 class="section-title" style="margin:0">Recent Grievances</h3>
            <button class="view-all" (click)="router.navigate(['/citizen/my-complaints'])">
              View All →
            </button>
          </div>

          <div class="recent-card" *ngIf="recent.length > 0">
            <div class="recent-row" *ngFor="let g of recent">
              <div>
                <div class="ri-title">{{ g.title }}</div>
                <div class="ri-date">{{ g.submissionDate | date:'MMM d, yyyy' }}</div>
              </div>
              <span class="badge-pill" [ngClass]="'badge-' + g.status?.toLowerCase()">
                {{ g.status }}
              </span>
            </div>
          </div>

          <div class="loading-txt" *ngIf="loading">Loading your grievances...</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content { padding:24px; }
    .greeting { font-size:26px; font-weight:700; color:var(--text, #e2e8f0); }
    .gold { color:var(--gold, #F0A500); }
    .g-sub { color:var(--text3, #64748b); font-size:13px; margin:4px 0 24px; }

    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
    .stat-card { background:var(--bg-card, #162032); border:1px solid var(--border, rgba(255,255,255,0.08));
      border-radius:14px; padding:20px; text-align:center; }
    .stat-icon { font-size:22px; margin-bottom:8px; }
    .stat-num { font-size:34px; font-weight:800; }
    .stat-lbl { font-size:12px; color:var(--text3, #64748b); margin-top:4px; }

    .section-title { color:var(--text, #e2e8f0); font-size:16px; font-weight:600; margin:0 0 14px; }
    .section-header { display:flex; justify-content:space-between; align-items:center;
      margin-bottom:14px; }
    .view-all { background:transparent; border:1px solid var(--border, rgba(255,255,255,0.08));
      color:var(--teal, #0EA5A0); padding:5px 14px; border-radius:8px;
      cursor:pointer; font-size:12px; }

    .actions-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .action-card { background:var(--bg-card, #162032); border:1px solid var(--border, rgba(255,255,255,0.08));
      border-radius:14px; padding:22px; cursor:pointer; transition:all 0.2s; }
    .action-card:hover { border-color:var(--teal, #0EA5A0); transform:translateY(-2px); }
    .ac-icon { font-size:26px; margin-bottom:10px; }
    .ac-title { color:var(--text, #e2e8f0); font-weight:600; font-size:14px; margin-bottom:4px; }
    .ac-sub { color:var(--text3, #64748b); font-size:12px; }

    .recent-card { background:var(--bg-card, #162032); border:1px solid var(--border, rgba(255,255,255,0.08));
      border-radius:14px; overflow:hidden; }
    .recent-row { display:flex; align-items:center; justify-content:space-between;
      padding:13px 20px; border-bottom:1px solid var(--border2, rgba(255,255,255,0.04)); }
    .recent-row:last-child { border-bottom:none; }
    .ri-title { color:var(--text, #e2e8f0); font-size:13px; font-weight:500; }
    .ri-date { color:var(--text3, #64748b); font-size:11px; margin-top:2px; }

    .loading-txt { text-align:center; padding:32px; color:var(--text3, #64748b); font-size:14px; }
  `]
})
export class CitizenDashboardComponent implements OnInit {

  total = 0; pending = 0; inProgress = 0; resolved = 0;
  recent: any[] = [];
  loading = true;
  today = new Date();

  /* FIX: typed navSections */
  navSections: NavSection[] = [
    {
      label: 'MAIN', items: [
        { icon: '🏠', label: 'Overview', route: '/citizen/dashboard', active: true },
        { icon: '➕', label: 'Submit Grievance', route: '/citizen/submit' },
        { icon: '📋', label: 'My Grievances', route: '/citizen/my-complaints' },
        { icon: '⭐', label: 'Feedback & Ratings', route: '/citizen/feedback' },
      ]
    }
  ];

  constructor(public auth: AuthService, public router: Router,
    public theme: ThemeService, private gs: GrievanceService) { }

  ngOnInit() {
    this.gs.getMyGrievances().subscribe({
      next: data => {
        this.loading = false;
        this.total = data.length;
        this.pending = data.filter((g: any) => g.status === 'PENDING').length;
        this.inProgress = data.filter((g: any) => g.status === 'IN_PROGRESS').length;
        this.resolved = data.filter((g: any) =>
          g.status === 'RESOLVED' || g.status === 'CLOSED').length;

        this.recent = [...data].sort((a, b) =>
          new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
        ).slice(0, 5);

        /* FIX: now valid */
        if (this.navSections[0].items[2]) {
           this.navSections[0].items[2].badge = this.total;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  get navSectionsWithBadge() { return this.navSections; }
}
