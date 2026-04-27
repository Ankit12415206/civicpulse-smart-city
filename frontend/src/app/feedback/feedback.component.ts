import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../services/feedback.service';
import { GrievanceService } from '../services/grievance.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { SidebarComponent, NavItem } from '../shared/sidebar.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="CITIZEN" homeRoute="/citizen/dashboard" [sections]="nav"></app-sidebar>

      <div class="main-content">
        <!-- Topbar -->
        <div class="topbar">
          <div>
            <h2 class="pt">Feedback & Ratings</h2>
            <p class="ps">Rate the resolution of your grievances</p>
          </div>
          <div class="tr">
            <button class="theme-icon" (click)="theme.toggle()" title="Toggle theme">
              {{ theme.isDark() ? '☀️' : '🌙' }}
            </button>
            <span class="role-tag">CITIZEN</span>
          </div>
        </div>

        <div class="content">

          <!-- Stats row -->
          <div class="stats-row">
            <div class="stat-card">
              <div class="sc-top">
                <span class="sc-lbl">Total</span>
              </div>
              <div class="sc-num">{{ resolvedGrievances.length }}</div>
              <div class="sc-sub">Resolved Grievances</div>
            </div>
            <div class="stat-card">
              <div class="sc-top">
                <span class="sc-badge gold">{{ resolvedGrievances.length }}</span>
              </div>
              <div class="sc-num">{{ resolvedGrievances.length }}</div>
              <div class="sc-sub">Awaiting Feedback</div>
            </div>
            <div class="stat-card">
              <div class="sc-top">
                <span class="sc-lbl">⭐ Avg</span>
              </div>
              <div class="sc-num">{{ avgRating || '—' }}</div>
              <div class="sc-sub">Avg Rating Given</div>
            </div>
            <div class="stat-card">
              <div class="sc-top">
                <span class="sc-badge green">Done</span>
              </div>
              <div class="sc-num">{{ submittedCount }}</div>
              <div class="sc-sub">Feedback Submitted</div>
            </div>
          </div>

          <!-- If specific grievance ID in URL — show rating form -->
          <div *ngIf="grievanceId > 0 && grievance" class="rate-card">
            <h3>Rate Grievance #{{ grievanceId }}</h3>
            <div class="g-info">
              <div class="gi-row">
                <span class="gi-lbl">Title</span>
                <span class="gi-val">{{ grievance.title }}</span>
              </div>
              <div class="gi-row">
                <span class="gi-lbl">Category</span>
                <span class="gi-val">{{ grievance.category }}</span>
              </div>
              <div class="gi-row" *ngIf="grievance.resolutionNote">
                <span class="gi-lbl">Resolution</span>
                <span class="gi-val teal">{{ grievance.resolutionNote }}</span>
              </div>
            </div>

            <p class="rate-prompt">How satisfied are you with the resolution?</p>
            <div class="stars">
              <span *ngFor="let s of [1,2,3,4,5]"
                (click)="rating = s"
                [class.filled]="s <= rating">⭐</span>
            </div>
            <p class="rating-label">{{ getRatingLabel() }}</p>

            <div class="field">
              <label>Your Comment (optional)</label>
              <textarea [(ngModel)]="comment" rows="3"
                placeholder="Share your experience..."></textarea>
            </div>

            <p class="success-msg" *ngIf="success">{{ success }}</p>
            <p class="error-msg" *ngIf="error">{{ error }}</p>

            <div class="action-btns">
              <button class="reopen-btn" (click)="reopen()">
                😞 Not Satisfied — Reopen
              </button>
              <button class="submit-btn" (click)="onSubmit()"
                [disabled]="rating === 0 || saving">
                {{ saving ? 'Submitting...' : '⭐ Submit Rating' }}
              </button>
            </div>
          </div>

          <!-- No resolved grievances -->
          <div *ngIf="!loading && resolvedGrievances.length === 0 && grievanceId === 0" class="empty">
            <div class="empty-icon">⭐</div>
            <h4>No resolved grievances to rate</h4>
            <p>Come back after your grievance is resolved</p>
          </div>

          <!-- List of resolved grievances to rate -->
          <div *ngIf="resolvedGrievances.length > 0 && grievanceId === 0">
            <h3 class="list-title">Resolved Grievances — Awaiting Your Feedback</h3>
            <div class="resolved-list">
              <div class="resolved-item" *ngFor="let g of resolvedGrievances">
                <div class="ri-info">
                  <h4 class="ri-title">{{ g.title }}</h4>
                  <p class="ri-desc">{{ g.description }}</p>
                  <span class="ri-cat">{{ g.category }}</span>
                  <p class="ri-note" *ngIf="g.resolutionNote">
                    📝 {{ g.resolutionNote }}
                  </p>
                </div>
                <button class="rate-btn"
                  (click)="router.navigate(['/citizen/feedback', g.id])">
                  ⭐ Rate & Review
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="loading">Loading...</div>
          <div *ngIf="loadError" class="empty" style="color:var(--red)">{{ loadError }}</div>
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
    .theme-icon:hover { background:var(--bg-hover); }
    .role-tag { background:rgba(14,165,160,0.15); color:var(--teal);
      font-size:11px; font-weight:700; padding:3px 12px; border-radius:20px;
      border:1px solid rgba(14,165,160,0.3); }

    .content { padding:22px; }

    .stats-row { display:grid; grid-template-columns:repeat(4,1fr);
      gap:14px; margin-bottom:24px; }
    .stat-card { background:var(--bg-card); border:1px solid var(--border);
      border-radius:14px; padding:18px; }
    .sc-top { display:flex; justify-content:flex-end; margin-bottom:8px; }
    .sc-lbl { font-size:11px; color:var(--text3); }
    .sc-badge { font-size:11px; font-weight:700; padding:2px 8px;
      border-radius:20px; }
    .sc-badge.gold { background:rgba(240,165,0,0.15); color:var(--gold); }
    .sc-badge.green { background:rgba(16,185,129,0.15); color:var(--green); }
    .sc-num { font-size:32px; font-weight:800; color:var(--text); margin-bottom:4px; }
    .sc-sub { font-size:12px; color:var(--text3); }

    .rate-card { background:var(--bg-card); border:1px solid var(--border);
      border-radius:14px; padding:28px; max-width:600px; margin-bottom:24px; }
    .rate-card h3 { color:var(--text); font-size:18px; font-weight:700; margin-bottom:16px; }

    .g-info { background:var(--bg-card2); border-radius:10px;
      padding:14px; margin-bottom:20px; }
    .gi-row { display:flex; gap:12px; padding:5px 0;
      border-bottom:1px solid var(--border2); }
    .gi-row:last-child { border-bottom:none; }
    .gi-lbl { font-size:11px; color:var(--text3); width:80px; flex-shrink:0;
      text-transform:uppercase; font-weight:600; padding-top:1px; }
    .gi-val { font-size:13px; color:var(--text); }
    .gi-val.teal { color:var(--teal); }

    .rate-prompt { color:var(--text2); font-size:14px; margin-bottom:12px; }
    .stars { display:flex; gap:10px; margin-bottom:8px; }
    .stars span { font-size:36px; cursor:pointer; opacity:0.3;
      transition:opacity 0.15s, transform 0.1s; }
    .stars span.filled { opacity:1; transform:scale(1.1); }
    .stars span:hover { opacity:0.8; }
    .rating-label { color:var(--teal); font-size:13px; font-weight:600;
      min-height:20px; margin-bottom:16px; }

    .field label { display:block; font-size:12px; color:var(--text2);
      margin-bottom:6px; font-weight:500; }
    .field textarea { width:100%; padding:10px 14px;
      background:var(--bg-card2); border:1px solid var(--border);
      border-radius:10px; font-size:14px; color:var(--text);
      outline:none; font-family:inherit; resize:vertical; }
    .field textarea:focus { border-color:var(--teal); }

    .success-msg { color:var(--green); font-size:13px; margin:10px 0; }
    .error-msg { color:var(--red); font-size:13px; margin:10px 0; }

    .action-btns { display:flex; gap:12px; margin-top:16px; }
    .reopen-btn { flex:1; padding:11px;
      background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2);
      color:var(--red); border-radius:10px; cursor:pointer;
      font-size:13px; font-weight:600; }
    .reopen-btn:hover { background:rgba(239,68,68,0.2); }
    .submit-btn { flex:1; padding:11px;
      background:linear-gradient(135deg,var(--teal),#0f7a76);
      color:#fff; border:none; border-radius:10px; cursor:pointer;
      font-size:13px; font-weight:700; }
    .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

    .empty { text-align:center; padding:60px 20px; }
    .empty-icon { font-size:52px; margin-bottom:16px; }
    .empty h4 { color:var(--text); font-size:18px; margin-bottom:8px; }
    .empty p { color:var(--text3); font-size:13px; }

    .list-title { color:var(--text); font-size:16px; font-weight:600; margin-bottom:14px; }
    .resolved-list { display:flex; flex-direction:column; gap:12px; }
    .resolved-item { background:var(--bg-card); border:1px solid var(--border);
      border-radius:12px; padding:18px; display:flex;
      align-items:flex-start; justify-content:space-between; gap:16px; }
    .ri-info { flex:1; }
    .ri-title { color:var(--text); font-size:14px; font-weight:700; margin-bottom:4px; }
    .ri-desc { color:var(--text3); font-size:12px; margin-bottom:6px; }
    .ri-cat { font-size:10px; font-weight:700; color:var(--teal);
      background:rgba(14,165,160,0.12); padding:2px 8px; border-radius:20px; }
    .ri-note { color:var(--teal); font-size:12px; margin-top:6px; }
    .rate-btn { padding:8px 16px; background:var(--gold); color:#000;
      border:none; border-radius:8px; cursor:pointer;
      font-size:12px; font-weight:700; white-space:nowrap; flex-shrink:0; }
    .rate-btn:hover { opacity:0.85; }

    .loading { text-align:center; padding:40px; color:var(--text3); }
  `]
})
export class FeedbackComponent implements OnInit {
  grievanceId = 0;
  grievance: any = null;
  rating = 0;
  comment = '';
  success = '';
  error = '';
  saving = false;
  loading = true;
  resolvedGrievances: any[] = [];
  submittedCount = 0;
  avgRating = 0;

  loadError = '';

  nav: { label: string; items: NavItem[] }[] = [{
    label: 'MAIN', items: [
      { icon: '🏠', label: 'Overview', route: '/citizen/dashboard' },
      { icon: '➕', label: 'Submit Grievance', route: '/citizen/submit' },
      { icon: '📋', label: 'My Grievances', route: '/citizen/my-complaints' },
      { icon: '⭐', label: 'Feedback & Ratings', route: '/citizen/feedback', active: true },
    ]
  }];

  constructor(
    private route: ActivatedRoute,
    private fs: FeedbackService,
    private gs: GrievanceService,
    public router: Router,
    public theme: ThemeService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.grievanceId = Number(this.route.snapshot.paramMap.get('id')) || 0;

    // Load all grievances to find resolved ones
    this.gs.getMyGrievances().subscribe({
      next: (data: any[]) => {
        this.loading = false;
        this.resolvedGrievances = data.filter(
          (g: any) => g.status === 'RESOLVED'
        );
        // If specific grievance ID, load it
        if (this.grievanceId > 0) {
          this.grievance = data.find((g: any) => g.id === this.grievanceId) || null;
          if (!this.grievance) {
            this.gs.getById(this.grievanceId).subscribe({
              next: (g: any) => this.grievance = g,
              error: () => { }
            });
          }
        }
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Failed to load grievances. Please try again.';
      }
    });
  }

  getRatingLabel(): string {
    const labels = ['', 'Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
    return labels[this.rating] || '';
  }

  onSubmit() {
    if (this.rating === 0) return;
    this.saving = true; this.error = ''; this.success = '';
    this.fs.submitFeedback(this.grievanceId, this.rating, this.comment).subscribe({
      next: () => {
        this.saving = false;
        this.success = '✅ Thank you for your feedback!';
        this.submittedCount++;
        setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1800);
      },
      error: () => {
        this.saving = false;
        this.error = '❌ Failed to submit. Please try again.';
      }
    });
  }

  reopen() {
    this.fs.reopen(this.grievanceId).subscribe({
      next: () => {
        this.success = '🔄 Grievance reopened successfully.';
        setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1500);
      },
      error: () => { this.error = 'Failed to reopen. Try again.'; }
    });
  }
}