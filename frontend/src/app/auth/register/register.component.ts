import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="wrapper">
      <div class="card">
        <h1>CivicPulse</h1>
        <p class="sub">Create your account</p>
        <form [formGroup]="form" (ngSubmit)="onRegister()">
          <label>Full Name</label>
          <input formControlName="username" placeholder="Your full name"/>
          <label>Email</label>
          <input formControlName="email" type="email" placeholder="you@city.gov"/>
          <label>Password</label>
          <input formControlName="password" type="password" placeholder="Min 6 characters"/>
          <label>Register as</label>
          <select formControlName="role">
            <option value="CITIZEN">Citizen</option>
            <option value="OFFICER">Department Officer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p class="success" *ngIf="success">{{ success }}</p>
          <p class="err" *ngIf="error">{{ error }}</p>
          <button type="submit" [disabled]="form.invalid">Create Account</button>
        </form>
        <p class="link">Already registered? <a routerLink="/login">Login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .wrapper { min-height:100vh; display:flex; align-items:center;
      justify-content:center; background:#f0f4f8; }
    .card { background:#fff; padding:40px; border-radius:16px;
      box-shadow:0 4px 24px rgba(0,0,0,0.08); width:360px; }
    h1 { color:#0d9488; font-size:26px; margin:0 0 4px; }
    .sub { color:#94a3b8; font-size:13px; margin:0 0 24px; }
    label { display:block; font-size:12px; color:#475569;
      margin-bottom:5px; margin-top:14px; }
    input, select { width:100%; padding:10px 14px; border:1px solid #e2e8f0;
      border-radius:8px; font-size:14px; box-sizing:border-box; background:#fff; }
    input:focus, select:focus { outline:none; border-color:#0d9488; }
    button { width:100%; padding:12px; background:#0d9488; color:#fff;
      border:none; border-radius:8px; font-size:15px; cursor:pointer; margin-top:20px; }
    button:hover:not(:disabled) { background:#0f766e; }
    button:disabled { background:#94a3b8; cursor:not-allowed; }
    .err { color:#ef4444; font-size:12px; margin-top:8px; }
    .success { color:#10b981; font-size:12px; margin-top:8px; }
    .link { text-align:center; font-size:13px; margin-top:16px; color:#64748b; }
    a { color:#0d9488; text-decoration:none; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  error = '';
  success = '';

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['CITIZEN', Validators.required]
    });
  }

  onRegister() {
    this.error = '';
    this.success = '';
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success = 'Account created! Taking you to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => this.error = 'Registration failed. Email may already exist.'
    });
  }
}