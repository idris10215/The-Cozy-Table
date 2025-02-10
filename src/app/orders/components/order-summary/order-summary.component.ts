import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartComponent } from '../cart/cart.component';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  private cartItemsUrl = 'http://localhost:3000/cartItems';
  private orderSummaryUrl = 'http://localhost:3000/orderSummary';
  private couponUrl = 'http://localhost:3000/coupons';

  cartItems: any[] = [];
  // orderSummary: any;
  itemCount: number = 0;
  totalItemsCost: number = 0;
  shippingCost: number = 100; // Example static shipping cost
  taxCollected: number = 0;


  couponCode: string = '';
  couponMessage: string = '';
  isCouponValid: boolean = false;
  finalTotal: number =0;
  subTotal:number =0 ;
  
  address: string = '';
  pinCode: string = '';
  addressError: boolean = false;
  pinCodeError: boolean = false;
  orderstatus : string = "order received";

  constructor(private cartService: CartService, private router: Router, private http: HttpClient) {
  }
  ngOnInit(): void { 
    this.fetchOrderSummary();
  }

  redirectToCart() {
    this.router.navigate(['/cart']);
  }
  fetchOrderSummary(): void {
    this.cartService.fetchOrderSummary().subscribe(
      (items) => {
        this.cartItems = items;
        this.calculateOrderDetails(); // Perform additional operations on fetched data
      },
      (error) => console.error('Error fetching order summary:', error)
    );
  }


  calculateOrderDetails(): void {

    if (this.cartItems.length > 0) {
      this.itemCount = this.cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      this.totalItemsCost = this.cartItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0
      );

      this.shippingCost = this.totalItemsCost > 500 ? 0 : 100;
      this.taxCollected = (this.totalItemsCost + this.shippingCost) * 0.18;
      this.finalTotal = this.totalItemsCost + this.shippingCost + this.taxCollected;
      this.subTotal=this.finalTotal
    }
  }

  applyCoupon(): void {
    if (!this.couponCode) {
      this.finalTotal = this.subTotal
      this.couponMessage = 'Please enter a coupon code.';
      this.isCouponValid = false;
      return;
    }

    // Check the coupon code against the database
    this.http.get<any[]>(this.couponUrl).subscribe(
      (coupons) => {
        const matchedCoupon = coupons.find(
          (coupon) => coupon.code === this.couponCode
        );

        if (matchedCoupon) {
          this.finalTotal = this.subTotal - (this.subTotal * matchedCoupon.discount) / 100;
          this.couponMessage = `Coupon applied! You got a ${matchedCoupon.discount}% discount.`;
          this.isCouponValid = true;
        } else {
          this.couponMessage = 'Invalid coupon code. Please try again.';
          this.finalTotal = this.subTotal;
          this.isCouponValid = false;
        }
      },
      (error) => {
        console.error('Error fetching coupons:', error);
      }
    );
  }

  isFormValid(): boolean {
    this.addressError = !this.address;
    this.pinCodeError = !/^\d{6}$/.test(this.pinCode);

    return (
      this.address.length >= 10 && /^[0-9]{6}$/.test(this.pinCode)
    );
  }

  handlePlaceOrder() {
    if (!this.isFormValid()) {
      console.error('Form validation failed.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No user ID found in localStorage.');
      return;
    }

    const orderData = {
      userId,
      items: this.cartItems.map((item) => ({
        menuId: item.id,
        name:item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: this.finalTotal,
      orderDate: new Date().toISOString(),
      address: this.address,
      pinCode: this.pinCode,
      status: {
        "order received": true,
        "cooking": false,
        "order on the way": false,
        "food delivered": false
      }

    };
    this.cartService.PlaceOrder(orderData);
    this.cartService.clearCart();
    this.router.navigate(['/order-list']);
  }

}
