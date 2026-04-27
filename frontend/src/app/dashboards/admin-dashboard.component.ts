import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrievanceService } from '../services/grievance.service';
import { AdminService } from '../services/admin.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <!-- Topbar -->
      <nav class="topbar">
        <span class="brand-text">AdminConsole</span>
        <div class="nav-links">
          <a class="nav-link active">Home</a>
          <a class="nav-link" (click)="router.navigate(['/admin/analytics'])">Analytics</a>
          <a class="nav-link" (click)="router.navigate(['/admin/heatmap'])">Heatmap</a>
        </div>
        <div class="nav-right">
          <button class="theme-btn" (click)="theme.toggle()">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="auth.logout()">LOGOUT</button>
        </div>
      </nav>

      <!-- Main -->
      <div class="main">
        <div class="page-title-row">
          <h2>Pulse <span class="hl">Master Dashboard</span></h2>
          <p>Oversee and manage city-wide grievances</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="loading-msg">Loading grievances...</div>

        <!-- Error -->
        <div *ngIf="loadError" class="error-msg">{{ loadError }}</div>

        <!-- Table -->
        <div class="table-wrap" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Citizen</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let g of grievances">
                <td class="id-col">#{{ g.id }}</td>
                <td class="title-col">{{ g.title }}</td>
                <td>{{ g.citizenName || 'User' }}</td>
                <td><span class="cat-tag">{{ g.category }}</span></td>
                <td>
                  <span class="badge-pill" [ngClass]="'badge-' + g.status?.toLowerCase()">
                    {{ g.status }}
                  </span>
                </td>
                <td>
                  <span class="badge-pill" [ngClass]="getPriorityClass(g.priority)">
                    {{ getPriorityLabel(g.priority) }}
                  </span>
                </td>
                <td class="officer-col">
                  {{ getOfficerName(g.assignedOfficerId) }}
                </td>
                <td class="action-col">
                  <button class="manage-btn" (click)="openAssign(g)">Manage</button>
                  <button class="view-btn" (click)="openView(g)">View</button>
                </td>
              </tr>
              <tr *ngIf="grievances.length === 0">
                <td colspan="8" class="empty-row">No grievances found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assign Modal -->
      <div class="modal-bg" *ngIf="assignTarget" (click)="closeAssign()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>Assign Resource for #{{ assignTarget.id }}</h3>
          <p class="modal-sub">{{ assignTarget.title }}</p>

          <div class="modal-grid">
            <div class="mf">
              <label>Assign Officer</label>
              <select [(ngModel)]="assignOfficerId">
                <option value="">-- Select Officer --</option>
                <option *ngFor="let o of officers" [value]="o.id">
                  {{ o.username }}
                </option>
              </select>
            </div>
            <div class="mf">
              <label>Department</label>
              <input [value]="getDept(assignTarget.category)" readonly/>
            </div>
            <div class="mf">
              <label>Priority</label>
              <select [(ngModel)]="assignPriority">
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Critical</option>
              </select>
            </div>
            <div class="mf">
              <label>Deadline</label>
              <select [(ngModel)]="assignDays">
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            </div>
          </div>

          <p *ngIf="officers.length === 0" class="warn-msg">
            ⚠️ No officers registered. Please register an officer account first.
          </p>
          <p *ngIf="assignMsg" class="success-msg">{{ assignMsg }}</p>

          <div class="modal-btns">
            <button class="cancel-btn" (click)="closeAssign()">Cancel</button>
            <button class="save-btn"
              [disabled]="!assignOfficerId || saving"
              (click)="doAssign()">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- View Modal -->
      <div class="modal-bg" *ngIf="viewTarget" (click)="viewTarget = null">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <h3>Grievance #{{ viewTarget.id }}</h3>
          <div class="view-grid">
            <div class="vf"><span class="vl">Title</span><span class="vv">{{ viewTarget.title }}</span></div>
            <div class="vf"><span class="vl">Status</span>
              <span class="badge-pill" [ngClass]="'badge-' + viewTarget.status?.toLowerCase()">
                {{ viewTarget.status }}
              </span>
            </div>
            <div class="vf"><span class="vl">Category</span><span class="vv">{{ viewTarget.category }}</span></div>
            <div class="vf"><span class="vl">Location</span><span class="vv">{{ viewTarget.location }}</span></div>
            <div class="vf full"><span class="vl">Description</span><span class="vv">{{ viewTarget.description }}</span></div>
            <div class="vf"><span class="vl">Submitted</span>
              <span class="vv">{{ viewTarget.submissionDate | date:'dd MMM yyyy, hh:mm a' }}</span>
            </div>
            <div class="vf" *ngIf="viewTarget.resolutionNote">
              <span class="vl">Resolution Note</span>
              <span class="vv teal">{{ viewTarget.resolutionNote }}</span>
            </div>
          </div>
          <div class="modal-btns">
            <button class="save-btn" (click)="viewTarget = null">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { min-height:100vh; background:var(--bg-main,#0f1923); }

    .topbar { background:var(--bg-card,#162032);
      border-bottom:1px solid var(--border,rgba(255,255,255,0.08));
      padding:14px 28px; display:flex; align-items:center; gap:20px; }
    .brand-text { font-size:18px; font-weight:700; color:var(--text,#e2e8f0); }
    .nav-links { display:flex; gap:24px; flex:1; }
    .nav-link { color:var(--text3,#64748b); font-size:14px; cursor:pointer;
      padding:6px 0; border-bottom:2px solid transparent; }
    .nav-link:hover, .nav-link.active { color:var(--teal,#0EA5A0); border-bottom-color:var(--teal,#0EA5A0); }
    .nav-right { display:flex; gap:10px; align-items:center; }
    .theme-btn { background:transparent;
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:8px; padding:6px 10px; cursor:pointer;
      font-size:16px; color:var(--text,#e2e8f0); }
    .theme-btn:hover { background:var(--bg-hover,rgba(255,255,255,0.05)); }
    .logout-btn { padding:7px 18px; background:#ef4444; color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }

    .main { padding:24px 28px; }
    .page-title-row { text-align:center; margin-bottom:20px; }
    h2 { color:var(--text,#e2e8f0); font-size:22px; font-weight:700; }
    .hl { color:var(--gold,#F0A500); }
    .page-title-row p { color:var(--text3,#64748b); font-size:13px; }

    .loading-msg, .error-msg { text-align:center; padding:40px;
      color:var(--text3,#64748b); font-size:14px; }
    .error-msg { color:#fca5a5; }

    .table-wrap { background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:14px; overflow:auto; }
    table { width:100%; border-collapse:collapse; min-width:800px; }
    th { padding:13px 16px; font-size:12px; color:var(--gold,#F0A500);
      font-weight:700; text-align:left;
      border-bottom:1px solid var(--border,rgba(255,255,255,0.08)); }
    td { padding:12px 16px; font-size:13px; color:var(--text2,#94a3b8);
      border-bottom:1px solid var(--border2,rgba(255,255,255,0.04)); }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:var(--bg-hover,rgba(14,165,160,0.04)); }
    .id-col { color:var(--gold,#F0A500); font-weight:700; }
    .title-col { color:var(--text,#e2e8f0); font-weight:500;
      max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .officer-col { color:var(--teal,#0EA5A0); }
    .cat-tag { font-size:10px; background:rgba(255,255,255,0.07);
      padding:3px 8px; border-radius:20px; color:var(--text2,#94a3b8); }
    .action-col { display:flex; gap:6px; }
    .manage-btn { padding:5px 14px; background:var(--green,#10b981); color:#fff;
      border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; }
    .view-btn { padding:5px 14px; background:var(--teal,#0EA5A0); color:#fff;
      border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; }
    .empty-row { text-align:center; color:var(--text3,#64748b); padding:32px; }

    /* Modals */
    .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.7);
      display:flex; align-items:center; justify-content:center; z-index:200; }
    .modal-box { background:var(--bg-card2,#1a2840);
      border:1px solid var(--border,rgba(255,255,255,0.1));
      border-radius:16px; padding:32px; width:560px; max-width:95vw;
      max-height:90vh; overflow-y:auto; }
    h3 { color:var(--text,#e2e8f0); font-size:18px; font-weight:700; margin-bottom:4px; }
    .modal-sub { color:var(--text3,#64748b); font-size:13px; margin-bottom:20px; }
    .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
    .mf label { display:block; font-size:11px; color:var(--text3,#64748b); margin-bottom:5px; text-transform:uppercase; }
    .mf input, .mf select { width:100%; padding:10px 14px;
      background:var(--bg-main,#0f1923);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:8px; font-size:13px; color:var(--text,#e2e8f0); outline:none; }
    .mf select option { background:#0f1923; color:#e2e8f0; }
    .warn-msg { color:var(--gold,#F0A500); font-size:12px; margin-bottom:10px; }
    .success-msg { color:var(--green,#10b981); font-size:12px; margin-bottom:10px; }
    .modal-btns { display:flex; justify-content:flex-end; gap:10px; margin-top:16px; }
    .cancel-btn { padding:9px 20px; background:transparent;
      border:1px solid var(--border,rgba(255,255,255,0.1));
      color:var(--text2,#94a3b8); border-radius:8px; cursor:pointer; font-size:13px; }
    .save-btn { padding:9px 22px;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      color:#fff; border:none; border-radius:8px; cursor:pointer;
      font-size:13px; font-weight:700; }
    .save-btn:disabled { opacity:0.5; cursor:not-allowed; }

    /* View modal */
    .view-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
    .vf { display:flex; flex-direction:column; gap:4px; }
    .vf.full { grid-column:1/-1; }
    .vl { font-size:10px; color:var(--text3,#64748b); text-transform:uppercase; font-weight:600; }
    .vv { font-size:13px; color:var(--text,#e2e8f0); }
    .vv.teal { color:var(--teal,#0EA5A0); }
  `]
})
export class AdminDashboardComponent implements OnInit {
  grievances: any[] = [];
  officers: any[] = [];
  loading = true;
  loadError = '';

  assignTarget: any = null;
  assignOfficerId = '';
  assignPriority = '2';
  assignDays = '3';
  assignMsg = '';
  saving = false;

  viewTarget: any = null;

  constructor(
    public auth: AuthService,
    public router: Router,
    public theme: ThemeService,
    private gs: GrievanceService,
    private adminSvc: AdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadData();
    this.adminSvc.getOfficers().subscribe({
      next: d => { this.officers = d; this.cdr.detectChanges(); },
      error: () => { }
    });
  }

  loadData() {
    this.loading = true;
    this.loadError = '';
    this.gs.getAllGrievances().subscribe({
      next: data => {
        this.grievances = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.loading = false;
        this.loadError = 'Failed to load grievances. Please refresh.';
        this.cdr.detectChanges();
      }
    });
  }

  openAssign(g: any) {
    this.assignTarget = g;
    this.assignOfficerId = g.assignedOfficerId?.toString() || '';
    this.assignPriority = g.priority?.toString() || '2';
    this.assignMsg = '';
    this.saving = false;
  }

  closeAssign() {
    this.assignTarget = null;
    this.assignMsg = '';
  }

  doAssign() {
    if (!this.assignOfficerId) return;
    this.saving = true;
    this.adminSvc.assignOfficer(
      this.assignTarget.id,
      Number(this.assignOfficerId),
      Number(this.assignPriority),
      Number(this.assignDays)
    ).subscribe({
      next: () => {
        this.saving = false;
        this.assignMsg = '✅ Officer assigned successfully!';
        this.loadData();
        setTimeout(() => { this.closeAssign(); }, 1500);
      },
      error: () => {
        this.saving = false;
        this.assignMsg = '❌ Assignment failed. Try again.';
      }
    });
  }

  openView(g: any) {
    this.viewTarget = g;
  }

  getOfficerName(officerId: number | null): string {
    if (!officerId) return 'Unassigned';
    const o = this.officers.find(x => x.id === officerId);
    return o ? o.username : 'Officer #' + officerId;
  }

  getPriorityLabel(p: number): string {
    return ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][p] || 'LOW';
  }

  getPriorityClass(p: number): string {
    return ['', 'badge-low', 'badge-medium', 'badge-high', 'badge-critical'][p] || 'badge-low';
  }

  getDept(category: string): string {
    const map: any = {
      WATER: 'Water Dept', ROAD: 'Roads Dept', SANITATION: 'Sanitation Dept',
      ELECTRICITY: 'Electricity board', STREET_LIGHT: 'Street Light Dept',
      DRAINAGE: 'Drainage Dept', OTHER: 'General Dept'
    };
    return map[category] || 'General Dept';
  }
}