import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CartService } from '../../orders/services/cart.service';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent {

  goToCart(): void {
    // Navigate to the cart page using the router
    this.router.navigate(['/cart']);
  }
  
  showMenu: boolean = false;
  isHeaderShrunk: boolean = false;
  userName: string | null = '';
  userEmail: string | null = '';
  userMobile: number | null = null;  // Initialize as null instead of an empty string
  userRole: string | null = '';
  userInitials: string | null = '';
  isNewsletterSubmitted: boolean = false; // Flag to track newsletter submission
  newsletterEmail: string = ''; // Email for newsletter subscription
  isSubmitted: boolean = false;
  cartItemCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    // Retrieve values from localStorage and handle missing or invalid data
    if (typeof window !== 'undefined' && window.localStorage !== null) {
      this.userName = localStorage.getItem('userName') || 'Guest';
      this.userEmail = localStorage.getItem('userEmail') || 'guest@example.com';
  
      const storedMobile = localStorage.getItem('userMobile');
      console.log('Stored Mobile:', storedMobile); // Log stored mobile number
      // Check if the stored mobile number is valid
      this.userMobile = storedMobile && !isNaN(Number(storedMobile)) ? Number(storedMobile) : null;
      console.log('Parsed Mobile:', this.userMobile); // Log parsed mobile number
  
      this.userRole = localStorage.getItem('userRole');
      this.userInitials = this.getUserInitials(this.userName);
    }
  

    // Fetch cart item count if user is a customer
    if (this.userRole === 'Customer') {
      this.cartService.getCartItemCount().subscribe(
        (count) => {
          this.cartItemCount = count;
        },
        (error) => console.error('Error fetching cart item count:', error)
      );
    }
  }

  // Function to validate phone number
  isValidPhoneNumber(): boolean {
    return this.userMobile !== null && !isNaN(this.userMobile);
  }

  // Function to get user initials
  getUserInitials(name: string | null): string {
    if (!name) return '';
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.toUpperCase();
  }

  @HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement;  // Cast event target to HTMLElement
  if (target && !target.closest('.user-menu-toggle') && !target.closest('.user-dropdown-menu')) {
    this.showMenu = false;
  }
}

  // Toggle the dropdown menu
  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    alert('You have been logged out!');
    localStorage.clear();
    this.router.navigate(['/landing']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isHeaderShrunk = scrollPosition > 50;
  }

  onSubmit(form: any): void {
    if (form.valid) {
      console.log('Form submitted successfully', form.value);
      this.isSubmitted = true;  // Show success message
      form.reset();  // Optionally reset the form after successful submission
    } else {
      this.isSubmitted = false;  // Hide success message if form is invalid
    }
  }

  // Resets success message if user changes the input
  onInputChange(): void {
    this.isSubmitted = false;
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
