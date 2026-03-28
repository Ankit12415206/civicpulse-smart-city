import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="topbar">
        <span class="brand">CivicPulse</span>
        <button (click)="router.navigate(['/citizen/my-complaints'])">
          Back
        </button>
      </div>
      <div class="body">
        <div class="card">
          <h2>Rate this Resolution</h2>
          <p class="sub">How satisfied are you with how your complaint was handled?</p>
          <div class="stars">
            <span *ngFor="let s of [1,2,3,4,5]"
                  (click)="rating = s"
                  [class.filled]="s <= rating">★</span>
          </div>
          <label>Comment (optional)</label>
          <textarea [(ngModel)]="comment" rows="4"
            placeholder="Share your experience..."></textarea>
          <p class="success" *ngIf="success">{{ success }}</p>
          <div class="btns">
            <button class="reopen" (click)="reopen()">
              Not Satisfied — Reopen
            </button>
            <button class="submit" (click)="onSubmit()">
              Submit Rating
            </button>
          </div>
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
      border:none; border-radius:6px; cursor:pointer; }
    .body { padding:24px; display:flex; justify-content:center; }
    .card { background:#fff; padding:32px; border-radius:16px;
      width:100%; max-width:480px;
      box-shadow:0 2px 12px rgba(0,0,0,0.08); }
    h2 { color:#0d9488; margin:0 0 8px; }
    .sub { color:#94a3b8; font-size:13px; margin-bottom:24px; }
    .stars { display:flex; gap:8px; margin-bottom:20px; }
    .stars span { font-size:36px; cursor:pointer; color:#e2e8f0;
      transition:color 0.1s; }
    .stars span.filled { color:#f59e0b; }
    label { display:block; font-size:12px; color:#475569;
      margin-bottom:5px; }
    textarea { width:100%; padding:10px 14px; border:1px solid #e2e8f0;
      border-radius:8px; font-size:14px; box-sizing:border-box;
      font-family:inherit; }
    .btns { display:flex; gap:12px; margin-top:20px; }
    button { flex:1; padding:12px; border:none; border-radius:8px;
      font-size:14px; cursor:pointer; }
    .submit { background:#0d9488; color:#fff; }
    .reopen { background:#fee2e2; color:#991b1b; }
    .success { color:#10b981; font-size:12px; margin-top:8px; }
  `]
})
export class FeedbackComponent {
  rating = 0;
  comment = '';
  success = '';
  grievanceId: number;

  constructor(private route: ActivatedRoute,
              private fs: FeedbackService,
              public router: Router) {
    this.grievanceId = Number(this.route.snapshot.paramMap.get('id'));
  }

  onSubmit() {
    this.fs.submitFeedback(this.grievanceId, this.rating, this.comment)
      .subscribe(() => {
        this.success = 'Thank you for your feedback!';
        setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1500);
      });
  }

  reopen() {
    this.fs.reopen(this.grievanceId).subscribe(() => {
      this.success = 'Grievance reopened successfully.';
      setTimeout(() => this.router.navigate(['/citizen/my-complaints']), 1500);
    });
  }
}