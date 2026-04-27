import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { GrievanceService } from '../../services/grievance.service';

@Component({
  selector: 'app-assign-officer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse Admin</span>
        <button (click)="router.navigate(['/admin/grievances'])">
          Back to List
        </button>
      </div>
      <div class="body">
        <div class="card" *ngIf="grievance">
          <h2>Assign Officer</h2>

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
            <div class="info-item full">
              <span class="lbl">Description</span>
              <span class="val">{{ grievance.description }}</span>
            </div>
          </div>

          <label>Select Officer *</label>
          <select [(ngModel)]="selectedOfficer">
            <option value="">-- Select Officer --</option>
            <option *ngFor="let o of officers" [value]="o.id">
              {{ o.username }} — {{ o.email }}
            </option>
          </select>

          <label>Priority Level *</label>
          <select [(ngModel)]="priority">
            <option value="1">Low Priority</option>
            <option value="2">Medium Priority</option>
            <option value="3">High Priority</option>
          </select>

          <label>Deadline (days to resolve) *</label>
          <select [(ngModel)]="deadlineDays">
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>

          <p class="success" *ngIf="success">{{ success }}</p>
          <p class="err"     *ngIf="error">{{ error }}</p>

          <button (click)="onAssign()"
            [disabled]="!selectedOfficer">
            Assign Officer & Set Deadline
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:var(--bg-main); }
    .topbar { background:var(--teal); color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:rgba(255,255,255,0.2); color:#fff;
      border:none; border-radius:6px; cursor:pointer; font-weight:600; }
    .topbar button:hover { background:rgba(255,255,255,0.3); }
    .body { padding:24px; display:flex; justify-content:center; }
    .card { background:var(--bg-card); padding:32px; border-radius:16px;
      width:100%; max-width:560px; border:1px solid var(--border);
      box-shadow:0 2px 12px rgba(0,0,0,0.15); }
    h2 { color:var(--teal); margin:0 0 20px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr;
      gap:10px; background:var(--bg-card2); border-radius:10px;
      padding:16px; margin-bottom:20px; }
    .info-item { display:flex; flex-direction:column; gap:3px; }
    .info-item.full { grid-column:1/-1; }
    .lbl { font-size:10px; color:var(--text3); text-transform:uppercase; }
    .val { font-size:13px; color:var(--text); font-weight:500; }
    label { display:block; font-size:12px; color:var(--text2);
      margin:14px 0 5px; }
    select { width:100%; padding:10px 14px; border:1px solid var(--border);
      border-radius:8px; font-size:14px; background:var(--bg-card2);
      color:var(--text); outline:none; }
    select:focus { border-color:var(--teal); }
    select option { background:var(--bg-card2); color:var(--text); }
    button { margin-top:22px; width:100%; padding:13px;
      background:linear-gradient(135deg,var(--teal),#0f7a76); color:#fff; border:none;
      border-radius:8px; font-size:15px; cursor:pointer; font-weight:700; }
    button:disabled { opacity:0.5; cursor:not-allowed; }
    .success { color:var(--green); font-size:12px; margin-top:8px; }
    .err     { color:var(--red); font-size:12px; margin-top:8px; }
  `]
})
export class AssignOfficerComponent implements OnInit {
  grievance: any;
  officers: any[] = [];
  selectedOfficer = '';
  priority = '2';
  deadlineDays = '3';
  success = '';
  error = '';

  constructor(private route: ActivatedRoute,
    private adminService: AdminService,
    private gs: GrievanceService,
    public router: Router) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Invalid grievance ID';
      return;
    }
    this.gs.getById(id).subscribe({
      next: g => this.grievance = g,
      error: err => {
        console.error('Failed to load grievance:', err);
        this.error = 'Failed to load grievance details. Please go back and try again.';
      }
    });
    this.adminService.getOfficers().subscribe({
      next: o => {
        this.officers = o;
        if (o.length === 0) {
          this.error = 'No officers registered yet. Please register an officer account first.';
        }
      },
      error: err => console.error('Failed to load officers:', err)
    });
  }

  onAssign() {
    this.adminService.assignOfficer(
      this.grievance.id,
      Number(this.selectedOfficer),
      Number(this.priority),
      Number(this.deadlineDays)
    ).subscribe({
      next: () => {
        this.success = 'Officer assigned with deadline set!';
        setTimeout(() =>
          this.router.navigate(['/admin/grievances']), 1500);
      },
      error: () => this.error = 'Assignment failed. Try again.'
    });
  }
}