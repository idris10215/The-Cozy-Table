import { Component, HostBinding, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css'],
})
export class MenuListComponent implements OnInit {
  menuItems: any[] = []; // This will hold your menu items
  originalMenuItems: any[] = []; // Keep a copy of the original items for toggling
  editingMenuId: number | null = null; // Store the ID of the menu item being edited
  tempMenuData: any = {}; // Store temporary data when editing
  isSortedByCategory: boolean = false; // Track whether the list is sorted by category
  filteredMenuItems: any[] = []; // Holds the items after filtering
  searchQuery: string = ''; // The search input value

  constructor(private userService: UserService, private location: Location) {}

  ngOnInit() {
    this.loadMenuItems(); // Load menu items when the component is initialized
  }

  loadMenuItems() {
    this.userService.getMenuItems().subscribe((menus) => {
      this.menuItems = menus;
      this.originalMenuItems = [...menus]; // Create a copy of the original list
      this.filteredMenuItems = [...menus]; // Initialize filtered items
    });
  }

  editMenuItem(menu: any) {
    this.editingMenuId = menu.id; // Mark the item as being edited
    this.tempMenuData = { ...menu }; // Copy current data to tempMenuData for editing
  }

  sortByCategory(): void {
    if (this.isSortedByCategory) {
      // If already sorted, reset to the original order
      this.menuItems = [...this.originalMenuItems];
    } else {
      // If unsorted, sort the items alphabetically by category
      this.menuItems.sort((a, b) => a.category.localeCompare(b.category));
    }
  
    this.filteredMenuItems = [...this.menuItems]; // Update the filtered list
    this.isSortedByCategory = !this.isSortedByCategory; // Toggle the sorting state
  }
  
   // Search functionality
   filterMenuItems() {
    const query = this.searchQuery.toLowerCase();
    this.filteredMenuItems = this.menuItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }

  saveMenuItem() {
    if (this.editingMenuId !== null) {
      const updatedMenu = this.tempMenuData;

      // Cast `editingMenuId` to a string before passing it to the service
      this.userService.updateMenuItem(String(this.editingMenuId), updatedMenu).subscribe(() => {
        this.loadMenuItems(); // Reload the menu list after saving
        this.editingMenuId = null; // Reset editing state
      });
    }
  }

  deleteMenuItem(id: number) {
    this.userService.deleteMenuItem(String(id)).subscribe(() => {
      this.loadMenuItems(); // Reload the menu list after deletion
    });
  }

  cancelEdit() {
    this.editingMenuId = null; // Cancel editing
    this.tempMenuData = {}; // Reset the temporary data
  }

  goBack() {
    this.location.back();
  }
}
