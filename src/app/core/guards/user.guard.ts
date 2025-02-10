import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInUser = { userId: '367f' }; // This should be replaced with actual user authentication logic

  getUserId(): string {
    return this.loggedInUser.userId;
  }
}


@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'Admin') {
      // Allow access to the user route
      return true;
    } else {
      // If the user is an admin, redirect to a different page (e.g., admin dashboard)
      this.router.navigate(['/admin-dashboard']);
      return false;
    }
  }
}
