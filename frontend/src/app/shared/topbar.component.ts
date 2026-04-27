import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="topbar">
      <div class="tb-left">
        <span class="tb-title">{{ title }}</span>
        <span class="tb-sub" *ngIf="subtitle">{{ subtitle }}</span>
      </div>
      <div class="tb-right">
        <div id="google_translate_element" style="margin-right: 10px;"></div>
        <span class="role-tag">{{ role }}</span>
        <button class="theme-icon-btn" (click)="theme.toggle()"
          [title]="theme.isDark() ? 'Switch to Light' : 'Switch to Dark'">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .topbar {
      background: var(--bg-card); border-bottom: 1px solid var(--border);
      padding: 12px 24px; display: flex; align-items: center;
      justify-content: space-between; position: sticky; top: 0; z-index: 40;
    }
    .tb-left { display:flex; flex-direction:column; gap:2px; }
    .tb-title { color:var(--text); font-size:17px; font-weight:700; }
    .tb-sub { color:var(--text3); font-size:12px; }
    .tb-right { display:flex; align-items:center; gap:10px; }
    .role-tag { background:rgba(14,165,160,0.15); color:var(--teal);
      font-size:11px; font-weight:700; padding:3px 12px; border-radius:20px;
      border:1px solid rgba(14,165,160,0.3); }
    .theme-icon-btn { background:transparent;
      border:1px solid var(--border); border-radius:8px;
      padding:5px 9px; cursor:pointer; font-size:16px;
      transition:background 0.15s; }
    .theme-icon-btn:hover { background:var(--bg-hover); }
  `]
})
export class TopbarComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() role = '';
  constructor(public theme: ThemeService, public auth: AuthService, public router: Router) {}
}