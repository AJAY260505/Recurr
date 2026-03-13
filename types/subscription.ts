export interface Subscription {
  id: string;
  name: string;
  image: string;
  startDate: Date;
  // null endDate if the subscription is still active
  endDate: Date | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  subscriptionId: string;
}
