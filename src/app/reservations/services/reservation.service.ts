import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/reservations';
  private usersApiUrl = 'http://localhost:3000/users';  // Add the users API endpoint

  constructor(private http: HttpClient) { }

  // Fetch all reservations (for Admin)
  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  // Fetch reservations filtered by email or userId (for Customer)
  getReservationsByEmailOrUserId(email: string, userId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?email=${email}&userId=${userId}`);
  }

  // Fetch a specific reservation by ID
  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  // Create a new reservation
  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  // Update an existing reservation
  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  // Delete a reservation by ID
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Fetch all reservations (for Admin, similar to getAllReservations)
  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }
}
