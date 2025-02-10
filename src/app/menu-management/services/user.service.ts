import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private menusUrl = 'http://localhost:3000/menus'; // URL for menus
  private cartItemsUrl = 'http://localhost:3000/cartItems'; // URL for cart-items

  constructor(private http: HttpClient) {}

  // Add a new menu item
  addMenuItem(menu: User): Observable<User> {
    return this.http.post<User>(this.menusUrl, menu); // Use menus URL
  }

  // Delete a menu item by ID
  deleteMenuItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.menusUrl}/${id}`); // Use menus URL
  }

  // Update a menu item by ID
  updateMenuItem(id: string, menuData: any): Observable<any> {
    return this.http.put<any>(`${this.menusUrl}/${id}`, menuData); // Use menus URL
  }

  // Fetch all menu items
  getMenuItems(): Observable<any[]> {
    return this.http.get<any[]>(this.menusUrl); // Use menus URL
  }

 
}
