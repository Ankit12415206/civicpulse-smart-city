import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../services/analytics.service';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse Analytics</span>
        <button (click)="router.navigate(['/admin/dashboard'])">Dashboard</button>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <div class="stats-row" *ngIf="summary">
          <div class="stat-card">
            <div class="num">{{ summary.total }}</div>
            <div class="lbl">Total</div>
          </div>
          <div class="stat-card pending">
            <div class="num">{{ summary.pending }}</div>
            <div class="lbl">Pending</div>
          </div>
          <div class="stat-card progress">
            <div class="num">{{ summary.inProgress }}</div>
            <div class="lbl">In Progress</div>
          </div>
          <div class="stat-card resolved">
            <div class="num">{{ summary.resolved }}</div>
            <div class="lbl">Resolved</div>
          </div>
        </div>
        <div class="charts-row">
          <div class="chart-card">
            <h3>Complaints by Status</h3>
            <canvas #statusChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Complaints by Category</h3>
            <canvas #categoryChart></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#1e40af; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:#fff; color:#1e40af;
      border:none; border-radius:6px; cursor:pointer; }
    .body { padding:24px; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr);
      gap:16px; margin-bottom:24px; }
    .stat-card { background:#fff; border-radius:12px; padding:20px;
      text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .stat-card .num { font-size:32px; font-weight:600; color:#1e40af; }
    .stat-card .lbl { font-size:13px; color:#94a3b8; margin-top:4px; }
    .stat-card.pending .num { color:#d97706; }
    .stat-card.progress .num { color:#2563eb; }
    .stat-card.resolved .num { color:#16a34a; }
    .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .chart-card { background:#fff; border-radius:12px; padding:24px;
      box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    h3 { margin:0 0 16px; color:#1e293b; font-size:15px; }
  `]
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  summary: any;

  constructor(private as: AnalyticsService,
              public auth: AuthService,
              public router: Router) {}

  ngOnInit() {
    this.as.getSummary().subscribe(data => {
      this.summary = data;
      setTimeout(() => this.buildStatusChart(data), 100);
    });
    this.as.getCategories().subscribe(data => {
      setTimeout(() => this.buildCategoryChart(data), 100);
    });
  }

  buildStatusChart(data: any) {
    new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Pending','In Progress','Resolved','Reopened'],
        datasets: [{
          data: [data.pending, data.inProgress,
                 data.resolved, data.reopened],
          backgroundColor: ['#fbbf24','#60a5fa','#34d399','#f87171']
        }]
      }
    });
  }

  buildCategoryChart(data: any) {
    new Chart(this.categoryChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Complaints',
          data: Object.values(data),
          backgroundColor: '#60a5fa'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  }
}