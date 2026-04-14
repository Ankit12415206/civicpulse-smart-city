import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api/auth';
  private isBrowser: boolean;
  
  // In-memory cache to prevent storage access race conditions
  private _token: string | null = null;
  private _role: string | null = null;
  private _username: string | null = null;
  private _initialized = false;

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
        this._token = res.token;
        this._role = res.role;
        this._username = res.username;
        this.storageSet('token', res.token);
        this.storageSet('role', res.role);
        this.storageSet('username', res.username);
      })
    );
  }

  logout() {
    this._token = null;
    this._role = null;
    this._username = null;
    this.storageClear();
    this.router.navigate(['/login']);
  }

  initializeAuth(): void {
    // Load auth state from localStorage on app startup
    if (this.isBrowser && !this._initialized) {
      this._token = localStorage.getItem('token');
      this._role = localStorage.getItem('role');
      this._username = localStorage.getItem('username');
      this._initialized = true;
    }
  }

  getToken(): string | null    { 
    if (!this._initialized) this.initializeAuth();
    return this._token || this.storage('token'); 
  }
  
  getRole(): string | null     { 
    if (!this._initialized) this.initializeAuth();
    return this._role || this.storage('role'); 
  }
  
  getUsername(): string | null { 
    if (!this._initialized) this.initializeAuth();
    return this._username || this.storage('username'); 
  }
  
  isLoggedIn(): boolean        { 
    if (!this._initialized) this.initializeAuth();
    return !!this.getToken(); 
  }
}