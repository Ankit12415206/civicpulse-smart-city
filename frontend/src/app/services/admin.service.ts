import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getAllGrievances() {
    return this.http.get<any[]>(`${this.API}/grievance/all`);
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  assignOfficer(id: number, officerId: number, priority: number, deadlineDays: number) {
    return this.http.put(`${this.API}/grievance/${id}/assign`, {
      officerId, priority, deadlineDays
    });
  }
}