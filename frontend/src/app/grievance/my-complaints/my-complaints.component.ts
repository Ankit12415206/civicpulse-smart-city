import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SidebarComponent, NavItem } from '../../shared/sidebar.component';
import { ChatbotComponent } from '../../shared/chatbot/chatbot.component';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatbotComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="CITIZEN" homeRoute="/citizen/dashboard"
        [sections]="nav"></app-sidebar>

      <div class="main-content">
        <div class="topbar">
          <div>
            <h2 class="pt">My Grievances</h2>
            <p class="ps">Stay updated on the status of your reported issues</p>
          </div>
          <div class="tr">
            <button class="theme-icon" (click)="theme.toggle()">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <button class="new-btn" (click)="router.navigate(['/citizen/submit'])">
              ➕ New Complaint
            </button>
          </div>
        </div>

        <div class="content">
          <div *ngIf="loading" class="loading">Loading your grievances...</div>
          <div *ngIf="loadError" class="empty" style="color:var(--red)">{{ loadError }}</div>

          <div *ngIf="!loading && grievances.length === 0" class="empty">
            <div style="font-size:48px;margin-bottom:16px">📭</div>
            <h4>No grievances yet</h4>
            <p>You haven't submitted any complaints.</p>
            <button class="submit-btn" (click)="router.navigate(['/citizen/submit'])">
              Submit your first complaint
            </button>
          </div>

          <div class="cards-grid" *ngIf="!loading && grievances.length > 0">
            <div class="g-card" *ngFor="let g of grievances">
              <div class="card-top">
                <span class="cat-tag">{{ g.category }}</span>
                <span class="badge-pill" [ngClass]="'badge-' + g.status?.toLowerCase()">
                  {{ g.status }}
                </span>
              </div>
              <h4 class="g-title">{{ g.title }}</h4>
              <p class="g-desc">{{ g.description }}</p>

              <div class="timeline">
                <div class="ts" [class.done]="true">
                  <div class="td done-d">1</div><span>Submitted</span>
                </div>
                <div class="tl" [class.active]="g.status !== 'PENDING'"></div>
                <div class="ts" [class.done]="g.status === 'IN_PROGRESS' || g.status === 'RESOLVED'">
                  <div class="td" [class.done-d]="g.status !== 'PENDING'">2</div>
                  <span>In Progress</span>
                </div>
                <div class="tl" [class.active]="g.status === 'RESOLVED' || g.status === 'CLOSED'"></div>
                <div class="ts" [class.done]="g.status === 'RESOLVED' || g.status === 'CLOSED'">
                  <div class="td" [class.done-d]="g.status === 'RESOLVED' || g.status === 'CLOSED'">3</div>
                  <span>Resolved</span>
                </div>
              </div>

              <div class="rn" *ngIf="g.resolutionNote">📝 {{ g.resolutionNote }}</div>

              <div class="card-footer">
                <span class="cf-date">📅 {{ g.submissionDate | date:'MMM d, yyyy' }}</span>
                <button class="rate-btn"
                  *ngIf="g.status === 'RESOLVED'"
                  (click)="router.navigate(['/citizen/feedback', g.id])">
                  ⭐ Rate & Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-chatbot></app-chatbot>
  `,
  styles: [`
    .topbar { background:var(--bg-card); border-bottom:1px solid var(--border);
      padding:13px 24px; display:flex; justify-content:space-between; align-items:center; }
    .pt { color:var(--text); font-size:18px; font-weight:700; }
    .ps { color:var(--text3); font-size:12px; }
    .tr { display:flex; align-items:center; gap:10px; }
    .theme-icon { background:transparent; border:1px solid var(--border);
      border-radius:8px; padding:6px 9px; cursor:pointer; font-size:15px; }
    .new-btn { padding:8px 16px;
      background:linear-gradient(135deg,var(--teal),#0f7a76);
      color:#fff; border:none; border-radius:10px;
      cursor:pointer; font-size:13px; font-weight:600; }

    .content { padding:22px; }
    .loading { text-align:center; padding:48px; color:var(--text3); }
    .empty { text-align:center; padding:60px; }
    .empty h4 { color:var(--text); font-size:20px; margin-bottom:8px; }
    .empty p { color:var(--text3); margin-bottom:16px; }
    .submit-btn { padding:10px 24px;
      background:linear-gradient(135deg,var(--teal),#0f7a76);
      color:#fff; border:none; border-radius:10px; cursor:pointer;
      font-weight:600; }

    .cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    @media(max-width:1100px) { .cards-grid { grid-template-columns:1fr 1fr; } }

    .g-card { background:var(--bg-card); border:1px solid var(--border);
      border-radius:14px; padding:18px; }
    .card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .cat-tag { font-size:10px; font-weight:700; color:var(--teal);
      background:rgba(14,165,160,0.12); padding:3px 10px; border-radius:20px; }
    .g-title { color:var(--text); font-size:15px; font-weight:700; margin-bottom:6px; }
    .g-desc { color:var(--text3); font-size:12px; line-height:1.5; margin-bottom:12px;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

    .timeline { display:flex; align-items:center; margin-bottom:12px; }
    .ts { display:flex; flex-direction:column; align-items:center; gap:3px; }
    .td { width:22px; height:22px; border-radius:50%;
      background:var(--bg-card2); border:2px solid var(--border);
      display:flex; align-items:center; justify-content:center;
      font-size:10px; color:var(--text3); font-weight:700; }
    .td.done-d { background:var(--teal); border-color:var(--teal); color:#fff; }
    .ts span { font-size:9px; color:var(--text3); white-space:nowrap; }
    .ts.done span { color:var(--teal); }
    .tl { flex:1; height:2px; background:var(--border); min-width:20px; }
    .tl.active { background:var(--teal); }

    .rn { background:rgba(14,165,160,0.08); border:1px solid rgba(14,165,160,0.2);
      border-radius:8px; padding:7px 12px; font-size:11px;
      color:var(--teal); margin-bottom:10px; }
    .card-footer { display:flex; justify-content:space-between;
      align-items:center; padding-top:10px;
      border-top:1px solid var(--border2); }
    .cf-date { font-size:11px; color:var(--text3); }
    .rate-btn { padding:5px 12px; background:var(--gold); color:#000;
      border:none; border-radius:6px; cursor:pointer; font-size:11px; font-weight:700; }
  `]
})
export class MyComplaintsComponent implements OnInit {
  grievances: any[] = [];
  loading = true;
  loadError = '';

  nav: { label: string; items: NavItem[] }[] = [{
    label: 'MAIN', items: [
      { icon: '🏠', label: 'Overview', route: '/citizen/dashboard' },
      { icon: '➕', label: 'Submit Grievance', route: '/citizen/submit' },
      { icon: '📋', label: 'My Grievances', route: '/citizen/my-complaints', active: true },
    ]
  }];

  constructor(private gs: GrievanceService, public auth: AuthService,
    public router: Router, public theme: ThemeService) { }

  ngOnInit() {
    this.gs.getMyGrievances().subscribe({
      next: data => {
        this.loading = false;
        this.grievances = data.sort((a: any, b: any) =>
          new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Failed to load your grievances. Please try again.';
      }
    });
  }
}