import { HttpClientModule } from '@angular/common/http'; // Import here
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';import { RouterOutlet } from '@angular/router';
import { CartComponent } from './orders/components/cart/cart.component';
import { OrderSummaryComponent } from './orders/components/order-summary/order-summary.component';

// added and maintained by springboard mentor
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule], // Add HttpClientModule here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'My Angular App';
}
