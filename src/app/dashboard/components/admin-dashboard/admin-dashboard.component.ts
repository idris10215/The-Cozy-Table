import { Component, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import Chart from 'chart.js/auto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  isHeaderShrunk: boolean = false;
  incomeData: any[] = [];
  isBubbleChart: boolean = true;
  mostSoldItems: { menuId: string; menuName: string; quantity: number }[] = [];
  highestSoldItem: { menuId: string; quantity: number } | null = null;
  adminInfo: any | null = null;
  boxVisible: boolean = false;
  feedbackData: { rating: number; name: string }[] = []; // Update feedback data type
  feedbackChart: Chart | undefined; // Chart instance
  totalOrders: number = 0;
  totalIncome: number = 0.0;
  newCustomers: number = 0;

  private charts: { [key: string]: Chart } = {}; // To store Chart instances

  constructor(private router: Router, private dashboardService: DashboardService, private http: HttpClient) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isHeaderShrunk = scrollPosition > 50;
  }

  ngOnInit(): void {
    this.fetchIncomeData();
    this.fetchOrderSummary();
    this.fetchFeedbackData();
  }

  // Modify the chartType to hold separate values for each graph
  chartTypes: { [key: string]: 'line' | 'bar' } = {
    monthly: 'line',
    yearly: 'line',
  };

  // Fetches income data
  fetchIncomeData(): void {
    this.dashboardService.getIncomeData().subscribe(
      (data) => {
        this.incomeData = data;
        this.renderAllIncomeGraphs();
      },
      (error) => {
        console.error('Error fetching income data:', error);
      }
    );
  }

  // Handle monthly income change
  onMonthlyMonthChange(event: any) {
    const selectedMonth = event.target.value;
    console.log('Selected Month:', selectedMonth);
    const filteredData = this.filterDataByMonth(new Date(selectedMonth));
    this.renderSingleGraph('monthlyCanvas', 'Income of the Date', filteredData);
  }

  // Handle yearly income change
  onYearlyYearChange(event: any) {
    const selectedYear = event.target.value;
    console.log('Selected Year:', selectedYear);
    const filteredData = this.filterDataByYear(new Date(`${selectedYear}-01-01`));
    this.renderSingleGraph('yearlyCanvas', 'Income of the Month', filteredData);
  }

  // Renders all income graphs
  renderAllIncomeGraphs(): void {
    const selectedDate = new Date();
    this.renderSingleGraph('monthlyCanvas', 'Income of the Date', this.filterDataByMonth(selectedDate));
    this.renderSingleGraph('yearlyCanvas', 'Income of the Month', this.filterDataByYear(selectedDate));
  }

  // Renders a single graph
  renderSingleGraph(canvasId: string, label: string, data: { label: string; income: number }[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas not found for ${label}`);
      return;
    }
  
    // Set a fixed height and width
    canvas.height = 400; // Fixed height in pixels
    canvas.width = canvas.parentElement?.clientWidth || 400; // Fixed width (responsive)
    
    // Destroy the previous chart if it exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
  
    const labels = data.map((d) => d.label);
    const income = data.map((d) => d.income);
  
    // Create the chart with new data
    this.charts[canvasId] = new Chart(canvas, {
      type: this.chartTypes[canvasId.replace('Canvas', '')], // Dynamically set the chart type
      data: {
        labels,
        datasets: [
          {
            label,
            data: income,
            borderColor: '#fbc2eb',
            backgroundColor: '#c54b86',
            borderWidth: 2,
            fill: true,
          },
        ],
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
              text: 'Date/Month',
              color: '#fbc2eb', // Set the x-axis title color
            },
            ticks: {
              color: '#fbc2eb', // Set the x-axis labels color
            }
          },
          y: {
            title: {
              display: true,
              text: 'Income',
              color: '#fbc2eb', // Set the y-axis title color
            },
            ticks: {
              color: '#fbc2eb', // Set the y-axis labels color
            }
          }
        }
      },
    });
  }

  // Data filtering methods
  filterDataByMonth(selectedDate: Date): { label: string; income: number }[] {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    return labels.map((label) => ({
      label,
      income: this.incomeData.filter((data) => {
        const date = new Date(data.date);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear && date.getDate() === parseInt(label);
      }).reduce((acc, curr) => acc + curr.income, 0),
    }));
  }

  filterDataByYear(selectedDate: Date): { label: string; income: number }[] {
    const selectedYear = selectedDate.getFullYear();

    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    return months.map((month) => ({
      label: month,
      income: this.incomeData.filter((data) => {
        const date = new Date(data.date);
        return date.getFullYear() === selectedYear && date.getMonth() === parseInt(month) - 1;
      }).reduce((acc, curr) => acc + curr.income, 0),
    }));
  }
  ngAfterViewInit(): void {
    // Render Bubble Graph by default
    this.renderBubbleGraph();
  
    // Check if feedbackData is available and initialize the feedback graph
    if (this.feedbackData && this.feedbackData.length > 0) {
      this.initializeFeedbackGraph();
    }
  }
  
// Fetches order summary and calculates most sold items
fetchOrderSummary(): void {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  this.dashboardService.getOrderSummary().subscribe(
    (orderSummary: any[]) => {
      // 🔹 Find Most Sold Items
      this.mostSoldItems = this.calculateMostSoldItems(orderSummary);
      this.highestSoldItem = this.mostSoldItems.length > 0 ? this.mostSoldItems[0] : null;
      this.renderBubbleGraph();

      // 🔹 Separate orders for today and past orders
      const todayOrders = orderSummary.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0]; // Normalize date format
        return orderDate === today;
      });

      const pastOrders = orderSummary.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate < today;
      });

      // 🔹 Calculate Today's Orders Count
      this.totalOrders = todayOrders.length;

      // 🔹 Calculate Today's Total Revenue
      this.totalIncome = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // 🔹 Find Unique Customers Who Ordered Today
      const todayUserIds = new Set(todayOrders.map(order => order.userId));
      const pastUserIds = new Set(pastOrders.map(order => order.userId));

      // Count new customers: Users in todayUserIds but NOT in pastUserIds
      this.newCustomers = [...todayUserIds].filter(userId => !pastUserIds.has(userId)).length;

      // 🔹 Update circular graph UI dynamically
      document.querySelector('.scroll-card:nth-child(1) .circular-graph')?.setAttribute('data-value', this.totalOrders.toString());
      document.querySelector('.scroll-card:nth-child(2) .circular-graph')?.setAttribute('data-value', this.totalIncome.toFixed(2));
      document.querySelector('.scroll-card:nth-child(3) .circular-graph')?.setAttribute('data-value', this.newCustomers.toString());
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


  fetchFeedbackData(): void {
    this.http.get<{ feedback: { rating: number; name: string }[] }>('assets/db.json').subscribe({
      next: (data) => {
        this.feedbackData = data.feedback;
        if (this.feedbackData && this.feedbackData.length > 0) {
          this.initializeFeedbackGraph();
        }
      },
      error: (err) => {
        console.error('Error fetching feedback data:', err);
      },
    });
  }
  
  initializeFeedbackGraph(): void {
    const starCounts = [0, 0, 0, 0, 0];
    const customerDetails: string[][] = [[], [], [], [], []];
  
    this.feedbackData.forEach((feedback) => {
      const stars = feedback.rating;  // Adjusted based on JSON structure
      const customerName = feedback.name; // Adjusted based on JSON structure
      if (stars >= 1 && stars <= 5) {
        starCounts[stars - 1]++;
        customerDetails[stars - 1].push(customerName);
      }
    });

    const ctx = document.getElementById('feedbackCanvas') as HTMLCanvasElement;
    if (ctx) {
      ctx.height = 400;

      this.feedbackChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
          datasets: [
            {
              label: 'Number of Feedbacks',
              data: starCounts,
              backgroundColor: ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
            },
          ],
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const index = context.dataIndex;
                  const customers = customerDetails[index];
                  return customers.length ? `Customers: ${customers.join(', ')}` : 'No Feedback';
                },
              },
            },
          },
          
          scales: {
            x: {
              title: {
                display: true,
                text: 'Number of Feedbacks',
                color: 'black',
              },
              ticks: {
                color: 'black',
                stepSize: 1,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Star Ratings',
                color: 'black',
              },
              ticks: {
                color: 'black',
              },
              reverse: true,
            },
          },
        },
      });
    } else {
      console.error('Canvas element with id "feedbackCanvas" not found.');
    }
  }
}