import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reservation-list.component.html',
  styleUrls: ['./reservation-list.component.css'],
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
  searchQuery: string = '';
  email: string | null = null;
  userRole: string | null = null;
  userId: string | null = null;
  isLoading = true;
  
  // Sorting properties
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('userEmail');
    this.userRole = localStorage.getItem('userRole');
    this.userId = localStorage.getItem('userId');

    if (this.email && this.userRole) {
      this.loadReservations();
    } else {
      alert('You are not logged in. Please log in to view reservations.');
    }
  }

  loadReservations(): void {
    this.isLoading = true;
    const reservations$ = this.userRole === 'Admin'
      ? this.reservationService.getAllReservations()
      : this.reservationService.getReservationsByEmailOrUserId(this.email!, this.userId!);

    reservations$.pipe(
      tap(reservations => {
        this.reservations = reservations;
        this.segmentReservations();
      }),
      catchError(error => {
        console.error('Error loading reservations:', error);
        alert('Failed to load reservations. Please try again later.');
        return of([]);
      }),
      tap(() => (this.isLoading = false))
    ).subscribe();
  }

  private segmentReservations(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingReservations = this.sortReservations(
      this.reservations.filter(r => new Date(r.date) >= today)
    );
    
    this.pastReservations = this.sortReservations(
      this.reservations.filter(r => new Date(r.date) < today)
    );
  }

  private sortReservations(reservations: Reservation[]): Reservation[] {
    return [...reservations].sort((a, b) => {
      let valueA: any, valueB: any;

      switch (this.sortBy) {
        case 'date':
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case 'time':
          const [aHours, aMinutes] = a.time.split(':').map(Number);
          const [bHours, bMinutes] = b.time.split(':').map(Number);
          valueA = aHours * 60 + aMinutes;
          valueB = bHours * 60 + bMinutes;
          break;
        case 'guests':
          valueA = a.guests;
          valueB = b.guests;
          break;
        case 'phone':
          valueA = parseInt(a.phone.replace(/\D/g, ''), 10);
          valueB = parseInt(b.phone.replace(/\D/g, ''), 10);
          break;
        default:
          valueA = a[this.sortBy as keyof Reservation];
          valueB = b[this.sortBy as keyof Reservation];
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }

      return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }

  onSortChange(): void {
    this.segmentReservations();
    this.filterReservations();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }
filterReservations(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.reservations.filter(reservation =>
      Object.values(reservation).some(value =>
        value?.toString().toLowerCase().includes(query)
      )
    );
    
    this.upcomingReservations = this.sortReservations(
      filtered.filter(r => new Date(r.date) >= new Date())
    );
    
    this.pastReservations = this.sortReservations(
      filtered.filter(r => new Date(r.date) < new Date())
    );
  }

  deleteReservation(id?: number): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservationService.deleteReservation(id).pipe(
        catchError(error => {
          console.error('Error deleting reservation:', error);
          alert('Failed to delete reservation. Please try again later.');
          return of(null);
        })
      ).subscribe(() => this.loadReservations());
    }
  }
}