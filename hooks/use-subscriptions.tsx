import { create } from 'zustand';

import {
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  differenceInMonths,
  addMonths,
  addYears,
} from 'date-fns';

import { supabase } from '@/lib/supabase';
import { Subscription, Transaction } from '@/types/subscription';

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  fetchSubscriptions: () => Promise<void>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  getMonthSubscriptions: (date: Date, subscriptions: Subscription[]) => Subscription[];
  addSubscription: (subscription: Subscription) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
  updateSubscription: (id: string, subscription: Subscription) => Promise<void>;
  exportSubscriptions: () => void;
  importSubscriptions: (subscriptions: Subscription[]) => Promise<void>;
  getTransactionsTillDate: (subscription: Subscription | null) => Transaction[];
}

export const useSubscriptions = create<SubscriptionState>((set, get) => ({
  subscriptions: [],
  loading: false,

  fetchSubscriptions: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: Subscription[] = data.map((d) => ({
        id: d.id,
        name: d.name,
        image: d.image,
        price: d.price,
        interval: d.interval,
        startDate: new Date(d.start_date),
        endDate: d.end_date ? new Date(d.end_date) : null,
        isTrial: d.is_trial ?? false,
        trialEndDate: d.trial_end_date ? new Date(d.trial_end_date) : null,
        category: d.category ?? undefined,
      }));
      set({ subscriptions: mapped });
    }
    set({ loading: false });
  },

  setSubscriptions: (subscriptions) => set({ subscriptions }),

  getMonthSubscriptions: (date: Date, subscriptions: Subscription[]) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return subscriptions.filter((subscription) => {
      const subscriptionStart = new Date(subscription.startDate);
      const subscriptionEnd = subscription.endDate
        ? new Date(subscription.endDate)
        : null;

      const isStarted = subscriptionStart <= monthEnd;
      const isActive = subscriptionEnd === null || subscriptionEnd >= monthStart;

      if (!isStarted || !isActive) return false;

      const monthsSinceStart = differenceInMonths(date, subscription.startDate);

      switch (subscription.interval) {
        case 'monthly':
          return true;
        case 'quarterly':
          return monthsSinceStart % 3 === 0;
        case 'yearly':
          return monthsSinceStart % 12 === 0;
        default:
          return isWithinInterval(date, {
            start: subscription.startDate,
            end: subscription.endDate || new Date(9999, 11, 31),
          });
      }
    });
  },

  addSubscription: async (subscription: Subscription) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('subscriptions').insert({
      id: subscription.id,
      user_id: user.id,
      name: subscription.name,
      image: subscription.image,
      price: subscription.price,
      interval: subscription.interval,
      start_date: subscription.startDate,
      end_date: subscription.endDate ?? null,
      is_trial: subscription.isTrial ?? false,
      trial_end_date: subscription.trialEndDate ?? null,
      category: subscription.category ?? null,
    });

    if (!error) {
      set({ subscriptions: [...get().subscriptions, subscription] });
    }
  },

  removeSubscription: async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (!error) {
      set({
        subscriptions: get().subscriptions.filter((s) => s.id !== id),
      });
    }
  },

  updateSubscription: async (id: string, subscription: Subscription) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        name: subscription.name,
        image: subscription.image,
        price: subscription.price,
        interval: subscription.interval,
        start_date: subscription.startDate,
        end_date: subscription.endDate ?? null,
        is_trial: subscription.isTrial ?? false,
        trial_end_date: subscription.trialEndDate ?? null,
        category: subscription.category ?? null,
      })
      .eq('id', id);

    if (!error) {
      set({
        subscriptions: get().subscriptions.map((s) =>
          s.id === id ? subscription : s
        ),
      });
    }
  },

  exportSubscriptions: () => {
    const subscriptions = get().subscriptions;
    const json = JSON.stringify(subscriptions);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importSubscriptions: async (subscriptions: Subscription[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('subscriptions').delete().eq('user_id', user.id);

    const rows = subscriptions.map((s) => ({
      id: s.id,
      user_id: user.id,
      name: s.name,
      image: s.image,
      price: s.price,
      interval: s.interval,
      start_date: s.startDate,
      end_date: s.endDate ?? null,
      is_trial: s.isTrial ?? false,
      trial_end_date: s.trialEndDate ?? null,
      category: s.category ?? null,
    }));

    const { error } = await supabase.from('subscriptions').insert(rows);
    if (!error) set({ subscriptions });
  },

  getTransactionsTillDate: (subscription: Subscription | null) => {
    if (!subscription) return [];

    const transactions: Transaction[] = [];
    const today = new Date();
    let currentDate = new Date(subscription.startDate);
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

    while (currentDate <= today && (!endDate || currentDate <= endDate)) {
      transactions.push({
        id: crypto.randomUUID(),
        amount: subscription.price,
        date: new Date(currentDate),
        subscriptionId: subscription.id,
      });

      switch (subscription.interval) {
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'quarterly':
          currentDate = addMonths(currentDate, 3);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, 1);
          break;
        default:
          throw new Error(`Unknown interval: ${subscription.interval}`);
      }
    }

    return transactions;
  },
}));