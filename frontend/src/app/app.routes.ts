import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login',
    loadComponent: () => import('./auth/login/login.component')
      .then(m => m.LoginComponent) },

  { path: 'register',
    loadComponent: () => import('./auth/register/register.component')
      .then(m => m.RegisterComponent) },

  { path: 'citizen/dashboard',
    canActivate: [authGuard, roleGuard], data: { roles: ['CITIZEN'] },
    loadComponent: () => import('./dashboards/citizen-dashboard.component')
      .then(m => m.CitizenDashboardComponent) },

  { path: 'citizen/submit',
    canActivate: [authGuard, roleGuard], data: { roles: ['CITIZEN'] },
    loadComponent: () => import('./grievance/submit/grievance-submit.component')
      .then(m => m.GrievanceSubmitComponent) },

  { path: 'citizen/my-complaints',
    canActivate: [authGuard, roleGuard], data: { roles: ['CITIZEN'] },
    loadComponent: () => import('./grievance/my-complaints/my-complaints.component')
      .then(m => m.MyComplaintsComponent) },

  { path: 'citizen/feedback/:id',
    canActivate: [authGuard, roleGuard], data: { roles: ['CITIZEN'] },
    loadComponent: () => import('./feedback/feedback.component')
      .then(m => m.FeedbackComponent) },

  { path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./dashboards/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent) },

  { path: 'admin/grievances',
    canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./admin/grievance-list/grievance-list.component')
      .then(m => m.GrievanceListComponent) },

  { path: 'admin/assign/:id',
    canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./admin/assign-officer/assign-officer.component')
      .then(m => m.AssignOfficerComponent) },

  { path: 'admin/analytics',
    canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] },
    loadComponent: () => import('./analytics/analytics.component')
      .then(m => m.AnalyticsComponent) },

  { path: 'officer/dashboard',
    canActivate: [authGuard, roleGuard], data: { roles: ['OFFICER'] },
    loadComponent: () => import('./dashboards/officer-dashboard.component')
      .then(m => m.OfficerDashboardComponent) },

  { path: 'officer/assigned',
    canActivate: [authGuard, roleGuard], data: { roles: ['OFFICER'] },
    loadComponent: () => import('./officer/assigned/assigned.component')
      .then(m => m.AssignedComponent) },

  { path: 'officer/resolve/:id',
    canActivate: [authGuard, roleGuard], data: { roles: ['OFFICER'] },
    loadComponent: () => import('./officer/resolve/resolve.component')
      .then(m => m.ResolveComponent) }
];