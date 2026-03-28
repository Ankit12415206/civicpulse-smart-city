import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h1 class="brand">CivicPulse</h1>
        <p class="subtitle">Smart City Portal</p>

        <form [formGroup]="form" (ngSubmit)="onLogin()">
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="you@city.gov"/>
          </div>
          <div class="field">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="••••••••"/>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button type="submit" [disabled]="form.invalid">Login</button>
        </form>
        <p class="link">New here? <a routerLink="/register">Register</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height:100vh; display:flex; align-items:center;
      justify-content:center; background:#f0f4f8; }
    .auth-card { background:#fff; padding:40px; border-radius:16px;
      box-shadow:0 4px 24px rgba(0,0,0,0.08); width:360px; }
    .brand { color:#0d9488; font-size:28px; margin:0; }
    .subtitle { color:#94a3b8; margin:4px 0 24px; }
    .field { margin-bottom:16px; }
    label { display:block; font-size:13px; color:#475569; margin-bottom:6px; }
    input { width:100%; padding:10px 14px; border:1px solid #e2e8f0;
      border-radius:8px; font-size:14px; box-sizing:border-box; }
    button { width:100%; padding:12px; background:#0d9488; color:#fff;
      border:none; border-radius:8px; font-size:15px; cursor:pointer;
      margin-top:8px; }
    button:hover { background:#0f766e; }
    .error { color:#ef4444; font-size:13px; }
    .link { text-align:center; font-size:13px; margin-top:16px; color:#64748b; }
    a { color:#0d9488; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        const role = res.role;
        if (role === 'ADMIN')   this.router.navigate(['/admin/dashboard']);
        else if (role === 'OFFICER') this.router.navigate(['/officer/dashboard']);
        else this.router.navigate(['/citizen/dashboard']);
      },
      error: () => this.error = 'Invalid email or password'
    });
  }
}