import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrievanceService {
  private BASE = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyGrievances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/citizen/grievance/my`);
  }

  getAllGrievances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/admin/grievance/all`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE}/grievance/${id}`);
  }

  updateStatus(id: number, status: string, note: string): Observable<any> {
    return this.http.put(`${this.BASE}/grievance/${id}/status`, { status, note });
  }
}