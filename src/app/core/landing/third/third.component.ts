import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-third',
  standalone: true,
  templateUrl: './third.component.html',
  styleUrls: ['./third.component.css'],
  imports: [CommonModule],
})
export class ThirdComponent implements OnInit {
  images: string[] = [
    'assets/images/badge 1.jpg',
    'assets/images/badge 2.png',
    'assets/images/badge 3.jpeg',
    'assets/images/badge 4.jpeg',
    'assets/images/badge 5.jpeg',
    'assets/images/badge 6.jpg',
    'assets/images/badge 7.jpg',
    'assets/images/badge 8.jpeg',
    'assets/images/badge 9.jpeg',
    
  ];
  isNewsletterSubmitted: boolean = false; // Flag to track newsletter submission
  newsletterEmail: string = ''; // Email for newsletter subscription
  isSubmitted: boolean = false;
  currentIndex: number = 0;
  fiveStarFeedback: any[] = []; // Store 5-star feedback

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFiveStarFeedback();
  }

  // Function to get 5-star reviews from JSON server
  getFiveStarFeedback(): void {
    this.http.get<any[]>('http://localhost:3000/feedback') // Use actual server URL
      .subscribe(data => {
        this.fiveStarFeedback = data.filter(item => item.rating === 5);
      });
  }
  

  scrollLeft() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  scrollRight() {
    if (this.currentIndex < this.images.length - 3) { // Adjust '3' to the number of visible images
      this.currentIndex++;
    }
  }

  onNewsletterSubmit() {
    // Regular expression for email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!this.newsletterEmail) {
      alert('Please enter an email address');
      return;
    }

    if (!emailPattern.test(this.newsletterEmail)) {
      alert('Please enter a valid email address\nExample: example@domain.com');
      return;
    }

    // If email is valid
    alert('Thank you for subscribing to our newsletter!');
    this.newsletterEmail = '';
  }
}

