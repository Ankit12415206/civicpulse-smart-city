import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="login-root">
      <!-- Left panel -->
      <div class="left-panel">
        <div class="brand-block">
          <div class="logo-ring">
            <span class="logo-icon">🏛️</span>
          </div>
          <h1 class="brand">Civic<span class="accent">Pulse</span></h1>
          <p class="tagline">Smart City Grievance Portal</p>
        </div>
        <div class="features">
          <div class="feat"><span class="feat-icon">✅</span><span>Submit complaints easily</span></div>
          <div class="feat"><span class="feat-icon">📊</span><span>Track real-time status</span></div>
          <div class="feat"><span class="feat-icon">🔔</span><span>Get resolution updates</span></div>
          <div class="feat"><span class="feat-icon">⭐</span><span>Rate the service</span></div>
        </div>
        <div class="theme-row">
          <button class="theme-toggle-btn" (click)="theme.toggle()"
            [title]="theme.isDark() ? 'Switch to Light' : 'Switch to Dark'">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>

      <!-- Right panel -->
      <div class="right-panel">
        <div class="form-card">
          <h2>Welcome Back</h2>
          <p class="sub">Sign in to your account</p>
          <form [formGroup]="form" (ngSubmit)="onLogin()">
            <div class="field">
              <label>Email Address</label>
              <input formControlName="email" type="email" placeholder="you@example.com"/>
            </div>
            <div class="field">
              <label>Password</label>
              <input formControlName="password" type="password" placeholder="••••••••"/>
            </div>
            <p class="err" *ngIf="error">{{ error }}</p>
            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
          <p class="switch-link">New to CivicPulse? <a routerLink="/register">Create account</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-root { display:flex; min-height:100vh; }

    .left-panel {
      width:380px; min-height:100vh;
      background: linear-gradient(160deg, #0d2137 0%, #0a3d3a 60%, #0f2a1f 100%);
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; padding:40px; gap:32px;
    }
    .brand-block { text-align:center; }
    .logo-ring {
      width:72px; height:72px; border-radius:50%;
      background:rgba(14,165,160,0.2); border:2px solid var(--teal,#0EA5A0);
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 16px; font-size:28px;
    }
    .brand { font-size:32px; font-weight:800; color:#e2e8f0; }
    .accent { color:#0EA5A0; }
    .tagline { color:rgba(255,255,255,0.5); font-size:13px; margin-top:6px; }

    .features { width:100%; display:flex; flex-direction:column; gap:12px; }
    .feat { display:flex; align-items:center; gap:12px;
      padding:12px 16px; background:rgba(255,255,255,0.05);
      border-radius:10px; color:rgba(255,255,255,0.7); font-size:13px; }
    .feat-icon { font-size:16px; }

    .theme-row { width:100%; }
    .theme-toggle-btn {
      width:100%; padding:10px; background:rgba(255,255,255,0.08);
      border:1px solid rgba(255,255,255,0.15); border-radius:10px;
      color:rgba(255,255,255,0.7); cursor:pointer; font-size:13px;
      transition:all 0.2s;
    }
    .theme-toggle-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }

    .right-panel {
      flex:1; display:flex; align-items:center; justify-content:center;
      background:var(--bg-main,#0f1923); padding:40px;
    }
    .form-card {
      width:100%; max-width:420px;
      background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:20px; padding:40px;
      box-shadow:0 8px 40px rgba(0,0,0,0.3);
    }
    h2 { color:var(--text,#e2e8f0); font-size:24px; font-weight:700; margin-bottom:6px; }
    .sub { color:var(--text3,#64748b); font-size:13px; margin-bottom:28px; }

    .field { margin-bottom:18px; }
    label { display:block; font-size:12px; color:var(--text2,#94a3b8);
      margin-bottom:6px; font-weight:500; }
    input {
      width:100%; padding:12px 16px;
      background:var(--bg-card2,#1a2840);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:10px; font-size:14px; color:var(--text,#e2e8f0); outline:none;
    }
    input::placeholder { color:var(--text3,#64748b); }
    input:focus { border-color:var(--teal,#0EA5A0); }

    .err { color:#fca5a5; font-size:12px; margin-bottom:12px; }
    .submit-btn {
      width:100%; padding:13px;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      color:#fff; border:none; border-radius:10px;
      font-size:15px; font-weight:700; cursor:pointer;
      transition:opacity 0.2s; margin-top:4px;
    }
    .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .submit-btn:hover:not(:disabled) { opacity:0.9; }

    .switch-link { text-align:center; margin-top:20px;
      color:var(--text3,#64748b); font-size:13px; }
    a { color:var(--teal,#0EA5A0); text-decoration:none; font-weight:500; }
    a:hover { text-decoration:underline; }

    @media(max-width:768px) {
      .login-root { flex-direction:column; }
      .left-panel { width:100%; min-height:auto; padding:32px; }
    }
  `]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService,
    @Inject(PLATFORM_ID) private pid: Object
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.pid)) {
      document.body.setAttribute('data-theme', this.theme.isDark() ? 'dark' : 'light');
    }
  }

  onLogin() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (res.role === 'OFFICER') this.router.navigate(['/officer/dashboard']);
        else this.router.navigate(['/citizen/dashboard']);
      },
      error: () => { this.loading = false; this.error = 'Invalid email or password.'; }
    });
  }
}
