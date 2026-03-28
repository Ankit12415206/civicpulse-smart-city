import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api/auth';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private storage(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  private storageSet(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  private storageClear(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
  }

  register(data: any) {
    return this.http.post(`${this.API}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => {
        this.storageSet('token', res.token);
        this.storageSet('role', res.role);
        this.storageSet('username', res.username);
      })
    );
  }

  logout() {
    this.storageClear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null    { return this.storage('token'); }
  getRole(): string | null     { return this.storage('role'); }
  getUsername(): string | null { return this.storage('username'); }
  isLoggedIn(): boolean        { return !!this.getToken(); }
}