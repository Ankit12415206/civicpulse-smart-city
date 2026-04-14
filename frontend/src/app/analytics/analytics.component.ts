import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../services/analytics.service';
import { AuthService } from '../services/auth.service';
import { Chart, registerables } from 'chart.js';
import { SidebarComponent, NavItem } from '../shared/sidebar.component';
import { TopbarComponent } from '../shared/topbar.component';
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="ADMIN" homeRoute="/admin/dashboard" [sections]="navSections"></app-sidebar>

      <div class="main-content">
        <app-topbar title="Analytics & Reports" [subtitle]="today" role="ADMIN"></app-topbar>
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
    </div>
  `,
  styles: [`
    .body { padding:24px; background:var(--bg-main, #0f1923); }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr);
      gap:16px; margin-bottom:24px; }
    .stat-card { background:var(--bg-card, #162032); border-radius:12px; padding:20px;
      text-align:center; border:1px solid var(--border, rgba(255,255,255,0.08)); }
    .stat-card .num { font-size:32px; font-weight:600; color:var(--text, #e2e8f0); }
    .stat-card .lbl { font-size:13px; color:var(--text3, #94a3b8); margin-top:4px; }
    .stat-card.pending .num { color:#d97706; }
    .stat-card.progress .num { color:#2563eb; }
    .stat-card.resolved .num { color:#16a34a; }
    .charts-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .chart-card { background:var(--bg-card, #162032); border-radius:12px; padding:24px;
      border:1px solid var(--border, rgba(255,255,255,0.08)); }
    h3 { margin:0 0 16px; color:var(--text, #e2e8f0); font-size:15px; }
  `]
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  summary: any;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'MANAGEMENT', items: [
        { icon: '🏠', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: '☰', label: 'All Grievances', route: '/admin/grievances' },
        { icon: '👤', label: 'Assign Officers', route: '/admin/grievances' },
        { icon: '👥', label: 'Manage Users', route: '/admin/users' }
      ]
    },
    {
      label: 'ANALYTICS', items: [
        { icon: '📊', label: 'Analytics & Reports', route: '/admin/analytics', active: true }
      ]
    }
  ];

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