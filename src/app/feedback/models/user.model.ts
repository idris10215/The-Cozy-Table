export class Feedback {
  public id?: any;
  uId: any;
  name: string = "";
  email: string = "";
  phone: string = "";
  address: string = "";
  feedback: string = "";
  rating: number = 0;
  static invalid: any;
  // replies?: any;
  replies?: { message: string; timestamp: string }[];
  showReplies: any;
  hasReplied: any;

  
  
  // static id: any;
}
