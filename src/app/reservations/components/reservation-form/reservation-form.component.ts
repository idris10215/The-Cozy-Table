import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
})
export class ReservationFormComponent implements OnInit {
  reservation: Reservation = {
    name: '',
    email: '',
    date: '',
    time: '',
    phone: '',
    requests: '',
    tableType: '',
    guests: 1,
  };
  isEditMode = false;
  maxTables: number = 100;
  availableTables: number = 0;
  reservations: Reservation[] = [];
  phoneNumberError: string = '';
  timeDisplay: string = '';
  timeOptions: string[] = []; // Added for dropdown

  constructor(
    private reservationService: ReservationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.generateTimeOptions(); // Initialize dropdown options
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.reservationService.getReservation(id).subscribe((reservation) => {
        this.reservation = reservation;
        this.timeDisplay = this.convertTo12Hour(reservation.time);
      });
    } else {
      const defaultTime = new Date().toTimeString().substring(0, 5);
      this.timeDisplay = this.convertTo12Hour(defaultTime);
      this.reservation.time = defaultTime;
    }
    
    const loggedInEmail = localStorage.getItem('userEmail');
    if (loggedInEmail) {
      this.reservation.email = loggedInEmail;
    }
    this.loadReservations();
  }

  private generateTimeOptions(): void {
    const times = [];
    for (let hour = 10; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 22 && minute > 0) break;
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(this.convertTo12Hour(time24));
      }
    }
    this.timeOptions = [...new Set(times)];
  }

  private convertTo24Hour(time12h: string): string {
    const regex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i;
    const match = time12h.match(regex);
    if (!match) return '';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  private convertTo12Hour(time24h: string): string {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hourNum = parseInt(hours);
    
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const twelveHour = hourNum % 12 || 12;
    
    return `${twelveHour}:${minutes} ${period}`;
  }

  onTimeChange(newTime: string): void {
    this.timeDisplay = newTime;
    this.reservation.time = this.convertTo24Hour(newTime);
  }

  // ALL EXISTING CODE BELOW REMAINS UNCHANGED
  loadReservations(): void {
    this.reservationService.getReservations().subscribe((reservations) => {
      this.reservations = reservations;
      this.calculateAvailableTables();
    });
  }

  calculateAvailableTables(): void {
    const selectedDate = this.getFormattedDate(this.reservation.date);
    const reservedTables = this.reservations
      .filter((r) => r.date === selectedDate && r.id !== this.reservation.id)
      .reduce((sum, r) => sum + r.guests, 0);

    const currentReservationGuests = this.isEditMode
      ? this.reservations.find((r) => r.id === this.reservation.id)?.guests || 0
      : 0;

    this.availableTables = this.maxTables - reservedTables + currentReservationGuests;
  }

  validateTables(): boolean {
    const selectedDate = this.getFormattedDate(this.reservation.date);
    const reservedTables = this.reservations
      .filter((r) => r.date === selectedDate && r.id !== this.reservation.id)
      .reduce((sum, r) => sum + r.guests, 0);

    const currentReservationGuests = this.isEditMode
      ? this.reservations.find((r) => r.id === this.reservation.id)?.guests || 0
      : 0;

    const totalTablesAfterUpdate =
      reservedTables + this.reservation.guests - currentReservationGuests;

    if (totalTablesAfterUpdate > this.maxTables) {
      alert('😐 Oops! All tables are fully reserved for the selected date. Please try another day.');
      return false;
    }
    return true;
  }

  private hasRepeatedDigits(phone: string): boolean {
    return new Set(phone.split('')).size === 1;
  }

  private isConsecutiveSequence(phone: string): boolean {
    const digits = phone.split('').map(Number);
    let increasing = true;
    let decreasing = true;
    
    for (let i = 1; i < digits.length; i++) {
      increasing = increasing && (digits[i] === digits[i-1] + 1);
      decreasing = decreasing && (digits[i] === digits[i-1] - 1);
    }
    
    return increasing || decreasing;
  }

  validatePhoneSequence(): void {
    this.phoneNumberError = '';
    const phone = this.reservation.phone || '';
    
    if (phone.length !== 10) return;

    if (this.hasRepeatedDigits(phone)) {
      this.phoneNumberError = 'All digits cannot be the same';
    } else if (this.isConsecutiveSequence(phone)) {
      this.phoneNumberError = 'Sequential numbers are not allowed';
    }
  }

  isPhoneValid(): boolean {
    const phone = this.reservation.phone || '';
    if (!/^[6-9][0-9]{9}$/.test(phone)) return false;
    return !this.hasRepeatedDigits(phone) && !this.isConsecutiveSequence(phone);
  }

  isFormValid(): boolean {
    return (
      this.isNameValid() &&
      this.isEmailValid() &&
      this.isPhoneValid() &&
      this.isDateValid() &&
      this.isTimeValid() &&
      this.reservation.guests >= 1 &&
      this.reservation.guests <= 20
    );
  }

  isNameValid(): boolean {
    return /^[A-Za-z ]+$/.test(this.reservation.name || '');
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.reservation.email || '');
  }

  isDateValid(): boolean {
    const today = new Date();
    const selectedDate = new Date(this.reservation.date);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    return selectedDate >= today && selectedDate <= maxDate;
  }

  isTimeValid(): boolean {
    const [hours, minutes] = this.reservation.time.split(':').map(Number);
    return (
      (hours >= 10 && hours < 22) ||
      (hours === 22 && minutes === 0) ||
      (hours === 10 && minutes === 0)
    );
  }

  getFormattedDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('🙄 Please ensure all fields are correctly filled.');
      return;
    }

    if (!this.validateTables()) {
      return;
    }

    if (this.isEditMode) {
      this.reservationService
        .updateReservation(this.reservation.id!, this.reservation)
        .subscribe(() => {
          alert('🤩 Your reservation has been successfully updated.');
          this.router.navigate(['/reservation-list']);
        });
    } else {
      this.reservationService
        .createReservation(this.reservation)
        .subscribe(() => {
          alert('🎉Thank you! Your reservation has been successfully made.😊');
          this.router.navigate(['/reservation-list']);
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/reservation-list']);
  }
}