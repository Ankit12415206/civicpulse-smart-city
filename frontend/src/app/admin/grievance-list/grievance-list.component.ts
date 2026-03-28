import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GrievanceService } from '../../services/grievance.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-grievance-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse Admin</span>
        <button (click)="router.navigate(['/admin/dashboard'])">Dashboard</button>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <h2>All Grievances</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Category</th>
              <th>Location</th><th>Status</th><th>Priority</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let g of grievances">
              <td>{{ g.id }}</td>
              <td>{{ g.title }}</td>
              <td>{{ g.category }}</td>
              <td>{{ g.location }}</td>
              <td><span class="badge" [class]="g.status.toLowerCase()">
                {{ g.status }}</span></td>
              <td>{{ g.priority }}</td>
              <td>
                <button (click)="assign(g)">Assign</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#1e40af; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:#fff; color:#1e40af;
      border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .body { padding:24px; }
    h2 { color:#1e40af; margin-bottom:16px; }
    table { width:100%; border-collapse:collapse; background:#fff;
      border-radius:12px; overflow:hidden;
      box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    th { background:#1e40af; color:#fff; padding:12px 14px;
      text-align:left; font-size:13px; }
    td { padding:12px 14px; border-bottom:1px solid #f1f5f9;
      font-size:13px; color:#334155; }
    button { padding:5px 12px; background:#1e40af; color:#fff;
      border:none; border-radius:6px; cursor:pointer; font-size:12px; }
    .badge { font-size:11px; padding:3px 8px; border-radius:20px; }
    .badge.pending { background:#fef3c7; color:#92400e; }
    .badge.in_progress { background:#dbeafe; color:#1e40af; }
    .badge.resolved { background:#dcfce7; color:#166534; }
  `]
})
export class GrievanceListComponent implements OnInit {
  grievances: any[] = [];

  constructor(private gs: GrievanceService,
              public router: Router,
              public auth: AuthService) {}

  ngOnInit() {
    this.gs.getAllGrievances().subscribe(data => this.grievances = data);
  }

  assign(g: any) {
    this.router.navigate(['/admin/assign', g.id]);
  }
}