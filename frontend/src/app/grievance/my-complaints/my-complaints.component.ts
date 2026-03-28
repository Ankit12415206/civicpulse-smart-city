import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-complaints',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse</span>
        <button (click)="router.navigate(['/citizen/dashboard'])">
          Dashboard
        </button>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <div class="header-row">
          <h2>My Complaints</h2>
          <button class="new-btn"
            (click)="router.navigate(['/citizen/submit'])">
            + New Complaint
          </button>
        </div>

        <div *ngIf="grievances.length === 0" class="empty">
          No complaints submitted yet.
          <br/>
          <button class="new-btn" style="margin-top:16px"
            (click)="router.navigate(['/citizen/submit'])">
            Submit your first complaint
          </button>
        </div>

        <div class="card" *ngFor="let g of grievances">
          <div class="card-top">
            <span class="title">{{ g.title }}</span>
            <span class="badge" [ngClass]="getBadgeClass(g.status)">
              {{ g.status | titlecase }}
            </span>
          </div>

          <div class="meta">
            <span class="tag cat">{{ g.category }}</span>
            <span class="tag loc">{{ g.location }}</span>
            <span class="tag date">
              {{ g.submissionDate | date:'dd MMM yyyy' }}
            </span>
          </div>

          <p class="desc">{{ g.description }}</p>

          <div class="note" *ngIf="g.resolutionNote">
            Resolution note: {{ g.resolutionNote }}
          </div>

          <!-- Status timeline -->
          <div class="timeline">
            <div class="step" [class.active]="true">
              <div class="dot"></div>
              <span>Submitted</span>
            </div>
            <div class="line"
              [class.active]="g.status !== 'PENDING'"></div>
            <div class="step"
              [class.active]="g.status === 'IN_PROGRESS'
                || g.status === 'RESOLVED'">
              <div class="dot"></div>
              <span>In Progress</span>
            </div>
            <div class="line"
              [class.active]="g.status === 'RESOLVED'"></div>
            <div class="step" [class.active]="g.status === 'RESOLVED'">
              <div class="dot"></div>
              <span>Resolved</span>
            </div>
          </div>

          <!-- Feedback button — only for RESOLVED -->
          <div class="actions" *ngIf="g.status === 'RESOLVED'">
            <button class="feedback-btn"
              (click)="router.navigate(['/citizen/feedback', g.id])">
              Rate this Resolution
            </button>
          </div>

          <!-- Reopen already handled via feedback page -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#0d9488; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:#fff; color:#0d9488;
      border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .body { padding:24px; max-width:820px; margin:0 auto; }
    .header-row { display:flex; align-items:center;
      justify-content:space-between; margin-bottom:20px; }
    h2 { color:#0d9488; margin:0; }
    .new-btn { background:#0d9488; color:#fff; padding:8px 18px;
      border:none; border-radius:8px; cursor:pointer; font-size:14px; }
    .card { background:#fff; border-radius:14px; padding:20px;
      margin-bottom:16px;
      box-shadow:0 2px 10px rgba(0,0,0,0.07); }
    .card-top { display:flex; align-items:center;
      justify-content:space-between; margin-bottom:10px; }
    .title { font-weight:600; font-size:15px; color:#1e293b; }
    .badge { font-size:11px; padding:4px 12px;
      border-radius:20px; font-weight:500; }
    .badge.pending    { background:#fef3c7; color:#92400e; }
    .badge.in_progress { background:#dbeafe; color:#1e40af; }
    .badge.resolved   { background:#dcfce7; color:#166534; }
    .badge.reopened   { background:#fee2e2; color:#991b1b; }
    .meta { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
    .tag { font-size:11px; padding:3px 10px; border-radius:20px; }
    .cat  { background:#e0f2fe; color:#0369a1; }
    .loc  { background:#f1f5f9; color:#475569; }
    .date { background:#f1f5f9; color:#475569; }
    .desc { font-size:13px; color:#64748b;
      margin:0 0 12px; line-height:1.5; }
    .note { font-size:12px; color:#0d9488; background:#f0fdf4;
      padding:8px 12px; border-radius:8px; margin-bottom:12px; }
    .timeline { display:flex; align-items:center;
      gap:0; margin:14px 0 10px; }
    .step { display:flex; flex-direction:column;
      align-items:center; gap:4px; }
    .step .dot { width:14px; height:14px; border-radius:50%;
      background:#e2e8f0; border:2px solid #cbd5e1; }
    .step.active .dot { background:#0d9488; border-color:#0d9488; }
    .step span { font-size:10px; color:#94a3b8; white-space:nowrap; }
    .step.active span { color:#0d9488; font-weight:500; }
    .line { flex:1; height:2px; background:#e2e8f0; min-width:40px; }
    .line.active { background:#0d9488; }
    .actions { margin-top:12px; }
    .feedback-btn { padding:8px 18px; background:#f59e0b; color:#fff;
      border:none; border-radius:8px; cursor:pointer;
      font-size:13px; font-weight:500; }
    .feedback-btn:hover { background:#d97706; }
    .empty { text-align:center; color:#94a3b8;
      margin-top:60px; font-size:15px; }
  `]
})
export class MyComplaintsComponent implements OnInit {
  grievances: any[] = [];

  constructor(private gs: GrievanceService,
              public auth: AuthService,
              public router: Router) {}

  ngOnInit() {
    this.gs.getMyGrievances().subscribe({
      next: data => this.grievances = data,
      error: () => {}
    });
  }

  getBadgeClass(status: string): string {
    return status?.toLowerCase().replace('_', '_') || '';
  }
}