import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartItem, OrderSummary } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  
  private apiUrl = 'http://localhost:3000/cartItems';
  private orderSummaryUrl = 'http://localhost:3000/orderSummary';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartItemCountSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private router: Router,) {
    this.loadCart();
  }

  getCartItemCount(): Observable<number> {
    return this.cartItemCountSubject.asObservable();
  }
  updateCartItemCount(): void {
    this.cartSubject.pipe(
      map((items) => items.reduce((total, item) => total + item.quantity, 0))
    ).subscribe((count) => {
      this.cartItemCountSubject.next(count);
    });
  }
  

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  removeFromCart(id: string): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return;
    }
  
    // Fetch the user's cart by userId
    this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).subscribe(
      (cartData) => {
        const userCart = cartData[0]; 
  
        if (userCart) {
          // Filter out the item to be removed from the cart
          userCart.items = userCart.items.filter((item: CartItem) => item.id !== id);
  
          // Update the cart with the remaining items
          this.http.put(`${this.apiUrl}/${userCart.id}`, userCart).subscribe(
            () => {
              console.log('Item removed from cart successfully');
              this.loadCart(); // Reload the cart after updating
            },
            (error) => console.error('Error removing item from cart:', error)
          );
        }
      },
      (error) => console.error('Error fetching cart data:', error)
    );
  }

  updateQuantity(id: string, quantity: number): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return;
    }
  
    // Fetch the user's cart by userId
    this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).subscribe(
      (cartData) => {
        const userCart = cartData[0];
  
        if (userCart) {
          const itemToUpdate = userCart.items.find((item: CartItem) => item.id === id);
  
          if (itemToUpdate) {
            itemToUpdate.quantity = quantity;
            this.http.put(`${this.apiUrl}/${userCart.id}`, userCart).subscribe(
              () => {
                console.log('Item quantity updated successfully');
                this.loadCart(); 
              },
              (error) => console.error('Error updating item quantity:', error)
            );
          }
        }
      },
      (error) => console.error('Error fetching cart data:', error)
    );
  }
  

  addToCart(item: any): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      alert('Please log in to add items to your cart.');
      return;
    }
  
    this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).subscribe(
      (cartData) => {
        const userCart = cartData[0]; // Get the user's cart
  
        if (userCart) {
          const existingItem = userCart.items.find((cartItem: CartItem) => cartItem.id === item.id);
  
          if (existingItem) {
            // If item exists, update quantity
            existingItem.quantity += 1;
            this.http.put(`${this.apiUrl}/${userCart.id}`, userCart).subscribe(
              () => {
                // Only show the quantity update message
                alert(`${item.name} quantity updated to ${existingItem.quantity}`);
                this.loadCart(); // Reload the cart after updating
              },
              (error) => console.error('Error updating item quantity:', error)
            );
          } else {
            // If item does not exist, add to cart
            userCart.items.push({
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: 1,
            });
  
            this.http.put(`${this.apiUrl}/${userCart.id}`, userCart).subscribe(
              () => {
                // Show the item added message only when it's a new addition
                alert(`${item.name} added to cart`);
                this.loadCart(); // Reload the cart after adding
              },
              (error) => console.error('Error adding item to cart:', error)
            );
          }
        } else {
          // If no cart exists for the user, create a new cart
          const newCart = {
            userId: userId,
            items: [
              {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1,
              },
            ],
          };
  
          this.http.post(this.apiUrl, newCart).subscribe(
            () => {
              // Show the item added message after creating the new cart
              alert(`${item.name} added to cart`);
              this.loadCart(); // Reload the cart after adding
            },
            (error) => console.error('Error creating new cart:', error)
          );
        }
      },
      (error) => {
        console.error('Error fetching cart data:', error);
      }
    );
  }




  loadCart(): void {

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      this.cartSubject.next([]);
      return;
    }

    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        const userCart = data.find((cart) => cart.userId === userId);
        this.cartSubject.next(userCart?.items || []);
        this.updateCartItemCount(); // Set cart items or an empty array
      },
      (error) => {
        console.error('Error fetching cart data:', error);
      }
    );
  }

  saveOrderSummary(data: any): Observable<any> {
    return this.http.post(this.orderSummaryUrl, data);
  }

  clearCart(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return;
    }
  
    this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).subscribe(
      (cartData) => {
        const userCart = cartData[0]; 
  
        if (userCart && userCart.items.length > 0) {
          console.log('Clearing cart for user:', userId);
          this.http.delete(`${this.apiUrl}/${userCart.id}`).subscribe(
            () => {

              const clearedCart = { userId: userCart.userId, items: [] };
              this.http.post(this.apiUrl, clearedCart).subscribe(
                () => {
                  console.log('Cart cleared successfully');
                  this.cartSubject.next([]); 
                },
                (error) => console.error('Error creating empty cart after clearing:', error)
              );
            },
            (error) => console.error('Error clearing cart items:', error)
          );
        } else {
          console.warn('No items found in cart to clear.');
        }
      },
      (error) => console.error('Error fetching user cart:', error)
    );
  }

  PlaceOrder(orderData : any){
    this.http.post(this.orderSummaryUrl, orderData).subscribe(
      () => {
        alert('Order placed successfully!');
        this.clearCart();
      },
      (error) => {
        console.error('Error placing order:', error);
      }
    );
  }

  fetchOrderSummary(): Observable<CartItem[]> {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return throwError('No user ID found in localStorage.');
    }
  
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      map((data) => {
        const userCart = data[0];
        return userCart ? userCart.items : []; // Return cart items or empty array
      }),
      catchError((error) => {
        console.error('Error fetching order summary:', error);
        return throwError(error);
      })
    );
  }

  getUserOrders(): Observable<OrderSummary[]> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return of([]); // Return empty if no user ID
    }

    return this.http.get<OrderSummary[]>(`${this.orderSummaryUrl}?userId=${userId}`).pipe(
      map((orders) => orders || []),
      catchError((error) => {
        console.error('Error fetching user orders:', error);
        return of([]);
      })
    );
  }

  updateOrderStatus(orderId: string, status: any): Observable<any> {
    const url = `${this.orderSummaryUrl}/${orderId}`;
    return this.http.patch(url, { status });
  }

  // Fetch all orders (for admin)
  getAllOrders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(this.orderSummaryUrl).pipe(
      map((orders) => orders || []),
      catchError((error) => {
        console.error('Error fetching all orders:', error);
        return of([]);
      })
    );
  }

}
