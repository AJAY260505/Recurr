export interface Subscription {
  id: string;
  name: string;
  image: string;
  startDate: Date;
  endDate: Date | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
  isTrial?: boolean;
  trialEndDate?: Date | null;
  category?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  subscriptionId: string;
}