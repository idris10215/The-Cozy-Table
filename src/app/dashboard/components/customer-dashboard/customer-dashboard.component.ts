import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../orders/services/cart.service';
import { UserService } from '../../../menu-management/services/user.service'; 
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css'],
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .card {
      background: #8ad36b;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 24px;
    }

    .progress-container {
      margin: 15px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .progress-bar {
      width: 100%;
      height: 25px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }

    .progress-fill {
      height: 100%;
      display: flex;
      align-items: center;
      padding-left: 10px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      transition: width 0.3s ease;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .order-details {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .order-details p {
      margin: 5px 0;
      color: #666;
    }

    .order-id {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }

    .status-label {
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
    }

    .status-received { background-color: #ff69b4; }
    .status-cooking { background-color: #ffa500; }
    .status-ready { background-color: #4169e1; }
    .status-delivered { background-color: #32cd32; }

    .progress {
      background-color: #f8f9fa;
      border-radius: 15px;
      box-shadow: inset 0 1px 2px rgba(0,0,0,.1);
    }
    
    .progress-bar {
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      transition: width 0.6s ease;
    }

    .progress-text {
      color: white;
      text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
    }

    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 10px;
    }

    .card-header {
      border-top-left-radius: 10px !important;
      border-top-right-radius: 10px !important;
    }
  `]
})

export class CustomerDashboardComponent implements OnInit, AfterViewInit {
  user: any = null;
  totalOrders: number = 0;
  totalSpent: number = 0.0;
  isBubbleChart: boolean = true;
  coupons: any[] = [];
  showCoupons = false;
  recommendedItems: any[] = [];
  highestSoldItem: { menuId: string; quantity: number } | null = null;
  private charts: { [key: string]: Chart } = {}; // To store Chart instances
  activeOrders: any[] = []; // For storing the active orders
  orderStatus: string = ''; // Order status
  orderId: string = ''; // Order ID
  progressBarWidth: string = '0%'; // Progress bar width
  private apiUrl = 'http://localhost:3000';
  userId: string | null = localStorage.getItem('userId');
  userQuestion: string = '';  // Holds the user's question
  adminEmail: string | null = null;  // Admin email fetched from localStorage or user data
  userRole: string | null = '';  // User role (Customer, Admin, etc.)
  mostSoldItems: { menuId: string; menuName: string; quantity: number }[] = [];

  ngAfterViewInit(): void {
    // Your logic here, e.g., if you want to make sure something happens after the view is initialized
    console.log('View Initialized');
  }

  constructor(
    
    private http: HttpClient,
    private router: Router,
    private dashboardService: DashboardService,
    private CartService: CartService,
    private UserService: UserService
  ) {}

  ngOnInit(): void {

    // First, let's check what endpoints are available
    this.http.get(`${this.apiUrl}`).subscribe({
      next: (response) => {
        console.log('Available endpoints:', response);
      },
      error: (err) => console.error('Error checking API:', err)
    });

    // Try different possible endpoints
    this.http.get(`${this.apiUrl}/orders`).subscribe({
      next: (response) => {
        console.log('Orders endpoint:', response);
      },
      error: (err) => console.log('No orders endpoint')
    });

    this.http.get(`${this.apiUrl}/orderSummary`).subscribe({
      next: (response) => {
        console.log('OrderSummary endpoint:', response);
      },
      error: (err) => console.log('No orderSummary endpoint')
    });

    // Check for localStorage availability first
    if (!localStorage) {
      console.error('localStorage is not available');
      return;
    }

    // Fetch recommended items
    this.fetchRecommendedItems();

    // Fetch the order summary
    this.fetchOrderSummary();

    // Retrieve customer user details
    const userEmail = localStorage.getItem('userEmail') || '';
    const userName = localStorage.getItem('userName') || 'Guest';
    const userRole = localStorage.getItem('userRole') || '';

    // Redirect if the user is not a customer
    if (!userEmail || userRole.toLowerCase() !== 'customer') {
      alert('Unauthorized access! Redirecting to login page.');
      this.router.navigate(['login']);
      return;
    }

    // Assign customer details
    this.user = { FullName: userName, EmailAddress: userEmail, Role: userRole };

    // Retrieve and parse admin data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);

        // Check if the user is an admin and assign the admin email
        if (userData.Role?.toLowerCase() === 'admin') {
          this.adminEmail = userData.EmailAddress;
          console.log('Admin Email:', this.adminEmail);
        } else {
          console.warn('UserData found but not an admin.');
        }
      } catch (error) {
        console.error('Error parsing userData:', error);
      }
    } else {
      console.warn('No admin data found in localStorage.');
    }

    this.fetchActiveOrders();
  }

  // Navigate to Menu Page
  goToMenu() {
    this.router.navigate(['/menu']);
  }

  // Navigate to Cart Page
  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToReservation(){
    this.router.navigate(['/reservation-list']);
  }

  // Fetch recommended items from the menu
  fetchRecommendedItems(): void {
    this.UserService.getMenuItems().subscribe(
      (items: any[]) => {
        if (items.length > 0) {
          // Select two random items from the menu
          this.recommendedItems = this.getRandomItems(items, 2);
        }
      },
      (error) => {
        console.error('Error fetching menu items:', error);
      }
    );
  }

  // Function to get random items
  getRandomItems(items: any[], count: number): any[] {
    return items.sort(() => 0.5 - Math.random()).slice(0, count);
  }
  
  // Add item to cart
  // Add a menu item to the cart
  addToCart(item: any): void {
    this.CartService.addToCart(item);
    alert(`${item.name} has been added to your cart!`);
  }

  fetchOrderSummary(): void {
    const userId = localStorage.getItem('userId'); // Get logged-in user ID
  
    this.dashboardService.getOrderSummary().subscribe(
      (orderSummary: any[]) => {
        // Filter orders to include only those belonging to the logged-in user
        const userOrders = orderSummary.filter(order => order.userId === userId);
  
        // Calculate total orders (only for this user)
        this.totalOrders = userOrders.length;
  
        // Calculate total money spent by this user
        this.totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
  
        // Calculate most sold items for this user
        this.mostSoldItems = this.calculateMostSoldItems(userOrders);
  
        if (this.mostSoldItems.length > 0) {
          this.highestSoldItem = this.mostSoldItems[0];
        }
  
        this.renderBubbleGraph();
      },
      (error) => {
        console.error('Error fetching order summary:', error);
      }
    );
  }
  
  
  // Calculates the total quantity sold for each menu item (WITH menuName)
calculateMostSoldItems(orderSummary: any[]): { menuId: string; menuName: string; quantity: number }[] {
  const itemQuantityMap: { [key: string]: { menuName: string; quantity: number } } = {};

  orderSummary.forEach((order) => {
    order.items.forEach((item: { menuId: string; name: string; quantity: number }) => {
      if (!itemQuantityMap[item.menuId]) {
        itemQuantityMap[item.menuId] = { menuName: item.name, quantity: 0 };
      }
      itemQuantityMap[item.menuId].quantity += item.quantity;
    });
  });

  return Object.entries(itemQuantityMap)
    .map(([menuId, data]) => ({
      menuId,
      menuName: data.menuName,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity);
}
  
  // Renders the bubble graph
  renderBubbleGraph(): void {
    const canvas = document.getElementById('bubbleCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Bubble canvas element not found!');
      return;
    }
  
    if (this.charts['bubbleCanvas']) {
      this.charts['bubbleCanvas'].destroy();
    }
  
    this.charts['bubbleCanvas'] = new Chart(canvas, {
      type: 'bubble',
      data: {
        datasets: this.mostSoldItems.map((item) => ({
          label: `Item ${item.menuName}`, // Menu name removed, using menuId as label
          data: [
            {
              x: Math.random() * 100,
              y: Math.random() * 100,
              r: item.quantity * 2,
            },
          ],
          backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, 
                                  ${Math.floor(Math.random() * 255)}, 
                                  ${Math.floor(Math.random() * 255)}, 0.6)`,
          borderColor: 'rgba(0, 0, 0, 0.1)',
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Quantity',
              color: '#fbc2eb', // Set the x-axis title color
            },
            ticks: {
              color: '#fbc2eb', // Set the x-axis labels color
            },
          },
          y: {
            title: {
              display: true,
              text: 'Quantity',
              color: '#fbc2eb', // Set the y-axis title color
            },
            ticks: {
              color: '#fbc2eb', // Set the y-axis labels color
            },
          },
        },
      },
    });
  }


  getProgressStyle(status: string): any {
    console.log('Processing status:', status);
    
    let width = '0%';
    let backgroundColor = '#6c757d'; // default gray

    // Convert status to lowercase for consistent comparison
    const currentStatus = status?.toLowerCase() || '';

    if (currentStatus.includes('received')) {
      width = '25%';
      backgroundColor = '#ff69b4'; // pink
    } else if (currentStatus.includes('cooking')) {
      width = '50%';
      backgroundColor = '#ffa500'; // orange
    } else if (currentStatus.includes('way')) {
      width = '75%';
      backgroundColor = '#4169e1'; // royal blue
    }

    console.log('Returning style:', { width, backgroundColor });
    return {
      'width': width,
      'background-color': backgroundColor
    };
  }

  getProgressPercentage(status: any): number {
    if (status['food delivered']) return 100;
    if (status['order on the way']) return 75;
    if (status['cooking']) return 50;
    if (status['order received']) return 25;
    return 0;
  }

  getOrderStatus(status: any): string {
    if (status['food delivered']) return 'DELIVERED';
    if (status['order on the way']) return 'READY';
    if (status['cooking']) return 'ACCEPTED';
    if (status['order received']) return 'ORDERED';
    return 'PENDING';
  }

  getStatusColor(status: any): string {
    const currentStatus = this.getOrderStatus(status);
    switch (currentStatus) {
      case 'DELIVERED':
        return 'bg-success';  // Green
      case 'READY':
        return 'bg-info';     // Blue
      case 'ACCEPTED':
        return 'bg-warning';  // Yellow/Orange
      case 'ORDERED':
        return 'bg-primary';  // Primary blue
      default:
        return 'bg-secondary'; // Gray
    }
  }

  isStepActive(step: string, currentStatus: any): boolean {
    const orderFlow = ['ORDERED', 'ACCEPTED', 'READY', 'DELIVERED'];
    const currentStatusText = this.getOrderStatus(currentStatus);
    const stepIndex = orderFlow.indexOf(step);
    const currentIndex = orderFlow.indexOf(currentStatusText);
    return currentIndex >= stepIndex;
  }

  fetchActiveOrders(): void {
    if (!this.userId) {
      console.log('No user ID found');
      return;
    }

    this.http.get<any[]>(`${this.apiUrl}/orderSummary`).subscribe({
      next: (orders) => {
        console.log('All orders:', orders);
        
        // Filter orders for current user and not delivered
        this.activeOrders = orders.filter(order => 
          order.userId === this.userId && 
          !order.status['food delivered']
        );
        
        console.log('Active orders:', this.activeOrders);
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
      }
    });
  }

  getStatusText(status: any): string {
    if (status['food delivered']) return 'Delivered';
    if (status['order on the way']) return 'On the Way';
    if (status['cooking']) return 'Cooking';
    if (status['order received']) return 'Order Received';
    return 'Processing';
  }

  getProgressBarClasses(status: any): string {
    let classes = 'progress-bar ';
    
    if (status['food delivered']) {
      classes += 'bg-success';
    } else if (status['order on the way']) {
      classes += 'bg-info';
    } else if (status['cooking']) {
      classes += 'bg-warning';
    } else if (status['order received']) {
      classes += 'bg-primary';
    } else {
      classes += 'bg-secondary';
    }

    return classes;
  }

  getProgressBarStyles(status: any): any {
    return {
      'width': this.getProgressPercentage(status) + '%',
      'transition': 'width 0.5s ease-in-out'
    };
  }

   // Function to submit the question
   submitQuestion(): void {
    if (!this.userQuestion.trim()) {
      alert('Please enter a question before submitting.');
      return;
    }

    if (!this.adminEmail) {
      alert('Your message has been sent. Someone from our team will contact you via email.');
      return;
    }

    const questionData = {
      question: this.userQuestion,
      toEmail: this.adminEmail,
      fromEmail: this.user?.EmailAddress || 'Anonymous Customer',
      customerName: this.user?.FullName || 'Anonymous'
    };

    this.http.post('/api/send-question', questionData).subscribe({
      next: () => {
        alert('Your message has been sent successfully to our admin team. We will get back to you soon!');
        this.userQuestion = ''; // Clear the input field
      },
      error: (error) => {
        console.error('Error sending question:', error);
        alert('Unable to send message. Please try again later.');
      }
    });
  }

}
