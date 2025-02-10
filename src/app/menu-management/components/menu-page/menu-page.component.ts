import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../../orders/services/cart.service';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-page.component.html',
  styleUrls: ['./menu-page.component.css'],
})
export class MenuPageComponent implements OnInit {
  menuItems: any[] = []; // Full list of menu items fetched from the backend
  filteredMenuItems: any[] = []; // Filtered list of menu items (search/category)
  showCategories: boolean = false; // Controls the visibility of category filter options
  showAdminButtons: boolean = false; // Toggle admin-specific buttons
  categories: string[] = [
    'All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages',
    'Salads', 'Soup', 'Snacks', 'Kids Menu', 'Indian Cuisine', 'Mexican Cuisine',
    'Chinese Cuisine', 'Italian Cuisine', 'Signature Dishes'
  ]; // Available categories

  constructor(
    private router: Router,
    private userService: UserService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Check user role for admin-specific functionality
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'Admin') {
      this.showAdminButtons = true;
    }

    // Fetch menu items from backend
    this.userService.getMenuItems().subscribe(
      (items) => {
        this.menuItems = items;
        this.filteredMenuItems = items; // Initially display all items
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        alert('Failed to fetch menu items.');
      }
    );
  }

  // Toggle category filter visibility
  toggleCategoryFilter(): void {
    this.showCategories = !this.showCategories;
  }

  // Filter menu items by category
  filterByCategory(category: string): void {
    this.filteredMenuItems =
      category === 'All'
        ? this.menuItems
        : this.menuItems.filter((item) => item.category === category);
    this.showCategories = false; // Hide the category filter
  }

  
  // Search menu items by name
  searchMenu(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMenuItems = this.menuItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  // Display description of a food item
  showDescription(description: string): void {
    alert(description); // Use a modal dialog for better UI (optional)
  }

  // Add a menu item to the cart
  addToCart(item: any): void {
    this.cartService.addToCart(item);
    alert(`${item.name} has been added to your cart!`);
  }
}
