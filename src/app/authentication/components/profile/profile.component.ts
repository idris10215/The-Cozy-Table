import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userId: string | null = '';
  apiUrl = 'http://localhost:3000/users'; // API endpoint to update user data

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router, private profileService: ProfileService) {}

  ngOnInit(): void {
    // Get the user ID from localStorage
    this.userId = localStorage.getItem('userId');
    
    // Initialize the form with FullName and EmailAddress from localStorage
    this.profileForm = this.formBuilder.group({
      FullName: [localStorage.getItem('userName') || '', Validators.required], // Fallback to empty string if not found
      EmailAddress: [localStorage.getItem('userEmail') || '', [Validators.required, Validators.email]], // Fallback to empty string
      MobileNumber:[localStorage.getItem('userMobile') || '', [Validators.required]],
    });
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      console.log('Form is invalid');
      return; // Don't proceed if the form is invalid
    }
  
    const updatedUser = {
      FullName: this.profileForm.value.FullName,
      EmailAddress: this.profileForm.value.EmailAddress,
      MobileNumber: this.profileForm.value.MobileNumber,
    };
  
    if (this.userId) {
      this.profileService.updateUser(this.userId, updatedUser).subscribe(
        (response) => {
          console.log('Profile updated:', response);
          // Update localStorage with the new values
          localStorage.setItem('userName', this.profileForm.value.FullName);
          localStorage.setItem('userEmail', this.profileForm.value.EmailAddress);
          localStorage.setItem('userMobile', this.profileForm.value.MobileNumber);
  
          alert('Profile updated successfully!');
          // Redirect to the customer dashboard
          this.router.navigate(['/customer-dashboard']);
        },
        (error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        }
      );
    } else {
      console.error('User ID is not available.');
      alert('User ID is missing. Unable to update profile.');
    }
  }
  
  
  goBack(): void {
    this.router.navigate(['/customer-dashboard']);
  }
  
}
