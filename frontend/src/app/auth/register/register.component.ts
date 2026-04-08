import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="reg-root">
      <div class="left-panel">
        <div class="brand-block">
          <div class="logo-ring"><span>🏛️</span></div>
          <h1 class="brand">Civic<span class="accent">Pulse</span></h1>
          <p class="tagline">Join thousands improving their city</p>
        </div>
        <div class="info-cards">
          <div class="info-card">
            <span class="info-num">10K+</span>
            <span class="info-lbl">Issues Resolved</span>
          </div>
          <div class="info-card">
            <span class="info-num">50+</span>
            <span class="info-lbl">Departments</span>
          </div>
          <div class="info-card">
            <span class="info-num">95%</span>
            <span class="info-lbl">Satisfaction</span>
          </div>
        </div>
        <button class="theme-btn" (click)="theme.toggle()">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>
      </div>

      <div class="right-panel">
        <div class="form-card">
          <h2>Join Us</h2>
          <p class="sub">Create an account to report civic issues</p>
          <form [formGroup]="form" (ngSubmit)="onRegister()">
            <div class="field-row">
              <div class="field">
                <label>Username</label>
                <input formControlName="username" placeholder="yourname"/>
              </div>
              <div class="field">
                <label>Role</label>
                <select formControlName="role">
                  <option value="CITIZEN">Citizen</option>
                  <option value="OFFICER">Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Email Address</label>
              <input formControlName="email" type="email" placeholder="you@example.com"/>
            </div>
            <div class="field">
              <label>Password</label>
              <input formControlName="password" type="password" placeholder="Min 6 characters"/>
            </div>
            <p class="success" *ngIf="success">{{ success }}</p>
            <p class="err" *ngIf="error">{{ error }}</p>
            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>
          <p class="switch-link">Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reg-root { display:flex; min-height:100vh; }
    .left-panel {
      width:320px; background:linear-gradient(160deg,#0d2137,#0a3d3a 60%,#0f2a1f);
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; padding:40px; gap:28px;
    }
    .brand-block { text-align:center; }
    .logo-ring { width:64px; height:64px; border-radius:50%;
      background:rgba(14,165,160,0.2); border:2px solid #0EA5A0;
      display:flex; align-items:center; justify-content:center;
      margin:0 auto 14px; font-size:24px; }
    .brand { font-size:28px; font-weight:800; color:#e2e8f0; }
    .accent { color:#0EA5A0; }
    .tagline { color:rgba(255,255,255,0.5); font-size:12px; margin-top:4px; }
    .info-cards { display:flex; gap:10px; width:100%; }
    .info-card { flex:1; text-align:center; background:rgba(255,255,255,0.06);
      border-radius:10px; padding:14px 8px; }
    .info-num { display:block; font-size:20px; font-weight:800; color:#0EA5A0; }
    .info-lbl { font-size:10px; color:rgba(255,255,255,0.5); }
    .theme-btn { width:100%; padding:10px; background:rgba(255,255,255,0.08);
      border:1px solid rgba(255,255,255,0.15); border-radius:10px;
      color:rgba(255,255,255,0.7); cursor:pointer; font-size:13px; }
    .theme-btn:hover { background:rgba(255,255,255,0.14); color:#fff; }
    .right-panel { flex:1; display:flex; align-items:center; justify-content:center;
      background:var(--bg-main,#0f1923); padding:40px; }
    .form-card { width:100%; max-width:460px;
      background:var(--bg-card,#162032);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:20px; padding:40px; }
    h2 { color:var(--text,#e2e8f0); font-size:22px; font-weight:700; margin-bottom:4px; }
    .sub { color:var(--text3,#64748b); font-size:13px; margin-bottom:24px; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .field { margin-bottom:16px; }
    label { display:block; font-size:12px; color:var(--text2,#94a3b8); margin-bottom:5px; font-weight:500; }
    input, select { width:100%; padding:11px 14px;
      background:var(--bg-card2,#1a2840);
      border:1px solid var(--border,rgba(255,255,255,0.08));
      border-radius:10px; font-size:14px; color:var(--text,#e2e8f0); outline:none; }
    input::placeholder { color:var(--text3,#64748b); }
    input:focus, select:focus { border-color:#0EA5A0; }
    select option { background:#1a2840; }
    .err { color:#fca5a5; font-size:12px; margin-bottom:10px; }
    .success { color:#6ee7b7; font-size:12px; margin-bottom:10px; }
    .submit-btn { width:100%; padding:13px;
      background:linear-gradient(135deg,#0EA5A0,#0f7a76);
      color:#fff; border:none; border-radius:10px;
      font-size:15px; font-weight:700; cursor:pointer; }
    .submit-btn:disabled { opacity:0.5; }
    .switch-link { text-align:center; margin-top:18px; color:var(--text3,#64748b); font-size:13px; }
    a { color:#0EA5A0; text-decoration:none; font-weight:500; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  error = ''; success = ''; loading = false;

  constructor(private fb: FormBuilder, private auth: AuthService,
    private router: Router, public theme: ThemeService) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CITIZEN']
    });
  }

  onRegister() {
    this.error = ''; this.success = ''; this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => { this.loading = false; this.error = 'Registration failed. Email may already exist.'; }
    });
  }
}
