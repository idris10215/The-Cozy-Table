import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderSummary } from '../../models/cart.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
  orders: OrderSummary[] = [];
  isAdmin: boolean = false;
  searchQuery: string = '';
  filteredOrders: OrderSummary[] = [];
  selectedFilter: string = 'orderId';
  selectedDate: string = '';
  

  constructor(private cartService: CartService) {}

  
  ngOnInit(): void {
    if (localStorage.getItem('userRole') === 'Admin') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    

    if (this.isAdmin) {
      this.fetchAllOrders();
    } else {
      this.fetchUserOrders();
    }
  }

  fetchUserOrders(): void {
    this.cartService.getUserOrders().subscribe(
      (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
      },
      (error) => console.error('Error fetching user orders:', error)
    );
  }

  getOrderStatus(status: any): string {
    if (status['food delivered']) return('Food Delivered');
    if (status['order on the way']) return('Order on the Way');
    if (status['cooking']) return('Cooking');
    else return('Order Received');
  }
  

  searchOrders(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrders = this.orders; // Show all if no search term
    } else {
      this.filteredOrders = this.orders.filter(order => 
        order.userId.includes(this.searchQuery) || order.userId.includes(this.searchQuery)
      );
    }
  }

  filterOrders() {
    let filtered = this.orders;

    if (this.selectedFilter === 'orderDate' && this.selectedDate) {
      // Filter by date if the selected filter is "orderDate" and a date is chosen
      const selectedDate = new Date(this.selectedDate).toLocaleDateString();
      filtered = filtered.filter(order => {
        return new Date(order.orderDate).toLocaleDateString() === selectedDate;
      });
    } else if (this.searchQuery) {
      // Filter by the chosen filter type (orderId, userId, itemName)
      filtered = filtered.filter(order => {
        switch (this.selectedFilter) {
          case 'orderId':
            return order.id.toLowerCase().includes(this.searchQuery.toLowerCase());
          case 'userId':
            return order.userId.toLowerCase().includes(this.searchQuery.toLowerCase());
          case 'itemName':
            return order.items.some(item => item.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          default:
            return false;
        }
      });
    }

    // Set the filtered orders
    this.filteredOrders = filtered;
  }
  

  updateOrderStatus(orderId: string, newStatus: any) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return; // If the order is not found, exit the function

    // Initialize status if it's not an object (e.g., if it's currently a string)
    if (typeof order.status !== 'object') {
      // Initialize the status to a default state
      order.status = {
        'order received': false,
        'cooking': false,
        'order on the way': false,
        'food delivered': false
      };
    }

    
    // Define the possible status options in the correct order
    const statusSteps = ['order received', 'cooking', 'order on the way', 'food delivered'];
  
    // Check if the clicked status is already true, in which case, do nothing
    if (order.status[newStatus] === true) return;


    
    // Find the index of the clicked status
    const statusIndex = statusSteps.indexOf(newStatus);

  
    // Update the status object to tick all previous statuses as true
    for (let i = 0; i <= statusIndex; i++) {
      order.status[statusSteps[i]] = true;
    }

    // Call the service to update the status on the backend
    this.cartService.updateOrderStatus(orderId, order.status).subscribe(
      () => {
        if (this.isAdmin) {
          this.fetchAllOrders();



        } else {
          this.fetchUserOrders();
        }
      },
      (error) => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status');
      }
    );
  }
  
  
  

  fetchAllOrders(): void {
    this.cartService.getAllOrders().subscribe(
      (orders) => {
        this.orders = orders;
        this.filteredOrders = orders;
      },
      (error) => console.error('Error fetching all orders:', error)
    );
  }

  calculateOrderTotal(items: any[]): number {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
