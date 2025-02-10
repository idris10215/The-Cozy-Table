export interface CartItem {
    image: any;
    id: string;
    name: string;
    price: number;
    quantity: number;
    userId: string;  
  }

  export interface OrderSummary {
    userId: string;
    id:string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }[];
    total: number;
    orderDate: string;
    status: {
      [key: string]: boolean;
      'order received': boolean,
      'cooking': boolean,
      'order on the way': boolean,
      'food delivered': boolean
    }
  }