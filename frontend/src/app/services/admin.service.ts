import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private API = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getAllGrievances() {
    return this.http.get<any[]>(
      'http://localhost:8080/api/admin/grievance/all');
  }

  getOfficers() {
    return this.http.get<any[]>(`${this.API}/officers`);
  }

  getDepartments() {
    return this.http.get<any[]>(`${this.API}/departments`);
  }

  assignOfficer(id: number, officerId: number,
                priority: number, deadlineDays: number, departmentId?: number) {
    const payload: any = { officerId, priority, deadlineDays };
    if (departmentId) {
      payload.departmentId = departmentId;
    }
    return this.http.put(
      `${this.API}/grievance/${id}/assign`,
      payload
    );
  }
}