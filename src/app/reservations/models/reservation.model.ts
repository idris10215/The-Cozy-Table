export interface Reservation {
  id?: number;
  name: string;
  email: string;
  date: string;
  time: string;
  phone: string;
  tableType: string;
  requests?: string;
  guests: number;
  
}