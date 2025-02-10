import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the user is logged in by checking the localStorage
    const isLoggedIn = !!localStorage.getItem('userEmail');
    if (!isLoggedIn) {
      // If not logged in, navigate to login page
      this.router.navigate(['/login']);
      return false;
    }
    return true;  // Allow access to the route
  }
}
