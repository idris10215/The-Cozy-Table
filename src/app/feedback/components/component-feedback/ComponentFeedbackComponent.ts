import { Component, OnInit } from '@angular/core';
import { Feedback } from '../../models/user.model'; // Import User model
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-component-feedback',
  standalone: true,
  imports: [FormsModule, CommonModule], // Include CommonModule for directives like *ngFor
  templateUrl: './component-feedback.component.html',
  styleUrls: ['./component-feedback.component.css'],
})
export class ComponentFeedbackComponent implements OnInit {
  user: Feedback = new Feedback(); // Initialize 'user' property
  stars = [1, 2, 3, 4, 5]; // Array representing 5 stars
  hoverRatingValue: number = 0; // Temporary hover rating
  event: KeyboardEvent | undefined;
  feedbackExists: boolean = false; // Flag to track if feedback already exists

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Check if the user is logged in and load the user details
    const userId = localStorage.getItem("userId");
    if (userId) {
      this.user.uId = userId;
      this.userService.getUsers().subscribe((users: any[]) => {
        const loggedInUser = users.find(user => user.id === userId);
        if (loggedInUser) {
          this.user.name = loggedInUser.FullName;
          this.user.email = loggedInUser.EmailAddress;
          this.user.phone = loggedInUser.MobileNumber.toString();
          this.user.address = ''; // You can allow them to fill in their address
        }
      });

      // Check if the user has already submitted feedback
      this.userService.getFeedback().subscribe((feedback: any[]) => {
        const existingFeedback = feedback.find((f) => f.uId === userId);
        if (existingFeedback) {
          this.feedbackExists = true;
          this.user = existingFeedback; // Load the existing feedback data
          // Show the alert to the user that they have already submitted feedback
          alert("You have submitted feedback once, and now you can edit or delete it.");
          // Redirect to feedback-list page after clicking OK on the alert
          this.router.navigate(['/feedback-list']);
        }
      });
    } else {
      this.router.navigate(['/login']); // Redirect if no user is logged in
    }
  }

  // Method to handle star rating selection
  setRating(value: number): void {
    this.user.rating = value; // Set rating in the user object
  }

  // Method to handle hover effect for star rating
  hoverRating(value: number): void {
    this.hoverRatingValue = value; // Temporarily set hover rating
  }

  // Method to handle form submission
  onSubmit(form: any): void {
    let isValid = true;

    // Check if the required fields are filled
    if (!this.user.address) {
      alert('Address is required!');
      isValid = false;
    }

    // Skip validation for fields that are already autofilled (name, email, phone)
    if (!this.user.rating) {
      alert('Rating is required!');
      isValid = false;
    }

    // If fields are valid and feedback doesn't already exist, submit the form
    if (isValid && !this.feedbackExists) {
      this.userService.registerUser(this.user).subscribe({
        next: () => {
          alert('Feedback submitted successfully!');
          form.reset();
          // Redirect to user-list page after successful submission
          this.router.navigate(['/feedback-list']);
        },
        error: (err: any) => {
          console.error('Error submitting feedback:', err);
          alert('An error occurred while submitting the feedback.');
        }
      });
    }
  }

  // Method to check if the phone number is valid (10 digits)
  isPhoneNumberValid(phone: string): boolean {
    const phonePattern = /^[0-9]{10}$/; // Regex for 10-digit phone number
    return phonePattern.test(phone); // Returns true if valid, false otherwise
  }

  // Method to check if the email format is valid
  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Regex for valid email format
    return emailPattern.test(email); // Returns true if valid, false otherwise
  }

  // Method to prevent invalid characters in the name field
  validateNameInput(event: KeyboardEvent): void {
    const regex = /^[A-Za-z\s]*$/; // Only allow letters and spaces

    // Get the input value (i.e., what the user is typing)
    const currentValue = event.target as HTMLInputElement;
    const newValue = currentValue.value;

    // If the value is invalid, prevent the input
    if (!regex.test(newValue)) {
      // Block the input if it's not valid
      event.preventDefault();
      alert('Only letters and spaces are allowed in the name!');
    }
  }
}
