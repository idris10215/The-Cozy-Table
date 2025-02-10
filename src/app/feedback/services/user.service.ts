import { Injectable } from '@angular/core';
import { Feedback } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 
  
  private apiUrl = 'http://localhost:3000/users'; // Replace with your JSON server URL
  private feedbackUrl = 'http://localhost:3000/feedback'; 
  userService: any;
  
  errorMessage: string | undefined;

  constructor(private http: HttpClient) {}

  // Register a new user
  registerUser(user: Feedback): Observable<any> {
    return this.http.post(this.feedbackUrl, user).pipe(
      catchError(error => {
        console.error('Error occurred while registering user:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }
  getFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.feedbackUrl);
  }

  // Fetch all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error occurred while fetching users:', error);
        return throwError(() => new Error('Failed to load users.'));
      })
    );
  }
  deleteFeedback(uId: string): Observable<void> {
    return this.http.delete<void>(`${this.feedbackUrl}/${uId}`).pipe(
      catchError((error) => {
        console.error("Error occurred while deleting feedback:", error);
        return throwError(() => new Error("Failed to delete the feedback."));
      })
    );
  }
  
  updateFeedback(uId: string, feedback: Partial<Feedback>): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.feedbackUrl}/${uId}`, feedback).pipe(
      catchError((error) => {
        console.error("Error occurred while updating feedback:", error);
        return throwError(() => new Error("Failed to update feedback."));
      })
    );
  }
 

  
  sendReply(uId: string, replyMessage: string): Observable<any> {
    const reply = { message: replyMessage, timestamp: new Date().toLocaleString() };
  
    // Fetch user, update replies, and persist the change
    return this.http.get<Feedback>(`${this.feedbackUrl}/${uId}`).pipe(
      switchMap((feedback) => {
        const updatedReplies = [...(feedback.replies || []), reply];
        return this.http.patch(`${this.feedbackUrl}/${uId}`, { replies: updatedReplies });
      }),
      catchError((error) => {
        console.error('Error sending reply:', error);
        return throwError(() => new Error('Failed to send reply.'));
      })
    );
  }
  
  
  checkEmailExistence(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => users.length > 0),
      catchError(error => {
        console.error('Error checking email existence:', error);
        return throwError(() => new Error('Failed to check email existence.'));
      })
    );
  }
  
  
 
  
  

}
