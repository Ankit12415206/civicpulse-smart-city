import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-grievance-submit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="gradient-page">

      <div class="topbar glass-card2">
        <div class="brand">
          <span class="civic">Civic</span><span class="pulse">Pulse</span>
        </div>

        <div class="nav-links">
          <a class="nav-link" (click)="router.navigate(['/citizen/dashboard'])">Dashboard</a>
          <a class="nav-link active">Submit Grievance</a>
          <a class="nav-link" (click)="router.navigate(['/citizen/my-complaints'])">My Grievances</a>
        </div>

        <div style="display:flex;gap:8px;align-items:center">
          <button class="theme-icon-btn" (click)="theme.toggle()">
            {{ theme.isDark() ? '☀️' : '🌙' }}
          </button>
          <button class="logout-btn" (click)="auth.logout()">LOGOUT</button>
        </div>
      </div>

      <div class="main">
        <div class="form-card glass-card">
          <h2 class="title">File a <span class="hl">New Grievance</span></h2>
          <p class="sub">Your report helps us build a better city.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="field">
              <label>Title</label>
              <input formControlName="title" placeholder="Brief title..."/>
            </div>

            <div class="row2">
              <div class="field">
                <label>Category</label>
                <select formControlName="category">
                  <option value="WATER">Water</option>
                  <option value="ROAD">Road</option>
                  <option value="SANITATION">Sanitation</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="STREET_LIGHT">Street Light</option>
                  <option value="DRAINAGE">Drainage</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div class="field">
                <label>Location</label>
                <div class="loc-row">
                  <input formControlName="location" placeholder="Area, Landmark or Street"/>
                  <button type="button" class="detect-btn" (click)="detectGPS()">📍 Detect</button>
                </div>
              </div>
            </div>

            <div class="field">
              <label>Description</label>
              <textarea formControlName="description" rows="4"
                placeholder="Describe the issue in detail..."></textarea>
            </div>

            <div class="field">
              <label>Evidence Image (Optional)</label>
              <div class="upload-zone" (click)="fileInput.click()" [class.has-file]="selectedFile">
                <input #fileInput type="file" accept="image/*"
                  style="display:none" (change)="onFile($event)"/>
                <span *ngIf="!selectedFile">Click to upload image</span>

                <div *ngIf="selectedFile" class="file-preview">
                  <img [src]="preview" alt="preview"/>
                  <span>{{ selectedFile.name }}</span>
                </div>
              </div>
            </div>

            <p class="err" *ngIf="error">{{ error }}</p>
            <p class="success" *ngIf="success">{{ success }}</p>

            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              {{ loading ? 'Submitting...' : 'Submit Grievance Pulse' }}
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .topbar { display:flex; align-items:center; padding:14px 28px;
      border-radius:0; position:sticky; top:0; z-index:100; }
    .brand { font-size:20px; font-weight:700; margin-right:28px; }
    .civic { color:var(--text); } .pulse { color:var(--amber); }
    .nav-links { display:flex; gap:22px; flex:1; }
    .nav-link { color:var(--text3); font-size:14px; cursor:pointer;
      padding:6px 0; border-bottom:2px solid transparent; }
    .nav-link.active, .nav-link:hover { color:var(--text); border-bottom-color:var(--amber); }

    .theme-icon-btn {
      background: transparent;
      border: 1px solid var(--border, rgba(255,255,255,0.08));
      border-radius: 8px;
      padding: 6px 9px;
      cursor: pointer;
      font-size: 15px;
      color: var(--text, #e2e8f0);
    }

    .logout-btn { padding:7px 18px; background:var(--red); color:#fff;
      border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; }

    .main { display:flex; justify-content:center; padding:32px 16px; }
    .form-card { padding:40px; width:100%; max-width:640px; }

    .title { color:var(--text); font-size:26px; font-weight:700; margin-bottom:6px; }
    .hl { color:var(--amber); }
    .sub { color:var(--text3); font-size:13px; margin-bottom:28px; }

    .field { margin-bottom:18px; }
    label { display:block; font-size:12px; color:var(--text2); margin-bottom:6px; font-weight:500; }

    input, select, textarea {
      width:100%; padding:12px 16px;
      background:rgba(255,255,255,0.08);
      border:1px solid var(--border);
      border-radius:10px;
      font-size:14px;
      color:var(--text);
      outline:none;
      font-family:inherit;
    }

    input::placeholder, textarea::placeholder { color:var(--text3); }
    input:focus, select:focus, textarea:focus { border-color:var(--amber); }
    select option { background:#2a1040; color:#fff; }

    .row2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .loc-row { display:flex; gap:8px; }
    .loc-row input { flex:1; }

    .detect-btn {
      padding:12px 14px;
      background:rgba(245,158,11,0.2);
      color:var(--amber);
      border:1px solid var(--amber);
      border-radius:10px;
      cursor:pointer;
      white-space:nowrap;
      font-size:13px;
    }

    .upload-zone {
      border:2px dashed var(--border);
      border-radius:12px;
      padding:32px;
      text-align:center;
      cursor:pointer;
      color:var(--text3);
      transition:all 0.2s;
    }

    .upload-zone:hover { border-color:var(--amber); color:var(--amber); }
    .upload-zone.has-file { border-color:var(--green); }

    .file-preview { display:flex; flex-direction:column; align-items:center; gap:8px; }
    .file-preview img { max-height:120px; border-radius:8px; }
    .file-preview span { font-size:12px; color:var(--green); }

    .submit-btn {
      width:100%;
      padding:14px;
      background:var(--amber);
      color:#1a0a00;
      border:none;
      border-radius:10px;
      font-size:16px;
      font-weight:700;
      cursor:pointer;
      margin-top:8px;
    }

    .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

    .err { color:#FCA5A5; font-size:12px; margin-bottom:8px; }
    .success { color:#6EE7B7; font-size:12px; margin-bottom:8px; }
  `]
})
export class GrievanceSubmitComponent {

  form: FormGroup;
  selectedFile: File | null = null;
  preview = '';
  error = '';
  success = '';
  loading = false;

  // GPS for Heatmap
  lat: number | null = null;
  lng: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public auth: AuthService,
    public router: Router,
    public theme: ThemeService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      category: ['OTHER', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFile(e: any) {
    const f = e.target.files[0];
    if (f) {
      this.selectedFile = f;
      const reader = new FileReader();
      reader.onload = (ev: any) => this.preview = ev.target.result;
      reader.readAsDataURL(f);
    }
  }

  detectGPS() {
    if (!navigator.geolocation) {
      this.error = 'GPS not supported';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      p => {
        this.lat = p.coords.latitude;
        this.lng = p.coords.longitude;
        this.form.patchValue({
          location: `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`
        });
      },
      () => this.error = 'Could not detect location'
    );
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const fd = new FormData();
    fd.append('title', this.form.value.title);
    fd.append('description', this.form.value.description);
    fd.append('category', this.form.value.category);
    fd.append('location', this.form.value.location);

    if (this.lat && this.lng) {
      fd.append('latitude', this.lat.toString());
      fd.append('longitude', this.lng.toString());
    }

    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.http.post(`${environment.apiUrl}/citizen/grievance/submit`, fd)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Grievance submitted successfully!';
          setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1500);
        },
        error: () => {
          this.loading = false;
          this.error = 'Submission failed. Try again.';
        }
      });
  }
}