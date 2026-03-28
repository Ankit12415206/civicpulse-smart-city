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
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse Officer</span>
        <span class="user">{{ auth.getUsername() }}</span>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <h2>Assigned to Me
          <span class="count">{{ grievances.length }}</span>
        </h2>

        <div *ngIf="grievances.length === 0" class="empty">
          No grievances assigned to you yet.
        </div>

        <div class="card" *ngFor="let g of grievances"
             [class.overdue]="isOverdue(g)">

          <div class="card-top">
            <span class="title">{{ g.title }}</span>
            <div class="badges">
              <span class="badge overdue-badge"
                *ngIf="isOverdue(g)">OVERDUE</span>
              <span class="badge priority"
                [class]="'p' + g.priority">
                P{{ g.priority }}
              </span>
              <span class="badge status"
                [class]="g.status.toLowerCase()">
                {{ g.status }}
              </span>
            </div>
          </div>

          <div class="meta">
            <span>{{ g.category }}</span> •
            <span>{{ g.location }}</span>
          </div>

          <p class="desc">{{ g.description }}</p>

          <div class="deadline" *ngIf="g.deadline">
            Deadline:
            <strong
              [class.red]="isOverdue(g)">
              {{ g.deadline | date:'dd MMM yyyy, hh:mm a' }}
            </strong>
            <span class="days-left" *ngIf="!isOverdue(g)">
              ({{ daysLeft(g) }} days left)
            </span>
          </div>

          <button (click)="
            router.navigate(['/officer/resolve', g.id])">
            Update Status
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#7c3aed; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .user  { font-size:13px; opacity:0.85; }
    .topbar button { padding:6px 14px; background:#fff; color:#7c3aed;
      border:none; border-radius:6px; cursor:pointer; }
    .body { padding:24px; max-width:820px; margin:0 auto; }
    h2 { color:#7c3aed; margin-bottom:16px;
      display:flex; align-items:center; gap:10px; }
    .count { background:#7c3aed; color:#fff; font-size:13px;
      padding:2px 10px; border-radius:20px; }
    .card { background:#fff; border-radius:14px; padding:20px;
      margin-bottom:14px;
      box-shadow:0 2px 8px rgba(0,0,0,0.06);
      border-left:4px solid #e2e8f0; }
    .card.overdue { border-left:4px solid #ef4444;
      background:#fff5f5; }
    .card-top { display:flex; justify-content:space-between;
      align-items:flex-start; margin-bottom:8px; }
    .title { font-weight:600; color:#1e293b; font-size:15px; }
    .badges { display:flex; gap:6px; flex-wrap:wrap; }
    .badge { font-size:10px; padding:3px 8px;
      border-radius:20px; font-weight:600; }
    .overdue-badge { background:#fee2e2; color:#991b1b; }
    .priority.p1 { background:#dcfce7; color:#166534; }
    .priority.p2 { background:#fef3c7; color:#92400e; }
    .priority.p3 { background:#fee2e2; color:#991b1b; }
    .status.in_progress { background:#dbeafe; color:#1e40af; }
    .status.pending { background:#fef3c7; color:#92400e; }
    .meta { font-size:12px; color:#94a3b8; margin-bottom:8px; }
    .desc { font-size:13px; color:#64748b; margin-bottom:12px; }
    .deadline { font-size:12px; color:#475569; margin-bottom:12px; }
    .deadline strong.red { color:#ef4444; }
    .days-left { color:#0d9488; margin-left:6px; }
    button { padding:8px 18px; background:#7c3aed; color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:13px; }
    .empty { text-align:center; color:#94a3b8; margin-top:60px; }
  `]
})
export class AssignedComponent implements OnInit {
  grievances: any[] = [];

  constructor(private os: OfficerService,
              public auth: AuthService,
              public router: Router) {}

  ngOnInit() {
    this.os.getAssigned().subscribe({
      next: data => this.grievances = data,
      error: () => {}
    });
  }

  isOverdue(g: any): boolean {
    if (!g.deadline) return false;
    return new Date(g.deadline) < new Date()
      && g.status !== 'RESOLVED';
  }

  daysLeft(g: any): number {
    if (!g.deadline) return 0;
    const diff = new Date(g.deadline).getTime()
      - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}