import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/users'; // Base API URL

  constructor(private http: HttpClient) {}

  // Method to send a PATCH request
  updateUser(userId: string, updatedData: any): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.patch(url, updatedData);
  }
}
