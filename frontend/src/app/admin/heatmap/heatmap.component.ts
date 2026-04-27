import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

declare var L: any;

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrap">
      <nav class="topbar">
        <span class="brand-text">Complaint Heatmap</span>
        <div class="nav-links">
          <a class="nav-link" (click)="router.navigate(['/admin/dashboard'])">Dashboard</a>
          <a class="nav-link" (click)="router.navigate(['/admin/analytics'])">Analytics</a>
          <a class="nav-link active">Heatmap</a>
        </div>
        <div class="nav-right">
          <button class="theme-btn" (click)="theme.toggle()">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="auth.logout()">LOGOUT</button>
        </div>
      </nav>

      <div class="main">
        <!-- Filters -->
        <div class="filter-bar">
          <div class="filter-group">
            <label>Category</label>
            <select [(ngModel)]="filterCategory" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option value="WATER">Water</option>
              <option value="ROAD">Road</option>
              <option value="SANITATION">Sanitation</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="STREET_LIGHT">Street Light</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterStatus" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div class="stat-chip">
            📍 {{ filteredData.length }} complaints with GPS
          </div>
        </div>

        <!-- Map Container -->
        <div id="heatmap" class="map-container"></div>

        <div *ngIf="allData.length === 0 && !loading" class="no-data">
          <div style="font-size:48px;margin-bottom:12px">📍</div>
          <h4>No GPS Data Available</h4>
          <p>Citizens need to enable GPS when submitting complaints to populate the heatmap.</p>
        </div>

        <div *ngIf="loading" class="loading">Loading heatmap data...</div>
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
    .main { padding:20px 28px; }

    .filter-bar { display:flex; gap:14px; align-items:flex-end; margin-bottom:16px; flex-wrap:wrap; }
    .filter-group { display:flex; flex-direction:column; gap:4px; }
    .filter-group label { font-size:10px; color:var(--text3,#64748b); text-transform:uppercase;
      font-weight:700; letter-spacing:0.5px; }
    .filter-group select { padding:8px 14px; background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.1));
      border-radius:8px; color:var(--text,#e2e8f0); font-size:13px; outline:none; }
    .stat-chip { padding:8px 16px; background:rgba(14,165,160,0.12);
      color:var(--teal,#0EA5A0); border-radius:20px; font-size:12px;
      font-weight:600; align-self:flex-end; }

    .map-container { width:100%; height:calc(100vh - 200px); min-height:450px;
      border-radius:14px; overflow:hidden;
      border:1px solid var(--border,rgba(255,255,255,0.08)); }

    .no-data, .loading { text-align:center; padding:60px; color:var(--text3,#64748b); }
    .no-data h4 { color:var(--text,#e2e8f0); font-size:18px; margin-bottom:8px; }
    .no-data p { font-size:13px; }
  `]
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: any[] = [];
  filteredData: any[] = [];
  loading = true;
  filterCategory = '';
  filterStatus = '';

  private map: any;
  private markers: any[] = [];

  constructor(
    private http: HttpClient,
    public router: Router,
    public auth: AuthService,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    // Load Leaflet CSS dynamically
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }

  ngAfterViewInit() {
    // Load Leaflet JS dynamically
    if (typeof L === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => this.initMap();
      document.head.appendChild(script);
    } else {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy() {
    if (this.map) { this.map.remove(); }
  }

  private initMap() {
    const mapEl = document.getElementById('heatmap');
    if (!mapEl) return;

    this.map = L.map('heatmap').setView([20.5937, 78.9629], 5); // India center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.loadData();
  }

  private loadData() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/heatmap`).subscribe({
      next: data => {
        this.allData = data;
        this.loading = false;
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredData = this.allData.filter(d => {
      if (this.filterCategory && d.category !== this.filterCategory) return false;
      if (this.filterStatus && d.status !== this.filterStatus) return false;
      return true;
    });
    this.renderMarkers();
  }

  private renderMarkers() {
    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    if (this.filteredData.length === 0) return;

    const bounds: any[] = [];

    this.filteredData.forEach(d => {
      const color = this.getStatusColor(d.status);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([d.latitude, d.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:180px">
            <strong style="font-size:14px">#${d.id} ${d.title}</strong><br>
            <span style="font-size:12px;color:#64748b">
              📂 ${d.category} &nbsp;|&nbsp;
              <span style="color:${color};font-weight:700">${d.status}</span>
            </span>
            ${d.sentimentLabel ? '<br><span style="font-size:11px">🧠 Sentiment: ' + d.sentimentLabel + '</span>' : ''}
          </div>
        `);

      this.markers.push(marker);
      bounds.push([d.latitude, d.longitude]);
    });

    // Fit map to markers
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }

  private getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#F59E0B',
      IN_PROGRESS: '#60A5FA',
      RESOLVED: '#10B981',
      REOPENED: '#EF4444',
      CLOSED: '#8B5CF6'
    };
    return map[status] || '#6B7280';
  }
}
