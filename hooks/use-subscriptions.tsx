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

const mapRow = (d: Record<string, unknown>): Subscription => ({
  id: d.id as string,
  name: d.name as string,
  image: d.image as string,
  price: d.price as number,
  interval: d.interval as 'monthly' | 'quarterly' | 'yearly',
  startDate: new Date(d.start_date as string),
  endDate: d.end_date ? new Date(d.end_date as string) : null,
  isTrial: (d.is_trial as boolean) ?? false,
  trialEndDate: d.trial_end_date ? new Date(d.trial_end_date as string) : null,
  category: (d.category as string) ?? undefined,
  isShared: (d.is_shared as boolean) ?? false,
  sharedWith: (d.shared_with as number) ?? 2,
});

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
      set({ subscriptions: data.map(mapRow) });
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

    // Optimistic update
    set({ subscriptions: [subscription, ...get().subscriptions] });

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
      is_shared: subscription.isShared ?? false,
      shared_with: subscription.sharedWith ?? 2,
    });

    // Revert on error
    if (error) {
      set({ subscriptions: get().subscriptions.filter((s) => s.id !== subscription.id) });
    }
  },

  removeSubscription: async (id: string) => {
    const previous = get().subscriptions;

    // Optimistic update
    set({ subscriptions: previous.filter((s) => s.id !== id) });

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    // Revert on error
    if (error) {
      set({ subscriptions: previous });
    }
  },

  updateSubscription: async (id: string, subscription: Subscription) => {
    const previous = get().subscriptions;

    // Optimistic update
    set({
      subscriptions: previous.map((s) => s.id === id ? subscription : s),
    });

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
        is_shared: subscription.isShared ?? false,
        shared_with: subscription.sharedWith ?? 2,
      })
      .eq('id', id);

    // Revert on error
    if (error) {
      set({ subscriptions: previous });
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
      is_shared: s.isShared ?? false,
      shared_with: s.sharedWith ?? 2,
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