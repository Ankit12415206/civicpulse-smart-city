import { Component } from '@angular/core';
import { FormBuilder, FormGroup,
         Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-grievance-submit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse</span>
        <button (click)="router.navigate(['/citizen/dashboard'])">
          Dashboard
        </button>
        <button (click)="auth.logout()">Logout</button>
      </div>
      <div class="body">
        <div class="card">
          <h2>Submit a Grievance</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <label>Title *</label>
            <input formControlName="title"
              placeholder="Brief title of the issue"/>

            <label>Category *</label>
            <select formControlName="category">
              <option value="">Select category</option>
              <option value="WATER">Water Supply</option>
              <option value="ROAD">Roads</option>
              <option value="SANITATION">Sanitation</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="STREET_LIGHT">Street Lights</option>
              <option value="OTHER">Other</option>
            </select>

            <label>Location *</label>
            <div class="loc-row">
              <input formControlName="location"
                placeholder="Area or address"/>
              <button type="button" class="gps-btn"
                (click)="detectLocation()">
                Use GPS
              </button>
            </div>

            <label>Description *</label>
            <textarea formControlName="description" rows="4"
              placeholder="Describe the issue in detail">
            </textarea>

            <label>Upload Image (optional)</label>
            <div class="upload-box"
              (click)="fileInput.click()"
              [class.has-file]="selectedFile">
              <input #fileInput type="file"
                accept="image/*"
                style="display:none"
                (change)="onFileSelect($event)"/>
              <span *ngIf="!selectedFile">
                Click to upload an image
              </span>
              <span *ngIf="selectedFile" class="file-name">
                {{ selectedFile.name }}
              </span>
            </div>

            <p class="success" *ngIf="success">{{ success }}</p>
            <p class="err"     *ngIf="error">{{ error }}</p>

            <div class="btns">
              <button type="button"
                (click)="router.navigate(['/citizen/dashboard'])">
                Cancel
              </button>
              <button type="submit"
                [disabled]="form.invalid || loading">
                {{ loading ? 'Submitting...' : 'Submit Complaint' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height:100vh; background:#f0f4f8; }
    .topbar { background:#0d9488; color:#fff; padding:14px 24px;
      display:flex; align-items:center; gap:12px; }
    .brand { flex:1; font-size:18px; font-weight:600; }
    .topbar button { padding:6px 14px; background:#fff; color:#0d9488;
      border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .body { padding:24px; display:flex;
      justify-content:center; }
    .card { background:#fff; padding:36px; border-radius:16px;
      box-shadow:0 4px 24px rgba(0,0,0,0.08);
      width:100%; max-width:560px; }
    h2 { color:#0d9488; margin:0 0 24px; }
    label { display:block; font-size:12px; color:#475569;
      margin-bottom:5px; margin-top:16px; }
    input, select, textarea { width:100%; padding:10px 14px;
      border:1px solid #e2e8f0; border-radius:8px; font-size:14px;
      box-sizing:border-box; font-family:inherit; }
    input:focus, select:focus, textarea:focus
      { outline:none; border-color:#0d9488; }
    .loc-row { display:flex; gap:8px; }
    .loc-row input { flex:1; }
    .gps-btn { padding:10px 14px; background:#f0fdf4;
      color:#0d9488; border:1px solid #0d9488;
      border-radius:8px; cursor:pointer; white-space:nowrap;
      font-size:13px; }
    .upload-box { border:2px dashed #e2e8f0; border-radius:10px;
      padding:24px; text-align:center; cursor:pointer;
      color:#94a3b8; font-size:13px; margin-top:4px;
      transition:border-color 0.2s; }
    .upload-box:hover { border-color:#0d9488; color:#0d9488; }
    .upload-box.has-file { border-color:#0d9488;
      background:#f0fdf4; }
    .file-name { color:#0d9488; font-weight:500; }
    .btns { display:flex; gap:12px; margin-top:24px; }
    button { flex:1; padding:12px; border:none;
      border-radius:8px; font-size:14px; cursor:pointer; }
    button[type=submit] { background:#0d9488; color:#fff; }
    button[type=submit]:disabled
      { background:#94a3b8; cursor:not-allowed; }
    button[type=button] { background:#f1f5f9; color:#475569; }
    .err     { color:#ef4444; font-size:12px; margin-top:8px; }
    .success { color:#10b981; font-size:12px; margin-top:8px; }
  `]
})
export class GrievanceSubmitComponent {
  form: FormGroup;
  selectedFile: File | null = null;
  error = '';
  success = '';
  loading = false;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              public auth: AuthService,
              public router: Router) {
    this.form = this.fb.group({
      title:       ['', Validators.required],
      category:    ['', Validators.required],
      location:    ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  detectLocation() {
    if (!navigator.geolocation) {
      this.error = 'GPS not supported by your browser';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = `${pos.coords.latitude.toFixed(4)},
          ${pos.coords.longitude.toFixed(4)}`;
        this.form.patchValue({ location: coords });
      },
      () => this.error = 'Could not get your location'
    );
  }

  onSubmit() {
    this.error = '';
    this.success = '';
    this.loading = true;

    const fd = new FormData();
    fd.append('title',       this.form.value.title);
    fd.append('description', this.form.value.description);
    fd.append('category',    this.form.value.category);
    fd.append('location',    this.form.value.location);
    if (this.selectedFile) {
      fd.append('image', this.selectedFile);
    }

    this.http.post(
      'http://localhost:8080/api/citizen/grievance/submit', fd
    ).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Grievance submitted successfully!';
        setTimeout(() => {
          this.router.navigate(['/citizen/my-complaints']);
        }, 1500);
      },
      error: () => {
        this.loading = false;
        this.error = 'Submission failed. Please try again.';
      }
    });
  }
}