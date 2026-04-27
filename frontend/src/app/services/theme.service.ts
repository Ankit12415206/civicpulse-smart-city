import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _dark = true;

  constructor(@Inject(PLATFORM_ID) private pid: Object) {
    if (isPlatformBrowser(this.pid)) {
      const saved = localStorage.getItem('cptheme');
      this._dark = saved !== 'light';
      this.apply();
    }
  }

  toggle() {
    this._dark = !this._dark;
    if (isPlatformBrowser(this.pid)) {
      localStorage.setItem('cptheme', this._dark ? 'dark' : 'light');
    }
    this.apply();
  }

  isDark() { return this._dark; }

  private apply() {
    if (!isPlatformBrowser(this.pid)) return;
    const t = this._dark ? 'dark' : 'light';
    // Set on BOTH html and body so CSS vars are always available
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
    document.body.style.background = this._dark ? '#0f1923' : '#f0f4f8';
    document.body.style.color = this._dark ? '#e2e8f0' : '#1e293b';
  }
}