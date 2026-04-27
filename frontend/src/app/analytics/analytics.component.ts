import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnalyticsService } from '../services/analytics.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">
      <nav class="topbar">
        <span class="brand-text">AnalyticsHub</span>
        <div class="nav-links">
          <a class="nav-link" (click)="goBack()">Dashboard</a>
          <a class="nav-link active">Hub Overview</a>
          <a class="nav-link" *ngIf="auth.getRole() === 'ADMIN'" (click)="router.navigate(['/admin/heatmap'])">Heatmap</a>
        </div>
        <div class="nav-right">
          <button class="theme-btn" (click)="theme.toggle()">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="auth.logout()">LOGOUT</button>
        </div>
      </nav>

      <div class="main">
        <p class="page-sub">Data-driven overview of civic performance</p>

        <!-- SLA Summary Cards -->
        <div class="sla-row">
          <div class="sla-card">
            <div class="sla-icon">⏱️</div>
            <div class="sla-value">{{ slaData?.avgResolutionDays || 0 }}<span class="sla-unit">days</span></div>
            <div class="sla-label">Avg Resolution Time</div>
          </div>
          <div class="sla-card breach-card">
            <div class="sla-icon">🚨</div>
            <div class="sla-value breach-val">{{ slaData?.breachRate || 0 }}<span class="sla-unit">%</span></div>
            <div class="sla-label">SLA Breach Rate</div>
            <div class="sla-sub">{{ slaData?.breachedCount || 0 }} breached</div>
          </div>
          <div class="sla-card ontime-card">
            <div class="sla-icon">✅</div>
            <div class="sla-value ontime-val">{{ slaData?.onTimeRate || 0 }}<span class="sla-unit">%</span></div>
            <div class="sla-label">On-Time Delivery</div>
          </div>
          <div class="sla-card">
            <div class="sla-icon">📊</div>
            <div class="sla-value">{{ resolutionRate }}<span class="sla-unit">%</span></div>
            <div class="sla-label">Resolution Rate</div>
            <div class="sla-sub">{{ total }} total filed</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="top-row">
          <div class="chart-card">
            <h4>Status Distribution</h4>
            <canvas id="statusChartCanvas"></canvas>
          </div>
          <div class="chart-card">
            <h4>Monthly Trend</h4>
            <canvas id="monthlyChartCanvas"></canvas>
          </div>
        </div>

        <!-- Category Distribution -->
        <div class="top-row">
          <div class="chart-card">
            <h4>Category Distribution</h4>
            <canvas id="zoneChartCanvas"></canvas>
          </div>
          <div class="chart-card wide-card">
            <h4>🏢 Department Performance</h4>
            <div class="dept-table-wrap">
              <table class="dept-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Avg Hours</th>
                    <th>SLA Breaches</th>
                    <th>Health</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of deptStats">
                    <td class="dept-name">{{ getDeptLabel(d.department) }}</td>
                    <td>{{ d.total }}</td>
                    <td class="resolved-col">{{ d.resolved }}</td>
                    <td>{{ d.avgHours }}h</td>
                    <td>
                      <span class="breach-badge" [class.breach-danger]="d.breached > 0">
                        {{ d.breached }}
                      </span>
                    </td>
                    <td>
                      <span class="health-dot" [class.health-good]="d.breached === 0"
                        [class.health-warn]="d.breached > 0 && d.breached <= 2"
                        [class.health-bad]="d.breached > 2">
                        {{ d.breached === 0 ? '🟢' : d.breached <= 2 ? '🟡' : '🔴' }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="deptStats.length === 0">
                    <td colspan="6" class="empty-row">No department data available</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
    .nav-link { color:var(--text3,#64748b); font-size:14px; cursor:pointer; padding:6px 0;
      border-bottom:2px solid transparent; }
    .nav-link:hover, .nav-link.active { color:var(--teal,#0EA5A0); border-bottom-color:var(--teal,#0EA5A0); }
    .nav-right { display:flex; gap:10px; align-items:center; }
    .theme-btn { background:transparent; border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:8px; padding:6px 10px; cursor:pointer; font-size:14px;
      color:var(--text,#e2e8f0); }
    .logout-btn { padding:7px 18px; background:#ef4444; color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }
    .main { padding:24px 28px; }
    .page-sub { color:var(--text3,#64748b); font-size:13px; text-align:center; margin-bottom:20px; }

    /* SLA Summary Cards */
    .sla-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; }
    .sla-card { background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:14px; padding:22px; text-align:center;
      transition:transform 0.2s, box-shadow 0.2s; }
    .sla-card:hover { transform:translateY(-2px);
      box-shadow:0 8px 24px rgba(0,0,0,0.3); }
    .sla-icon { font-size:28px; margin-bottom:8px; }
    .sla-value { font-size:36px; font-weight:800; color:var(--gold,#F0A500); }
    .sla-unit { font-size:14px; font-weight:500; color:var(--text3,#64748b); margin-left:4px; }
    .sla-label { font-size:12px; color:var(--text2,#94a3b8); margin-top:4px; font-weight:600;
      text-transform:uppercase; letter-spacing:0.5px; }
    .sla-sub { font-size:11px; color:var(--text3,#64748b); margin-top:4px; }
    .breach-val { color:#ef4444; }
    .ontime-val { color:#10b981; }

    /* Charts Row  */
    .top-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
    .chart-card { background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:14px; padding:20px; }
    h4 { color:var(--text,#e2e8f0); font-size:14px; font-weight:700; margin-bottom:12px; }
    canvas { max-height:240px; }

    /* Department Performance Table */
    .dept-table-wrap { overflow-x:auto; }
    .dept-table { width:100%; border-collapse:collapse; }
    .dept-table th { padding:10px 12px; font-size:11px; color:var(--gold,#F0A500);
      font-weight:700; text-align:left; text-transform:uppercase;
      border-bottom:1px solid var(--border,rgba(255,255,255,0.08)); }
    .dept-table td { padding:10px 12px; font-size:13px; color:var(--text2,#94a3b8);
      border-bottom:1px solid var(--border2,rgba(255,255,255,0.04)); }
    .dept-name { color:var(--text,#e2e8f0); font-weight:600; }
    .resolved-col { color:var(--teal,#0EA5A0); font-weight:600; }
    .breach-badge { padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;
      background:rgba(16,185,129,0.15); color:#10b981; }
    .breach-badge.breach-danger { background:rgba(239,68,68,0.15); color:#ef4444; }
    .health-dot { font-size:16px; }
    .empty-row { text-align:center; color:var(--text3,#64748b); padding:24px; }

    @media(max-width:900px) {
      .sla-row { grid-template-columns:1fr 1fr; }
      .top-row { grid-template-columns:1fr; }
    }
  `]
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  summary: any = null;
  categories: any = null;
  slaData: any = null;
  monthlyData: any[] = [];
  deptStats: any[] = [];
  total = 0;
  resolutionRate = 0;

  private charts: Chart[] = [];

  constructor(
    private as: AnalyticsService,
    public auth: AuthService,
    public theme: ThemeService,
    public router: Router
  ) {}

  ngOnInit() {
    this.destroyCharts();

    this.as.getSummary().subscribe({
      next: d => {
        this.summary = d;
        this.total = d.total || 0;
        const resolved = (d.resolved || 0) + (d.closed || 0);
        this.resolutionRate = this.total > 0
          ? Math.round((resolved / this.total) * 100) : 0;
        setTimeout(() => this.buildStatusChart(d), 200);
      },
      error: () => {}
    });

    this.as.getCategories().subscribe({
      next: d => {
        this.categories = d;
        setTimeout(() => this.buildZoneChart(d), 200);
      },
      error: () => {}
    });

    this.as.getSlaReport().subscribe({
      next: d => {
        this.slaData = d;
        this.deptStats = d.departments || [];
      },
      error: () => {}
    });

    this.as.getMonthlyReport().subscribe({
      next: d => {
        this.monthlyData = d;
        setTimeout(() => this.buildMonthlyChart(d), 300);
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private destroyCharts() {
    this.charts.forEach(c => { try { c.destroy(); } catch(e) {} });
    this.charts = [];
    ['statusChartCanvas', 'monthlyChartCanvas', 'zoneChartCanvas'].forEach(id => {
      const existing = Chart.getChart(id);
      if (existing) { try { existing.destroy(); } catch(e) {} }
    });
  }

  private buildStatusChart(data: any) {
    const existing = Chart.getChart('statusChartCanvas');
    if (existing) existing.destroy();
    const canvas = document.getElementById('statusChartCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved', 'Reopened', 'Closed'],
        datasets: [{
          data: [data.pending || 0, data.inProgress || 0, data.resolved || 0,
                 data.reopened || 0, data.closed || 0],
          backgroundColor: ['#F59E0B', '#60A5FA', '#10B981', '#6B7280', '#8B5CF6'],
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.1)'
        }]
      },
      options: {
        responsive: true,
        cutout: '55%',
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, padding: 12 } } }
      }
    });
    this.charts.push(chart);
  }

  private buildMonthlyChart(data: any[]) {
    const existing = Chart.getChart('monthlyChartCanvas');
    if (existing) existing.destroy();
    const canvas = document.getElementById('monthlyChartCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const labels = data.map(d => d.label);
    const counts = data.map(d => d.count);
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Complaints Filed',
          data: counts,
          borderColor: '#0EA5A0',
          backgroundColor: 'rgba(14,165,160,0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0EA5A0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#64748b', font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' },
               beginAtZero: true }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildZoneChart(data: any) {
    const existing = Chart.getChart('zoneChartCanvas');
    if (existing) existing.destroy();
    const canvas = document.getElementById('zoneChartCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const cats = Object.keys(data);
    const vals = Object.values(data) as number[];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: cats.map(c => this.getDeptLabel(c)),
        datasets: [{
          label: 'Complaints',
          data: vals,
          backgroundColor: ['#F59E0B','#EF4444','#10B981','#60A5FA','#8B5CF6','#EC4899'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: '#64748b', font: { size: 10 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' },
               beginAtZero: true }
        }
      }
    });
    this.charts.push(chart);
  }

  getDeptLabel(cat: string): string {
    const map: any = {
      WATER: 'Water', ROAD: 'Roads', SANITATION: 'Sanitation',
      ELECTRICITY: 'Electricity', STREET_LIGHT: 'Street Lights',
      DRAINAGE: 'Drainage', OTHER: 'Other'
    };
    return map[cat] || cat;
  }

  goBack() {
    const role = this.auth.getRole();
    if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else if (role === 'OFFICER') this.router.navigate(['/officer/dashboard']);
    else this.router.navigate(['/citizen/dashboard']);
  }
}