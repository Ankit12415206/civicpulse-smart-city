import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GrievanceService {
  private API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  submit(formData: FormData) {
    return this.http.post(
      `${this.API}/citizen/grievance/submit`, formData);
  }

  getMyGrievances() {
    return this.http.get<any[]>(
      `${this.API}/citizen/grievance/my`);
  }

  getAllGrievances() {
    return this.http.get<any[]>(
      `${this.API}/admin/grievance/all`);
  }

  getById(id: number) {
    return this.http.get<any>(
      `${this.API}/grievance/${id}`);
  }

  updateStatus(id: number, status: string, note: string) {
    return this.http.put(
      `${this.API}/grievance/${id}/status`, { status, note });
  }
}