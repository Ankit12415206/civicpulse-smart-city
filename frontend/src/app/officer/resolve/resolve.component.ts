import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficerService } from '../../services/officer.service';
import { GrievanceService } from '../../services/grievance.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-resolve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <nav class="topbar">
        <div class="tl">
          <span class="brand">CivicPulse</span>
          <span class="sub">Officer Panel</span>
        </div>
        <div class="tr">
          <button class="theme-icon" (click)="theme.toggle()">{{ theme.isDark() ? '☀️' : '🌙' }}</button>
          <button class="back-btn" (click)="router.navigate(['/officer/dashboard'])">← Back</button>
        </div>
      </nav>

      <div class="main">
        <div class="loading" *ngIf="!grievance">Loading grievance details...</div>

        <div class="resolve-card" *ngIf="grievance">
          <h2>Update Grievance #{{ grievance.id }}</h2>

          <div class="info-grid">
            <div class="if"><span class="il">Title</span><span class="iv">{{ grievance.title }}</span></div>
            <div class="if"><span class="il">Category</span><span class="iv">{{ grievance.category }}</span></div>
            <div class="if"><span class="il">Location</span><span class="iv">{{ grievance.location }}</span></div>
            <div class="if"><span class="il">Status</span>
              <span class="badge-pill" [ngClass]="'badge-' + grievance.status?.toLowerCase()">
                {{ grievance.status }}
              </span>
            </div>
            <div class="if full"><span class="il">Description</span>
              <span class="iv">{{ grievance.description }}</span>
            </div>
            <div class="if" *ngIf="grievance.deadline">
              <span class="il">Deadline</span>
              <span class="iv">{{ grievance.deadline | date:'dd MMM yyyy' }}</span>
            </div>
          </div>

          <div class="form-section">
            <div class="field">
              <label>Update Status</label>
              <select [(ngModel)]="status">
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div class="field">
              <label>Resolution Note</label>
              <textarea [(ngModel)]="note" rows="4"
                placeholder="Describe what was done to resolve this issue..."></textarea>
            </div>
          </div>

          <p class="success-msg" *ngIf="success">{{ success }}</p>
          <p class="error-msg" *ngIf="error">{{ error }}</p>

          <div class="btns">
            <button class="cancel-btn" (click)="router.navigate(['/officer/dashboard'])">
              Cancel
            </button>
            <button class="save-btn" (click)="onResolve()" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Update' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { min-height:100vh; background:var(--bg-main); }
    .topbar { background:var(--bg-card); border-bottom:1px solid var(--border);
      padding:13px 24px; display:flex; justify-content:space-between; align-items:center; }
    .tl { display:flex; flex-direction:column; }
    .brand { color:var(--text); font-size:16px; font-weight:700; }
    .sub { color:var(--text3); font-size:12px; }
    .tr { display:flex; align-items:center; gap:10px; }
    .theme-icon { background:transparent; border:1px solid var(--border);
      border-radius:8px; padding:6px 9px; cursor:pointer; font-size:15px; }
    .back-btn { padding:7px 16px; background:var(--teal); color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; }

    .main { display:flex; justify-content:center; padding:32px 20px; }
    .loading { color:var(--text3); padding:48px; text-align:center; }

    .resolve-card { background:var(--bg-card); border:1px solid var(--border);
      border-radius:16px; padding:32px; width:100%; max-width:600px; }
    h2 { color:var(--text); font-size:20px; font-weight:700; margin-bottom:20px; }

    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px;
      background:var(--bg-card2); border-radius:12px; padding:16px; margin-bottom:20px; }
    .if { display:flex; flex-direction:column; gap:4px; }
    .if.full { grid-column:1/-1; }
    .il { font-size:10px; color:var(--text3); text-transform:uppercase; font-weight:600; }
    .iv { font-size:13px; color:var(--text); }

    .form-section { display:flex; flex-direction:column; gap:14px; margin-bottom:16px; }
    .field label { display:block; font-size:12px; color:var(--text2);
      margin-bottom:6px; font-weight:500; }
    .field select, .field textarea { width:100%; padding:11px 14px;
      background:var(--bg-card2); border:1px solid var(--border);
      border-radius:10px; font-size:14px; color:var(--text);
      outline:none; font-family:inherit; }
    .field select:focus, .field textarea:focus { border-color:var(--teal); }
    .field select option { background:var(--bg-card2); }

    .success-msg { color:var(--green); font-size:12px; margin-bottom:10px; }
    .error-msg { color:var(--red); font-size:12px; margin-bottom:10px; }

    .btns { display:flex; gap:10px; }
    .cancel-btn { flex:1; padding:12px; background:transparent;
      border:1px solid var(--border); border-radius:10px;
      color:var(--text2); cursor:pointer; font-size:14px; }
    .save-btn { flex:1; padding:12px;
      background:linear-gradient(135deg,var(--teal),#0f7a76);
      color:#fff; border:none; border-radius:10px;
      cursor:pointer; font-size:14px; font-weight:700; }
    .save-btn:disabled { opacity:0.5; cursor:not-allowed; }
  `]
})
export class ResolveComponent implements OnInit {
  grievance: any = null;
  status = 'IN_PROGRESS';
  note = '';
  success = '';
  error = '';
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private os: OfficerService,
    private gs: GrievanceService,
    public router: Router,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && !isNaN(id)) {
      this.gs.getById(id).subscribe({
        next: g => {
          this.grievance = g;
          this.status = g.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS';
        },
        error: () => { this.error = 'Failed to load grievance.'; }
      });
    }
  }

  onResolve() {
    if (!this.grievance) return;
    this.saving = true; this.error = ''; this.success = '';
    this.os.resolve(this.grievance.id, this.status, this.note).subscribe({
      next: () => {
        this.saving = false;
        this.success = '✅ Status updated successfully!';
        setTimeout(() => this.router.navigate(['/officer/dashboard']), 1500);
      },
      error: () => {
        this.saving = false;
        this.error = '❌ Failed to update. Try again.';
      }
    });
  }
}