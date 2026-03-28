import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OfficerService } from '../../services/officer.service';
import { GrievanceService } from '../../services/grievance.service';

@Component({
  selector: 'app-resolve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse Officer</span>
        <button (click)="router.navigate(['/officer/assigned'])">Back</button>
      </div>
      <div class="body">
        <div class="card" *ngIf="grievance">
          <h2>Update Grievance</h2>
          <div class="info">
            <p><strong>Title:</strong> {{ grievance.title }}</p>
            <p><strong>Category:</strong> {{ grievance.category }}</p>
            <p><strong>Description:</strong> {{ grievance.description }}</p>
          </div>
          <label>Update Status</label>
          <select [(ngModel)]="status">
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <label>Resolution Note</label>
          <textarea [(ngModel)]="note" rows="4"
            placeholder="Describe what was done to resolve this issue">
          </textarea>
          <p class="success" *ngIf="success">{{ success }}</p>
          <button (click)="onResolve()">Save Update</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#7c3aed; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:#fff; color:#7c3aed;
      border:none; border-radius:6px; cursor:pointer; }
    .body { padding:24px; display:flex; justify-content:center; }
    .card { background:#fff; padding:32px; border-radius:16px;
      width:100%; max-width:520px;
      box-shadow:0 2px 12px rgba(0,0,0,0.08); }
    h2 { color:#7c3aed; margin:0 0 20px; }
    .info { background:#f8fafc; border-radius:8px;
      padding:14px; margin-bottom:20px; }
    .info p { margin:4px 0; font-size:13px; color:#334155; }
    label { display:block; font-size:12px; color:#475569;
      margin:14px 0 5px; }
    select, textarea { width:100%; padding:10px 14px;
      border:1px solid #e2e8f0; border-radius:8px;
      font-size:14px; box-sizing:border-box; font-family:inherit; }
    button { margin-top:20px; width:100%; padding:12px;
      background:#7c3aed; color:#fff; border:none;
      border-radius:8px; font-size:15px; cursor:pointer; }
    .success { color:#10b981; font-size:12px; margin-top:8px; }
  `]
})
export class ResolveComponent implements OnInit {
  grievance: any;
  status = 'IN_PROGRESS';
  note = '';
  success = '';

  constructor(private route: ActivatedRoute,
              private os: OfficerService,
              private gs: GrievanceService,
              public router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.gs.getById(id).subscribe(g => this.grievance = g);
  }

  onResolve() {
    this.os.resolve(this.grievance.id, this.status, this.note)
      .subscribe(() => {
        this.success = 'Status updated successfully!';
        setTimeout(() => this.router.navigate(['/officer/assigned']), 1500);
      });
  }
}