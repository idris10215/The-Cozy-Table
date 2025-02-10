import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private usersUrl = 'http://localhost:3000/users'; // Users endpoint
  private reservationsUrl = 'http://localhost:3000/reservations'; // Reservations endpoint
  private orderSummaryUrl = 'http://localhost:3000/orderSummary'; // Order Summary endpoint
  private feedbackUrl = 'http://localhost:3000/feedback'; // Feedback endpoint

  constructor(private http: HttpClient) {}

  /**
   * Fetches user data by email.
   */
  getUserByEmail(email: string): Observable<any> {
    return this.http.get<any[]>(this.usersUrl).pipe(
      map((users) => users.find((user: any) => user.EmailAddress === email))
    );
  }

  /**
   * Fetches all reservations (Admin view).
   */
  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.reservationsUrl);
  }

  /**
   * Fetches reservations filtered by email or userId (Customer view).
   */
  getReservationsByEmailOrUserId(email: string, userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.reservationsUrl}?email=${email}&userId=${userId}`);
  }

  /**
   * Fetches a reservation by its ID.
   */
  getReservationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.reservationsUrl}/${id}`);
  }

  /**
   * Creates a new reservation.
   */
  createReservation(reservation: any): Observable<any> {
    return this.http.post<any>(this.reservationsUrl, reservation);
  }

  /**
   * Updates an existing reservation by its ID.
   */
  updateReservation(id: number, reservation: any): Observable<any> {
    return this.http.put<any>(`${this.reservationsUrl}/${id}`, reservation);
  }

  /**
   * Deletes a reservation by its ID.
   */
  deleteReservationById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reservationsUrl}/${id}`);
  }

  /**
   * Fetches all order summaries.
   */
  getOrderSummary(): Observable<any[]> {
    return this.http.get<any[]>(this.orderSummaryUrl);
  }

  /**
   * Fetches income data by aggregating totals from the order summary.
   */
  getIncomeData(): Observable<any[]> {
    return this.getOrderSummary().pipe(
      map((orders) => {
        const incomeMap: { [date: string]: number } = {};
        orders.forEach((order) => {
          if (incomeMap[order.orderDate]) {
            incomeMap[order.orderDate] += order.total;
          } else {
            incomeMap[order.orderDate] = order.total;
          }
        });

        return Object.keys(incomeMap).map((date) => ({
          date,
          income: incomeMap[date],
        }));
      })
    );
  }

  /**
   * Fetches feedback data.
   */
  getFeedbackData(): Observable<any[]> {
    return this.http.get<any[]>(this.feedbackUrl);
  }
}
