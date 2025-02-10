import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  orderDate: string;
}

interface OrderItem {
  menuId: string;
  quantity: number;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  availability: boolean;
  image: string;
}

@Component({
  selector: 'app-part2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './part2.component.html',
  styleUrls: ['./part2.component.css'],
})
export class Part2Component implements OnInit {
  bestSellingDishes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchBestSellingDishes();
  }

  fetchBestSellingDishes(): void {
    this.http.get<Order[]>('http://localhost:3000/orderSummary').subscribe(
      (orderData) => {
        this.http.get<MenuItem[]>('http://localhost:3000/menus').subscribe(
          (menuData) => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Process orders and items
            const recentItems = orderData
              .filter(order => new Date(order.orderDate) >= thirtyDaysAgo)
              .flatMap(order => order.items);

            // Aggregate quantities by menuId
            const itemCounts = recentItems.reduce((acc, item) => {
              acc[item.menuId] = (acc[item.menuId] || 0) + item.quantity;
              return acc;
            }, {} as Record<string, number>);

            // Map to menu items and sort
            const sortedDishes = Object.entries(itemCounts)
              .map(([menuId, quantity]) => {
                const menuItem = menuData.find(menu => menu.id === menuId);
                return menuItem ? { 
                  name: menuItem.name,
                  description: menuItem.description,
                  image: menuItem.image,
                  quantity: quantity
                } : null;
              })
              .filter((dish): dish is NonNullable<typeof dish> => dish !== null)
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 3);

            this.bestSellingDishes = sortedDishes;
          },
          (error) => console.error('Error fetching menu data:', error)
        );
      },
      (error) => console.error('Error fetching orderSummary:', error)
    );
  }
}