import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent, NavItem } from '../../shared/sidebar.component';
import { TopbarComponent } from '../../shared/topbar.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="page-layout">
      <app-sidebar role="ADMIN" homeRoute="/admin/dashboard" [sections]="navSections"></app-sidebar>

      <div class="main-content">
        <app-topbar title="Manage Users" [subtitle]="today" role="ADMIN"></app-topbar>

        <div class="page-content users-page-content">
          <div class="page-header">
            <h1>👥 User Management</h1>
            <p>Review all accounts and remove Citizen or Officer users when needed.</p>
          </div>

          <div *ngIf="error" class="msg-error">{{ error }}</div>
          <div *ngIf="success" class="msg-success">{{ success }}</div>

          <div class="users-stats-grid">
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px;">{{ users.length }}</div>
              <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#f59e0b;">{{ citizensCount }}</div>
              <div class="stat-label">Citizens</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#22c55e;">{{ officersCount }}</div>
              <div class="stat-label">Officers</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="font-size:28px; color:#60a5fa;">{{ adminsCount }}</div>
              <div class="stat-label">Admins</div>
            </div>
          </div>

          <div class="search-row users-search-row">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input [(ngModel)]="searchTerm" placeholder="Search by username or email" (input)="applyFilter()"/>
            </div>
            <select class="filter-select" [(ngModel)]="roleFilter" (change)="applyFilter()">
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="OFFICER">Officer</option>
              <option value="CITIZEN">Citizen</option>
            </select>
          </div>

          <div class="card users-table-card">
            <div *ngIf="filtered.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <h3>No users found</h3>
            </div>

            <div class="users-table-wrap" *ngIf="filtered.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of filtered">
                    <td style="color:#60a5fa; font-weight:700; font-size:12px;">USR-{{ String(u.id).padStart(3,'0') }}</td>
                    <td style="font-weight:600; color:#e2e8f0;">{{ u.username }}</td>
                    <td>{{ u.email }}</td>
                    <td>
                      <span class="badge" [ngClass]="getRoleClass(u.role)">{{ u.role }}</span>
                    </td>
                    <td>
                      <button
                        *ngIf="isDeletableRole(u.role)"
                        (click)="onDelete(u)"
                        [disabled]="deletingUserId === u.id"
                        style="padding:6px 14px; background:#dc2626; border:none; border-radius:6px; color:#fff; font-size:12px; font-weight:600; cursor:pointer;"
                      >
                        {{ deletingUserId === u.id ? 'Deleting...' : 'Delete' }}
                      </button>
                      <span *ngIf="!isDeletableRole(u.role)" style="font-size:12px; color:#64748b;">Protected</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../../styles/shared-layout.scss'],
  styles: [
    ':host { display: block; }',
    '.users-page-content { padding-top: 24px; }',
    '.users-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:20px; padding:0; }',
    '.users-search-row { margin-bottom:16px; }',
    '.users-table-card { overflow: hidden; }',
    '.users-table-wrap { overflow-x: auto; }',
    '@media (max-width: 1200px) { .users-stats-grid { grid-template-columns: repeat(2, 1fr); } }',
    '@media (max-width: 760px) { .users-stats-grid { grid-template-columns: 1fr; } }'
  ]
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  searchTerm = '';
  roleFilter = '';
  deletingUserId: number | null = null;
  error = '';
  success = '';
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  String = String;
  navSections: { label: string; items: NavItem[] }[] = [
    {
      label: 'MANAGEMENT', items: [
        { icon: '🏠', label: 'Dashboard', route: '/admin/dashboard' },
        { icon: '☰', label: 'All Grievances', route: '/admin/grievances' },
        { icon: '👤', label: 'Assign Officers', route: '/admin/grievances' },
        { icon: '👥', label: 'Manage Users', route: '/admin/users', active: true }
      ]
    },
    {
      label: 'ANALYTICS', items: [
        { icon: '📊', label: 'Analytics & Reports', route: '/admin/analytics' }
      ]
    }
  ];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    public router: Router
  ) {}

  get citizensCount(): number {
    return this.users.filter(u => u.role === 'CITIZEN').length;
  }

  get officersCount(): number {
    return this.users.filter(u => u.role === 'OFFICER').length;
  }

  get adminsCount(): number {
    return this.users.filter(u => u.role === 'ADMIN').length;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.error = '';
    this.adminService.getUsers().subscribe({
      next: (response: any) => {
        const users = this.normalizeUsersResponse(response);
        this.users = users;
        this.applyFilter();
        this.navSections[0].items[3].badge = this.users.length;

        if (!Array.isArray(response) && users.length === 0) {
          this.error = 'Users response format is unexpected. Refresh and try again.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        const status = err?.status ? ` (HTTP ${err.status})` : '';
        this.error = `Failed to load users list${status}.`;
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeUsersResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.users)) {
      return response.users;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response?.content)) {
      return response.content;
    }
    return [];
  }

  applyFilter(): void {
    const search = this.searchTerm.trim().toLowerCase();
    this.filtered = this.users.filter(u => {
      const matchesSearch = !search
        || u.username?.toLowerCase().includes(search)
        || u.email?.toLowerCase().includes(search);
      const matchesRole = !this.roleFilter || u.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  isDeletableRole(role: string): boolean {
    return role === 'CITIZEN' || role === 'OFFICER';
  }

  getRoleClass(role: string): string {
    if (role === 'ADMIN') return 'badge-progress';
    if (role === 'OFFICER') return 'badge-resolved';
    return 'badge-pending';
  }

  onDelete(user: any): void {
    if (!this.isDeletableRole(user.role)) {
      return;
    }

    const ok = confirm(`Delete ${user.role.toLowerCase()} account ${user.email}?`);
    if (!ok) {
      return;
    }

    this.error = '';
    this.success = '';
    this.deletingUserId = user.id;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingUserId = null;
        this.success = 'User deleted successfully.';
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilter();
        this.navSections[0].items[3].badge = this.users.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deletingUserId = null;
        this.error = err?.error?.message || 'Failed to delete user.';
        this.cdr.detectChanges();
      }
    });
  }

}
