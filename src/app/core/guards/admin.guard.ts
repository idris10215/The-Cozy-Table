import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'Admin') {
      // Allow access to the admin route
      return true;
    } else {
      // If the user is not an admin, redirect to a different page (e.g., customer dashboard or login)
      this.router.navigate(['/customer-dashboard']);
      return false;
    }
  }
}
