import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OfficerService {
  private API = `${environment.apiUrl}/officer`;

  constructor(private http: HttpClient) { }

  getAssigned() {
    return this.http.get<any[]>(`${this.API}/assigned`);
  }

  resolve(id: number, status: string, note: string) {
    return this.http.put(`${this.API}/grievance/${id}/resolve`,
      { status, note });
  }
}