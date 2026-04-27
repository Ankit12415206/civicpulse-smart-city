import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {
  constructor(
    private theme: ThemeService,
    @Inject(PLATFORM_ID) private pid: Object
  ) {
    // Apply theme immediately in constructor — before any view renders
    if (isPlatformBrowser(this.pid)) {
      const t = localStorage.getItem('cptheme') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
      document.body.setAttribute('data-theme', t);
      document.body.style.background = t === 'dark' ? '#0f1923' : '#f0f4f8';
      document.body.style.color = t === 'dark' ? '#e2e8f0' : '#1e293b';
    }
  }
}