import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart.model';


@Component({
  selector: 'app-cart', // This is the tag you'll use to embed the component
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Import any necessary modules
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(private cartService: CartService, private router: Router) {}

  redirectToPayment() {
    this.router.navigate(['/order-summary']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe(
      (cart) => {
        console.log('Fetched cart:', cart); // Debug fetched cart data
        this.cartItems = cart || []; // Ensure default empty array
        this.calculateTotal();
      },
      (error) => console.error('Error fetching cart:', error)
    );
  }

  removeItem(id: string) {
    this.cartService.removeFromCart(id);
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity > 0) {
      this.cartService.updateQuantity(id, quantity);
    } else {
      console.warn('Quantity must be greater than zero.');
    }
  }

  calculateTotal() {
    this.total = this.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }
  

  placeOrder() {
    this.redirectToPayment();
  }
}
