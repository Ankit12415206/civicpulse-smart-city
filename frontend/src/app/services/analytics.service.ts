import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private API = 'http://localhost:8080/api/admin/analytics';

  constructor(private http: HttpClient) {}

  getSummary() {
    return this.http.get<any>(`${this.API}/summary`);
  }

  getCategories() {
    return this.http.get<any>(`${this.API}/categories`);
  }
}