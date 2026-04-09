import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficerService } from '../../services/officer.service';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-resolve',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <div class="nav-item" (click)="router.navigate(['/officer/assigned'])"><span class="nav-icon">📋</span> Assigned to Me</div>
        <div class="nav-item active"><span class="nav-icon">✅</span> Update Resolution</div>
        <div class="sidebar-footer">
          <button class="signout-btn" (click)="auth.logout()"><span>↪</span> Sign Out</button>
        </div>
      </aside>

      <main class="main-content">
        <div class="topnav">
          <div>
            <div class="page-title">Resolve Grievance</div>
            <div class="page-date">{{ today }}</div>
          </div>
          <div class="topnav-right">
            <button class="view-all-btn" (click)="router.navigate(['/officer/assigned'])">← Back to Assigned</button>
            <div class="role-badge" style="border-color:#a78bfa; color:#a78bfa">OFFICER</div>
            <div class="avatar" style="background:#7c3aed">O</div>
          </div>
        </div>

        <div class="page-content">
          <div class="page-header">
            <h1>🛠️ Update Grievance Status</h1>
            <p>Track progress and add detailed resolution notes.</p>
          </div>

          <div *ngIf="error" class="msg-error">{{ error }}</div>
          <div *ngIf="success" class="msg-success">{{ success }}</div>

          <div class="content-grid" style="padding:0; grid-template-columns:1fr 320px;">
            <div class="card" *ngIf="grievance">
              <div class="card-header">
                <div class="card-title">Complaint Details</div>
                <div class="g-badges" style="display:flex; gap:8px;">
                  <span class="badge" [ngClass]="priorityClass(grievance.priority)">{{ priorityLabel(grievance.priority) }}</span>
                  <span class="badge" [ngClass]="statusClass(grievance.status)">{{ grievance.status?.replace('_', ' ') }}</span>
                </div>
              </div>
              <div style="padding:20px;">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="lbl">Title</span>
                    <span class="val">{{ grievance.title }}</span>
                  </div>
                  <div class="info-item">
                    <span class="lbl">Category</span>
                    <span class="val">{{ grievance.category }}</span>
                  </div>
                  <div class="info-item">
                    <span class="lbl">Location</span>
                    <span class="val">{{ grievance.location }}</span>
                  </div>
                  <div class="info-item">
                    <span class="lbl">SLA Deadline</span>
                    <span class="val" [style.color]="isOverdue() ? '#f87171' : '#cbd5e1'">
                      {{ grievance.deadline ? (grievance.deadline | date:'dd MMM yyyy, hh:mm a') : 'Not set' }}
                    </span>
                  </div>
                  <div class="info-item full">
                    <span class="lbl">Description</span>
                    <span class="val">{{ grievance.description }}</span>
                  </div>
                </div>

                <div class="form-group" style="margin-top:18px;">
                  <label class="form-label">Update Status</label>
                  <select class="form-select" [(ngModel)]="status">
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Resolution Notes</label>
                  <textarea class="form-textarea" [(ngModel)]="note" rows="5"
                    placeholder="Add action taken, observations, and closure details"></textarea>
                </div>

                <button class="submit-btn" (click)="onResolve()" [disabled]="isSubmitting">
                  {{ isSubmitting ? 'Saving...' : 'Save Update' }}
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><div class="card-title">SLA Snapshot</div></div>
              <div style="padding:16px 18px; display:flex; flex-direction:column; gap:10px;">
                <div class="hint" *ngIf="grievance?.deadline && !isOverdue()">
                  Countdown: <strong>{{ countdownLabel() }}</strong>
                </div>
                <div class="hint danger" *ngIf="isOverdue()">
                  This grievance is overdue. Please prioritize immediate resolution.
                </div>
                <div class="hint">
                  Resolved grievances are automatically stamped with resolved date and time.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [`
    :host { display: block; }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #0d1117;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 14px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-item.full { grid-column: 1 / -1; }
    .lbl {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #475569;
      font-weight: 700;
    }
    .val {
      font-size: 13px;
      color: #cbd5e1;
      line-height: 1.5;
      word-break: break-word;
    }
    .hint {
      font-size: 12px;
      color: #bfdbfe;
      background: rgba(96, 165, 250, 0.1);
      border: 1px solid rgba(96, 165, 250, 0.25);
      border-radius: 8px;
      padding: 10px 12px;
      line-height: 1.5;
    }
    .hint.danger {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }
  `]
})
export class ResolveComponent implements OnInit {
  grievance: any;
  status = 'IN_PROGRESS';
  note = '';
  success = '';
  error = '';
  isSubmitting = false;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  constructor(private route: ActivatedRoute,
              private os: OfficerService,
              private gs: GrievanceService,
              public auth: AuthService,
              public router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.gs.getById(id).subscribe({
      next: g => {
        this.grievance = g;
        if (g.status === 'RESOLVED') {
          this.status = 'RESOLVED';
        }
      },
      error: () => this.error = 'Unable to load grievance details.'
    });
  }

  onResolve() {
    this.error = '';
    this.success = '';
    if (!this.grievance?.id) {
      this.error = 'Invalid grievance context.';
      return;
    }
    if (this.status === 'RESOLVED' && !this.note.trim()) {
      this.error = 'Resolution note is required when marking as RESOLVED.';
      return;
    }
    this.isSubmitting = true;
    this.os.resolve(this.grievance.id, this.status, this.note)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.success = 'Status updated successfully!';
          setTimeout(() => this.router.navigate(['/officer/assigned']), 1200);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err?.error?.message || 'Failed to update grievance. Please try again.';
        }
      });
  }

  isOverdue(): boolean {
    if (!this.grievance?.deadline || this.grievance?.status === 'RESOLVED') {
      return false;
    }
    return new Date(this.grievance.deadline) < new Date();
  }

  countdownLabel(): string {
    if (!this.grievance?.deadline) {
      return 'No SLA deadline';
    }
    const ms = new Date(this.grievance.deadline).getTime() - Date.now();
    const days = Math.ceil(ms / 86400000);
    if (days <= 0) {
      return 'Due today';
    }
    return days === 1 ? '1 day left' : `${days} days left`;
  }

  priorityClass(priority: number): string {
    if (priority >= 3) return 'badge-high';
    if (priority === 2) return 'badge-medium';
    return 'badge-low';
  }

  priorityLabel(priority: number): string {
    if (priority >= 3) return 'P3';
    if (priority === 2) return 'P2';
    return 'P1';
  }

  statusClass(status: string): string {
    if (status === 'RESOLVED') return 'badge-resolved';
    if (status === 'IN_PROGRESS') return 'badge-progress';
    return 'badge-pending';
  }
}