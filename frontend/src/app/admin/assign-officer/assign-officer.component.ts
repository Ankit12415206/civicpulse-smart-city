import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent, NavItem } from '../../shared/sidebar.component';
import { TopbarComponent } from '../../shared/topbar.component';

@Component({
  selector: 'app-assign-officer',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="ADMIN" homeRoute="/admin/dashboard" [sections]="navSections"></app-sidebar>

      <div class="main-content">
        <app-topbar title="Assign Officer" [subtitle]="today" role="ADMIN"></app-topbar>

        <div class="page-content">
          <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
            <button class="view-all-btn" (click)="router.navigate(['/admin/grievances'])">← Back to List</button>
          </div>
          <div class="page-header">
            <h1>👤 Assign Department Officer</h1>
            <p>Set officer, priority, and SLA for grievance handling.</p>
          </div>

          <div *ngIf="error" class="msg-error">{{ error }}</div>
          <div *ngIf="success" class="msg-success">{{ success }}</div>

          <div class="content-grid" style="padding:0; grid-template-columns:1fr 340px;">
            <div class="card" *ngIf="grievance">
              <div class="card-header">
                <div class="card-title">Grievance Details</div>
                <span class="badge" [ngClass]="grievance.status === 'PENDING' ? 'badge-pending' : 'badge-progress'">
                  {{ grievance.status?.replace('_', ' ') }}
                </span>
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
                    <span class="lbl">Submitted</span>
                    <span class="val">{{ grievance.submissionDate | date:'dd MMM yyyy, hh:mm a' }}</span>
                  </div>
                  <div class="info-item full">
                    <span class="lbl">Description</span>
                    <span class="val">{{ grievance.description }}</span>
                  </div>
                </div>

                <div class="form-group" style="margin-top:18px;">
                  <label class="form-label">Select Officer</label>
                  <select class="form-select" [(ngModel)]="selectedOfficer">
                    <option value="">-- Select Officer --</option>
                    <option *ngFor="let o of officers" [value]="o.id">
                      {{ o.username }} ({{ o.email }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Department</label>
                  <select class="form-select" [(ngModel)]="selectedDepartment">
                    <option value="">-- Optional Department --</option>
                    <option *ngFor="let d of departments" [value]="d.id">
                      {{ d.name }} ({{ d.category }})
                    </option>
                  </select>
                </div>

                <div class="assignment-grid">
                  <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" [(ngModel)]="priority">
                      <option value="1">Low (P1)</option>
                      <option value="2">Medium (P2)</option>
                      <option value="3">High (P3)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">SLA Deadline</label>
                    <select class="form-select" [(ngModel)]="deadlineDays">
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </div>
                </div>

                <button class="submit-btn" (click)="onAssign()" [disabled]="isSubmitting || !selectedOfficer">
                  {{ isSubmitting ? 'Assigning...' : 'Assign Officer (Status → In Progress)' }}
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><div class="card-title">Officer & Department Info</div></div>
              <div style="padding:16px 18px; display:flex; flex-direction:column; gap:12px;">
                <div class="info-note">
                  Suggested department for this category:
                  <strong>{{ recommendedDepartment || 'No direct match' }}</strong>
                </div>
                <div class="mini-list">
                  <div class="mini-title">Officers ({{ officers.length }})</div>
                  <div *ngFor="let o of officers" class="mini-item">{{ o.username }} · {{ o.email }}</div>
                </div>
                <div class="mini-list">
                  <div class="mini-title">Departments ({{ departments.length }})</div>
                  <div *ngFor="let d of departments" class="mini-item">{{ d.name }} · {{ d.category }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    .assignment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .info-note {
      background: rgba(96, 165, 250, 0.1);
      border: 1px solid rgba(96, 165, 250, 0.25);
      color: #bfdbfe;
      font-size: 12px;
      border-radius: 8px;
      padding: 10px 12px;
      line-height: 1.5;
    }
    .mini-list {
      border: 1px solid #1e293b;
      border-radius: 10px;
      overflow: hidden;
    }
    .mini-title {
      background: #0d1117;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      padding: 10px 12px;
      border-bottom: 1px solid #1e293b;
    }
    .mini-item {
      padding: 9px 12px;
      color: #cbd5e1;
      font-size: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .mini-item:last-child { border-bottom: 0; }
  `]
})
export class AssignOfficerComponent implements OnInit {
  grievance: any;
  officers: any[] = [];
  departments: any[] = [];
  selectedOfficer = '';
  selectedDepartment = '';
  priority = '2';
  deadlineDays = '3';
  recommendedDepartment = '';
  success = '';
  error = '';
  isSubmitting = false;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'MANAGEMENT', items: [
        { icon: '🏠', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: '☰', label: 'All Grievances', route: '/admin/grievances' },
        { icon: '👤', label: 'Assign Officers', route: '/admin/grievances', active: true },
        { icon: '👥', label: 'Manage Users', route: '/admin/users' }
      ]
    },
    {
      label: 'ANALYTICS', items: [
        { icon: '📊', label: 'Analytics & Reports', route: '/admin/analytics' }
      ]
    }
  ];

  constructor(private route: ActivatedRoute,
              private adminService: AdminService,
              private gs: GrievanceService,
              public auth: AuthService,
              public router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.gs.getById(id).subscribe({
      next: g => {
        this.grievance = g;
        this.updateRecommendedDepartment();
      },
      error: () => this.error = 'Failed to load grievance details.'
    });
    this.adminService.getOfficers().subscribe({
      next: o => this.officers = o,
      error: () => this.error = 'Failed to load officers list.'
    });
    this.adminService.getDepartments().subscribe({
      next: d => {
        this.departments = d;
        this.updateRecommendedDepartment();
      },
      error: () => this.error = 'Failed to load departments list.'
    });
  }

  onAssign() {
    this.error = '';
    this.success = '';
    this.isSubmitting = true;
    this.adminService.assignOfficer(
      this.grievance.id,
      Number(this.selectedOfficer),
      Number(this.priority),
      Number(this.deadlineDays),
      this.selectedDepartment ? Number(this.selectedDepartment) : undefined
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = 'Officer assigned with deadline set!';
        setTimeout(() =>
          this.router.navigate(['/admin/grievances']), 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err?.error?.message || 'Assignment failed. Try again.';
      }
    });
  }

  private updateRecommendedDepartment() {
    if (!this.grievance?.category || this.departments.length === 0) {
      return;
    }
    const match = this.departments.find((d: any) => d.category === this.grievance.category);
    if (match) {
      this.recommendedDepartment = match.name;
      if (!this.selectedDepartment) {
        this.selectedDepartment = String(match.id);
      }
    }
  }

}