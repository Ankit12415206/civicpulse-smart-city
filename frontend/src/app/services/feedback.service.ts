import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private API = `${environment.apiUrl}/citizen/feedback`;

  constructor(private http: HttpClient) { }

  submitFeedback(grievanceId: number, rating: number, comment: string) {
    return this.http.post(`${this.API}/submit`,
      { grievanceId, rating, comment });
  }

  reopen(grievanceId: number) {
    return this.http.put(`${this.API}/reopen/${grievanceId}`, {});
  }
}