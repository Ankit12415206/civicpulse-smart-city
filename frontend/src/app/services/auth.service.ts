import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    // Load persisted auth state from localStorage immediately
    const token = localStorage.getItem('civicpulse_token');
    const role = localStorage.getItem('civicpulse_role');
    const username = localStorage.getItem('civicpulse_username');
    
    // If any auth data is missing while token exists, clear all (corrupted state)
    if (token && (!role || !username)) {
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_role');
      localStorage.removeItem('civicpulse_username');
    }
  }

  register(data: any) {
    return this.http.post(`${this.API}/register`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(res => {
        // Ensure we have all required fields before storing
        if (res && res.token && res.role && res.username) {
          localStorage.setItem('civicpulse_token', res.token);
          localStorage.setItem('civicpulse_role', res.role);
          localStorage.setItem('civicpulse_username', res.username);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_role');
    localStorage.removeItem('civicpulse_username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null { 
    return localStorage.getItem('civicpulse_token'); 
  }
  
  getRole(): string | null { 
    return localStorage.getItem('civicpulse_role'); 
  }
  
  getUsername(): string | null { 
    return localStorage.getItem('civicpulse_username'); 
  }
  
  isLoggedIn(): boolean { 
    const token = localStorage.getItem('civicpulse_token');
    const role = localStorage.getItem('civicpulse_role');
    return !!(token && role);
  }
}