import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private API = `${environment.apiUrl}/admin/analytics`;

  constructor(private http: HttpClient) { }

  getSummary() {
    return this.http.get<any>(`${this.API}/summary`);
  }

  getCategories() {
    return this.http.get<any>(`${this.API}/categories`);
  }

  getSlaReport() {
    return this.http.get<any>(`${this.API}/sla`);
  }

  getMonthlyReport() {
    return this.http.get<any[]>(`${this.API}/monthly`);
  }
}