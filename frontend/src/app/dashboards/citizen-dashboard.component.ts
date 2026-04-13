import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from 'src/app/services/websocket.service';
import { Subscription } from 'rxjs';

const API = 'http://localhost:8080/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = {};
  role: string = '';
  activeNav: string = 'overview';
  topbarTitle: string = 'Dashboard';
  todayDate: string = '';
  navSections: any[] = [];

  // ── WEBSOCKET ──────────────────────────────────────────────────────────────
  private wsSubscription: Subscription | null = null;
  private wsNewSubscription: Subscription | null = null;
  liveToast: string = '';

  // ── GRIEVANCE STATE ────────────────────────────────────────────────────────
  grievances: any[] = [];

  // ── SUBMIT FORM ────────────────────────────────────────────────────────────
  submitForm = {
    title: '', category: '', priority: 'MEDIUM',
    location: '', landmark: '', desc: ''
  };
  uploadedPhotos: { file: File; dataUrl: string }[] = [];
  submitSuccess = false;
  submitLoading = false;

  // ── MY GRIEVANCES ──────────────────────────────────────────────────────────
  mgSearch = '';
  mgStatusFilter = 'all';
  expandedCard: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private wsService: WebSocketService
  ) {}

  ngOnInit() {
    const token   = localStorage.getItem('civicpulse_token');
    const userStr = localStorage.getItem('civicpulse_user');
    if (!token || !userStr) { this.router.navigate(['/']); return; }

    this.user = JSON.parse(userStr);
    this.role = this.user.role;
    document.body.className = 'role-' + this.role.toLowerCase();

    this.todayDate = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    this.buildNav();
    this.profileForm.fullName = this.user?.fullName  || this.user?.username || '';
    this.profileForm.username = this.user?.username  || '';
    this.profileForm.email    = this.user?.email     || '';
    this.profileForm.phone    = this.user?.phone     || '';

    // Load grievances from backend
    this.loadGrievances();

    // Connect WebSocket
    const username = this.user?.username || '';
    this.wsService.connect(username);

    // Listen for status updates (officer resolved → citizen sees it)
    this.wsSubscription = this.wsService.grievanceUpdate$.subscribe((update: any) => {
      const found = this.grievances.find(
        g => g.dbId === update.grievanceId || g.dbId === Number(update.grievanceId)
      );
      if (found) {
        found.status = this.mapStatus(update.newStatus);
        // also update notifications
        this.notifications.unshift({
          id: Date.now(),
          type: 'status',
          read: false,
          icon: update.newStatus === 'RESOLVED' ? '✅' : '🔄',
          title: update.newStatus === 'RESOLVED' ? 'Issue resolved!' : 'Grievance status updated',
          desc: `"${update.title}" is now ${this.mapStatus(update.newStatus)}.`,
          time: 'Just now',
          category: 'status'
        });
      }
      this.liveToast = `"${update.title}" → ${this.mapStatus(update.newStatus)}`;
      setTimeout(() => this.liveToast = '', 4000);
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
    this.wsNewSubscription?.unsubscribe();
    this.wsService.disconnect();
  }

  // ── LOAD GRIEVANCES FROM BACKEND ───────────────────────────────────────────
  loadGrievances() {
    const username = this.user?.username;
    this.http.get<any[]>(`${API}/grievances/user/${username}`).subscribe({
      next: data => {
        this.grievances = data.map(g => this.mapGrievance(g));
        this.syncProfileHistory();
        this.syncAnalytics();
      },
      error: () => {
        // fallback to demo data if backend not reachable
        this.grievances = [
          { dbId: 1, id: 'GRV-001', icon: '💧', title: 'Water supply interrupted – Block C',  category: 'Water Supply', location: 'Block C, Sector 4',   priority: 'HIGH',   status: 'In Progress', date: '09 Mar 2026', desc: 'Water supply has been cut off since 3 days.', photos: [] },
          { dbId: 2, id: 'GRV-002', icon: '💡', title: 'Street light not working – MG Road',  category: 'Electricity',  location: 'MG Road, Junction 2', priority: 'MEDIUM', status: 'Pending',     date: '06 Mar 2026', desc: 'Three street lights not working for 2 weeks.', photos: [] },
          { dbId: 3, id: 'GRV-003', icon: '🛣️', title: 'Pothole near school entrance',        category: 'Roads',        location: 'School Rd, Gate 1',   priority: 'HIGH',   status: 'Resolved',    date: '03 Mar 2026', desc: 'Large pothole at entrance of Government School.', photos: [] },
        ];
      }
    });
  }

  // ── MAP BACKEND GRIEVANCE → UI FORMAT ──────────────────────────────────────
  mapGrievance(g: any): any {
    const iconMap: any = {
      'Water Supply': '💧', 'Electricity': '💡', 'Roads': '🛣️',
      'Sanitation': '🗑️', 'Drainage': '🌊', 'Parks': '🌳',
      'Noise': '🔊', 'Other': '📌'
    };
    return {
      dbId:     g.id,
      id:       'GRV-' + String(g.id).padStart(3, '0'),
      icon:     iconMap[g.category] || '📌',
      title:    g.title,
      category: g.category || 'Other',
      location: g.zone || '',
      landmark: '',
      priority: g.priority || 'MEDIUM',
      status:   this.mapStatus(g.status),
      date:     new Date(g.submittedAt || g.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                }),
      desc:     g.description || '',
      photos:   []
    };
  }

  // ── MAP BACKEND STATUS → DISPLAY STATUS ───────────────────────────────────
  mapStatus(status: string): string {
    const map: any = {
      'PENDING':     'Pending',
      'IN_PROGRESS': 'In Progress',
      'RESOLVED':    'Resolved',
      // pass-through if already mapped
      'Pending':     'Pending',
      'In Progress': 'In Progress',
      'Resolved':    'Resolved'
    };
    return map[status] || status;
  }

  // ── MAP DISPLAY STATUS → BACKEND STATUS ───────────────────────────────────
  mapStatusToBackend(status: string): string {
    const map: any = {
      'Pending':     'PENDING',
      'In Progress': 'IN_PROGRESS',
      'Resolved':    'RESOLVED'
    };
    return map[status] || status;
  }

  // ── BUILD SIDEBAR NAV ──────────────────────────────────────────────────────
  buildNav() {
    const NAV: any = {
      CITIZEN: [
        { section: 'Main', items: [
          { id: 'overview',      label: 'Overview',           badge: null },
          { id: 'submit',        label: 'Submit Grievance',   badge: null },
          { id: 'myissues',      label: 'My Grievances',      badge: null },
          { id: 'analytics',     label: 'Analytics',          badge: null },
        ]},
        { section: 'Account', items: [
          { id: 'feedback',      label: 'Feedback & Ratings', badge: null },
          { id: 'profile',       label: 'My Profile',         badge: null },
          { id: 'notifications', label: 'Notifications',      badge: this.unreadCount > 0 ? String(this.unreadCount) : null },
        ]},
      ],
      ADMIN: [
        { section: 'Management', items: [
          { id: 'overview',  label: 'Dashboard',       badge: null },
          { id: 'allissues', label: 'All Grievances',  badge: null },
          { id: 'assign',    label: 'Assign Officers', badge: null },
          { id: 'users',     label: 'Manage Users',    badge: null },
        ]},
        { section: 'Analytics', items: [
          { id: 'reports',  label: 'SLA Reports',     badge: null },
          { id: 'settings', label: 'System Settings', badge: null },
        ]},
      ],
      OFFICER: [
        { section: 'Work', items: [
          { id: 'overview',   label: 'Overview',       badge: null },
          { id: 'assigned',   label: 'Assigned Tasks', badge: null },
          { id: 'inprogress', label: 'In Progress',    badge: null },
          { id: 'completed',  label: 'Completed',      badge: null },
          { id: 'analytics',  label: 'Analytics',      badge: null },
        ]},
        { section: 'Info', items: [
          { id: 'profile', label: 'My Profile', badge: null },
        ]},
      ],
    };
    this.navSections = NAV[this.role] || NAV['CITIZEN'];
  }

  navigateTo(id: string, label: string) {
    this.activeNav   = id;
    this.topbarTitle = label;
    this.submitSuccess = false;
  }

  logout() {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
    this.wsService.disconnect();
    this.router.navigate(['/']);
  }

  getUserInitial(): string {
    return this.user?.username?.[0]?.toUpperCase() || '?';
  }

  // ── SUBMIT GRIEVANCE ───────────────────────────────────────────────────────
  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const remaining = 3 - this.uploadedPhotos.length;
    const files = Array.from(input.files).slice(0, remaining);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedPhotos.push({ file, dataUrl: e.target!.result as string });
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
  }

  getCategoryIcon(cat: string): string {
    const icons: any = {
      'Water Supply': '💧', 'Electricity': '💡', 'Roads': '🛣️',
      'Sanitation': '🗑️', 'Drainage': '🌊', 'Parks': '🌳',
      'Noise': '🔊', 'Other': '📌'
    };
    return icons[cat] || '📌';
  }

  submitGrievance() {
    const f = this.submitForm;
    if (!f.title || !f.category || !f.location || !f.desc) return;

    const catMap: any = {
      'water': 'Water Supply', 'electricity': 'Electricity', 'roads': 'Roads',
      'sanitation': 'Sanitation', 'drainage': 'Drainage',
      'parks': 'Parks', 'noise': 'Noise', 'other': 'Other'
    };

    const payload = {
      title:           f.title,
      description:     f.desc,
      category:        catMap[f.category] || 'Other',
      zone:            f.location,
      priority:        f.priority,
      citizenUsername: this.user.username,
      status:          'PENDING'
    };

    this.submitLoading = true;

    this.http.post<any>(`${API}/grievances`, payload).subscribe({
      next: saved => {
        this.submitLoading = false;
        const mapped = this.mapGrievance(saved);
        mapped.photos = this.uploadedPhotos.map(p => p.dataUrl);
        this.grievances.unshift(mapped);
        this.syncAnalytics();

        // Add notification
        this.notifications.unshift({
          id: Date.now(), type: 'system', read: false, icon: '📝',
          title: 'Grievance submitted',
          desc: `Your grievance "${f.title}" has been submitted and is pending review.`,
          time: 'Just now', category: 'status'
        });

        this.submitForm   = { title: '', category: '', priority: 'MEDIUM', location: '', landmark: '', desc: '' };
        this.uploadedPhotos = [];
        this.submitSuccess  = true;
        setTimeout(() => this.navigateTo('myissues', 'My Grievances'), 1800);
      },
      error: () => {
        // fallback: add locally if backend unavailable
        this.submitLoading = false;
        const newId  = 'GRV-' + String(this.grievances.length + 1).padStart(3, '0');
        const today  = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        this.grievances.unshift({
          dbId: null, id: newId,
          icon:     this.getCategoryIcon(catMap[f.category] || 'Other'),
          title:    f.title,
          category: catMap[f.category] || 'Other',
          location: f.location,
          landmark: f.landmark,
          priority: f.priority,
          status:   'Pending',
          date:     today,
          desc:     f.desc,
          photos:   this.uploadedPhotos.map(p => p.dataUrl),
        });
        this.submitForm   = { title: '', category: '', priority: 'MEDIUM', location: '', landmark: '', desc: '' };
        this.uploadedPhotos = [];
        this.submitSuccess  = true;
        setTimeout(() => this.navigateTo('myissues', 'My Grievances'), 1800);
      }
    });
  }

  clearSubmitForm() {
    this.submitForm     = { title: '', category: '', priority: 'MEDIUM', location: '', landmark: '', desc: '' };
    this.uploadedPhotos = [];
    this.submitSuccess  = false;
  }

  // ── MY GRIEVANCES ──────────────────────────────────────────────────────────
  get filteredGrievances() {
    return this.grievances.filter(g => {
      const matchSearch = !this.mgSearch ||
        g.title.toLowerCase().includes(this.mgSearch.toLowerCase()) ||
        g.category.toLowerCase().includes(this.mgSearch.toLowerCase());
      const matchStatus = this.mgStatusFilter === 'all' || g.status === this.mgStatusFilter;
      return matchSearch && matchStatus;
    });
  }

  get pendingCount()    { return this.grievances.filter(g => g.status === 'Pending').length; }
  get inProgressCount() { return this.grievances.filter(g => g.status === 'In Progress').length; }
  get resolvedCount()   { return this.grievances.filter(g => g.status === 'Resolved').length; }

  toggleCard(id: string) {
    this.expandedCard = this.expandedCard === id ? null : id;
  }

  withdrawGrievance(id: string) {
    this.grievances = this.grievances.filter(g => g.id !== id);
    if (this.expandedCard === id) this.expandedCard = null;
  }

  getBadgeClass(status: string): string {
    if (status === 'Pending')     return 'badge-pending';
    if (status === 'In Progress') return 'badge-progress';
    return 'badge-resolved';
  }

  getPriorityColor(p: string): string {
    if (p === 'HIGH')   return '#f87171';
    if (p === 'MEDIUM') return '#fbbf24';
    return '#34d399';
  }

  // ── ANALYTICS DATA (derived from real grievances) ──────────────────────────
  analytics = {
    summary: { total: 0, resolved: 0, pending: 0, inProgress: 0, slaPercent: 0 },
    categories: [
      { name: 'Water Supply', count: 0, color: '#3b7ff5', glow: 'rgba(59,127,245,0.35)' },
      { name: 'Electricity',  count: 0, color: '#f87171', glow: 'rgba(248,113,113,0.35)' },
      { name: 'Roads',        count: 0, color: '#fbbf24', glow: 'rgba(251,191,36,0.35)'  },
      { name: 'Drainage',     count: 0, color: '#34d399', glow: 'rgba(52,211,153,0.35)'  },
      { name: 'Sanitation',   count: 0, color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
      { name: 'Noise',        count: 0, color: '#f472b6', glow: 'rgba(244,114,182,0.35)' },
      { name: 'Parks',        count: 0, color: '#4ade80', glow: 'rgba(74,222,128,0.35)'  },
    ],
    zones: [
      { name: 'Zone A', count: 2 }, { name: 'Zone B', count: 2 },
      { name: 'Zone C', count: 1 }, { name: 'Zone D', count: 4 },
      { name: 'Zone E', count: 1 }, { name: 'Zone G', count: 2 },
    ],
    sla: [
      { category: 'Sanitation',   total: 1, resolved: 1, pct: 100 },
      { category: 'Water Supply', total: 3, resolved: 1, pct: 33  },
      { category: 'Electricity',  total: 2, resolved: 1, pct: 50  },
      { category: 'Roads',        total: 2, resolved: 0, pct: 0   },
      { category: 'Drainage',     total: 2, resolved: 0, pct: 0   },
      { category: 'Noise',        total: 1, resolved: 1, pct: 100 },
      { category: 'Parks',        total: 1, resolved: 1, pct: 100 },
    ],
    trend: {
      months:   ['Jan', 'Feb', 'Mar'],
      filed:    [3, 5, 4],
      resolved: [0, 2, 3],
    }
  };

  zoneSearch = '';

  syncAnalytics() {
    const total    = this.grievances.length;
    const resolved = this.grievances.filter(g => g.status === 'Resolved').length;
    const pending  = this.grievances.filter(g => g.status === 'Pending').length;
    const inProg   = this.grievances.filter(g => g.status === 'In Progress').length;

    this.analytics.summary = {
      total,
      resolved,
      pending,
      inProgress: inProg,
      slaPercent: total ? Math.round((resolved / total) * 100) : 0
    };

    this.analytics.categories.forEach(cat => {
      cat.count = this.grievances.filter(g => g.category === cat.name).length;
    });
  }

  get analyticsTotal(): number {
    return this.analytics.categories.reduce((a, c) => a + c.count, 0) || 1;
  }

  get filteredZones() {
    return this.analytics.zones.filter(z =>
      z.name.toLowerCase().includes(this.zoneSearch.toLowerCase())
    );
  }

  get zoneMax(): number {
    return Math.max(...this.analytics.zones.map(z => z.count), 1);
  }

  getZonePct(count: number): string {
    const total = this.analytics.zones.reduce((a, z) => a + z.count, 0) || 1;
    return (count / total * 100).toFixed(0);
  }

  getZoneStyle(count: number): { bg: string; border: string; color: string; glow: string } {
    const intensity = count / this.zoneMax;
    if (intensity > 0.65) return { bg: 'linear-gradient(135deg,rgba(239,68,68,0.28),rgba(239,68,68,0.15))', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', glow: '0 4px 20px rgba(239,68,68,0.25)' };
    if (intensity > 0.35) return { bg: 'linear-gradient(135deg,rgba(245,158,11,0.22),rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24', glow: '0 4px 20px rgba(245,158,11,0.2)' };
    return               { bg: 'linear-gradient(135deg,rgba(26,86,219,0.22),rgba(26,86,219,0.1))',   border: '1px solid rgba(26,86,219,0.35)',    color: '#3b7ff5', glow: '0 4px 16px rgba(26,86,219,0.2)' };
  }

  getZoneIntensityPct(count: number): number {
    return Math.round((count / this.zoneMax) * 100);
  }

  getSlaColor(pct: number): string {
    if (pct >= 90) return '#34d399';
    if (pct >= 70) return '#fbbf24';
    return '#f87171';
  }

  getSlaLabel(pct: number): string {
    if (pct >= 90) return 'On Track';
    if (pct >= 70) return 'At Risk';
    return 'Breach';
  }

  getSlaColor2(pct: number): string {
    if (pct >= 90) return 'rgba(52,211,153,0.12)';
    if (pct >= 70) return 'rgba(251,191,36,0.12)';
    return 'rgba(248,113,113,0.12)';
  }

  get donutArcs(): { dashArray: string; dashOffset: string; color: string; glow: string }[] {
    const CIRCUMFERENCE = 2 * Math.PI * 52;
    let offset = 0;
    return this.analytics.categories.map(cat => {
      const pct  = cat.count / this.analyticsTotal;
      const dash = pct * CIRCUMFERENCE;
      const gap  = CIRCUMFERENCE - dash;
      const arc  = { dashArray: `${dash.toFixed(2)} ${gap.toFixed(2)}`, dashOffset: `${(-offset).toFixed(2)}`, color: cat.color, glow: cat.glow };
      offset += dash;
      return arc;
    });
  }

  get trendChart() {
    const { months, filed, resolved } = this.analytics.trend;
    const W = 100, H = 80, PAD = 8;
    const tMax = Math.max(...filed, ...resolved, 1);
    const n    = Math.max(months.length - 1, 1);
    const toX  = (i: number) => PAD + (i / n) * (W - PAD * 2);
    const toY  = (v: number) => (H - PAD) - ((v / tMax) * (H - PAD * 2));
    const fPts = filed.map((v, i)    => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const rPts = resolved.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const fArea = `${toX(0)},${H - PAD} ${fPts} ${toX(filed.length - 1)},${H - PAD}`;
    const rArea = `${toX(0)},${H - PAD} ${rPts} ${toX(resolved.length - 1)},${H - PAD}`;
    return {
      months, filed, resolved, fPts, rPts, fArea, rArea,
      points: months.map((m, i) => ({ m, x: toX(i), y_f: toY(filed[i]), y_r: toY(resolved[i]), f: filed[i], r: resolved[i] }))
    };
  }

  asEl(target: EventTarget | null): HTMLElement { return target as HTMLElement; }

  // ── FEEDBACK & RATINGS ─────────────────────────────────────────────────────
  feedbackList: any[] = [
    { id: 'FB-001', grievanceId: 'GRV-003', grievanceTitle: 'Pothole near school entrance', rating: 5, comment: 'Issue was resolved very quickly! Great work by the team.', date: '05 Mar 2026', officer: 'Ravi Kumar', helpful: true },
    { id: 'FB-002', grievanceId: 'GRV-002', grievanceTitle: 'Street light not working – MG Road', rating: 3, comment: 'Still waiting for full resolution but at least acknowledged.', date: '08 Mar 2026', officer: 'Pending Assignment', helpful: false },
  ];

  feedbackForm = { grievanceId: '', rating: 0, comment: '', anonymous: false };
  feedbackHoverRating = 0;
  feedbackSuccess = false;

  get resolvedGrievances() { return this.grievances.filter(g => g.status === 'Resolved'); }

  get avgRating(): string {
    if (!this.feedbackList.length) return '0.0';
    const sum = this.feedbackList.reduce((a, f) => a + f.rating, 0);
    return (sum / this.feedbackList.length).toFixed(1);
  }

  get ratingDistribution(): { star: number; count: number; pct: number }[] {
    return [5, 4, 3, 2, 1].map(star => {
      const count = this.feedbackList.filter(f => f.rating === star).length;
      const pct   = this.feedbackList.length ? Math.round((count / this.feedbackList.length) * 100) : 0;
      return { star, count, pct };
    });
  }

  setFeedbackRating(r: number)  { this.feedbackForm.rating = r; }
  hoverFeedbackRating(r: number) { this.feedbackHoverRating = r; }
  clearFeedbackHover()           { this.feedbackHoverRating = 0; }

  getStars(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'full' : 'empty');
  }

  getRatingColor(r: number): string {
    if (r >= 4) return '#34d399';
    if (r >= 3) return '#fbbf24';
    return '#f87171';
  }

  submitFeedback() {
    const f = this.feedbackForm;
    if (!f.grievanceId || !f.rating || !f.comment.trim()) return;
    const grievance = this.grievances.find(g => g.id === f.grievanceId);
    this.feedbackList.unshift({
      id: 'FB-' + String(this.feedbackList.length + 1).padStart(3, '0'),
      grievanceId:    f.grievanceId,
      grievanceTitle: grievance?.title || f.grievanceId,
      rating:         f.rating,
      comment:        f.comment,
      date:           new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      officer:        grievance?.officer || 'Municipal Officer',
      helpful:        f.rating >= 4
    });
    this.feedbackForm    = { grievanceId: '', rating: 0, comment: '', anonymous: false };
    this.feedbackSuccess = true;
    setTimeout(() => this.feedbackSuccess = false, 3000);
  }

  clearFeedbackForm() {
    this.feedbackForm    = { grievanceId: '', rating: 0, comment: '', anonymous: false };
    this.feedbackHoverRating = 0;
    this.feedbackSuccess = false;
  }

  getAvgRatingStars(): string[] { return this.getStars(Math.round(+this.avgRating)); }

  getHelpfulPct(): string {
    if (!this.feedbackList.length) return '0';
    return (this.feedbackList.filter(f => f.helpful).length / this.feedbackList.length * 100).toFixed(0);
  }

  getFeedbackLabel(rating: number): string {
    return ['', 'Poor', 'Fair', 'Okay', 'Good', 'Excellent!'][rating] || '';
  }

  getActiveRating(hover: number, selected: number): number { return hover || selected; }

  // ── PROFILE ────────────────────────────────────────────────────────────────
  profileForm = { fullName: '', username: '', email: '', phone: '', ward: 'Ward 12, Sector B' };
  profileEditMode    = false;
  profileSaveSuccess = false;
  profileOriginal: any = {};

  pwdForm = { current: '', newPwd: '', confirm: '' };

  profileHistory: any[] = [];

  syncProfileHistory() {
    this.profileHistory = this.grievances.slice(0, 4).map(g => ({
      title:  g.title,
      cat:    g.category,
      date:   g.date,
      status: g.status,
      badge:  this.getBadgeClass(g.status)
    }));
  }

  toggleProfileEdit() {
    this.profileOriginal = { ...this.profileForm };
    this.profileEditMode = true;
  }

  cancelProfileEdit() {
    this.profileForm    = { ...this.profileOriginal };
    this.profileEditMode = false;
  }

  saveProfile() {
    this.profileEditMode   = false;
    this.profileSaveSuccess = true;
    setTimeout(() => this.profileSaveSuccess = false, 3000);
  }

  changePassword() {
    if (!this.pwdForm.current || !this.pwdForm.newPwd || !this.pwdForm.confirm) return;
    if (this.pwdForm.newPwd.length < 8) return;
    if (this.pwdForm.newPwd !== this.pwdForm.confirm) return;
    this.pwdForm = { current: '', newPwd: '', confirm: '' };
  }

  getProfileInitial(): string {
    return this.profileForm.fullName?.[0]?.toUpperCase()
      || this.user?.username?.[0]?.toUpperCase() || '?';
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  notifications: any[] = [
    { id: 1, type: 'status', read: false, icon: '🔄', title: 'Grievance status updated',      desc: 'Your issue "Water supply interrupted – Block C" has been moved to In Progress.',          time: '2 hrs ago',  category: 'status' },
    { id: 2, type: 'status', read: false, icon: '✅', title: 'Issue resolved!',                desc: '"Pothole near school entrance" has been marked as Resolved by the officer.',              time: '1 day ago',  category: 'status' },
    { id: 3, type: 'system', read: false, icon: '📢', title: 'Scheduled maintenance notice',   desc: 'Water supply will be interrupted on 13 Mar 2026 from 9AM–2PM for pipeline maintenance.', time: '2 days ago', category: 'system' },
    { id: 4, type: 'assign', read: true,  icon: '👷', title: 'Officer assigned to your issue', desc: 'Officer Ramesh Kumar has been assigned to "Street light not working – MG Road".',        time: '3 days ago', category: 'assign' },
    { id: 5, type: 'system', read: true,  icon: '🎉', title: 'Welcome to CivicPulse!',          desc: 'Your account is active. You can now submit grievances and track their resolution.',       time: '5 days ago', category: 'system' },
  ];

  notifFilter: string = 'all';

  get filteredNotifications() {
    return this.notifFilter === 'all'
      ? this.notifications
      : this.notifications.filter(n => n.category === this.notifFilter);
  }

  get unreadCount(): number { return this.notifications.filter(n => !n.read).length; }

  setNotifFilter(f: string)  { this.notifFilter = f; }
  markRead(id: number)       { const n = this.notifications.find(n => n.id === id); if (n) n.read = true; }
  markAllRead()              { this.notifications.forEach(n => n.read = true); }
  deleteNotif(id: number)    { this.notifications = this.notifications.filter(n => n.id !== id); }
  clearAllNotifs()           { this.notifications = []; }
}