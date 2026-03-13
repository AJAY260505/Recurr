'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { useHotkeys } from '@mantine/hooks';

import { CategoryFilter } from '@/components/category-filter';
import { DayPill } from '@/components/day-pill';
import { MonthSwitcher } from '@/components/month-switcher';
import { Calendar } from '@/components/calendar';
import { AddSubscription } from '@/components/modals/add-subscription';
import { AuthModal } from '@/components/modals/auth-modal';
import { SettingsMenu } from '@/components/settings-menu';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { UpcomingRenewals } from '@/components/upcoming-renewals';
import { supabase } from '@/lib/supabase';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { getBudget } from '@/lib/budget';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';

const Home = () => {
  const [monthToShow, setMonthToShow] = useState(new Date());
  const [direction, setDirection] = useState<0 | -1 | 1>(0);
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [budget, setBudget] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchSubscriptions = useSubscriptions((s) => s.fetchSubscriptions);
  const fetchRef = useRef(fetchSubscriptions);
  fetchRef.current = fetchSubscriptions;

  useEffect(() => {
    setBudget(getBudget());

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        // Restore currency preference from Supabase
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('currency')
          .eq('user_id', data.user.id)
          .single();

        if (prefs?.currency) {
          localStorage.setItem('CURRENCY_PREFERENCE', prefs.currency);
        }

        fetchRef.current();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Restore currency preference on auth state change too
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('currency')
          .eq('user_id', session.user.id)
          .single();

        if (prefs?.currency) {
          localStorage.setItem('CURRENCY_PREFERENCE', prefs.currency);
        }

        fetchRef.current();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const goToPreviousMonth = () => {
    setDirection(-1);
    setMonthToShow((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setDirection(1);
    setMonthToShow((prev) => addMonths(prev, 1));
  };

  const dates = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthToShow));
    const end = endOfWeek(endOfMonth(monthToShow));
    return eachDayOfInterval({ start, end });
  }, [monthToShow]);

  useHotkeys([
    ['ArrowLeft', goToPreviousMonth],
    ['ArrowRight', goToNextMonth],
    ['m', () => setMonthToShow(new Date())],
  ]);

  return (
    <div className="min-h-full flex flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <Image
          src="/logo.svg"
          alt="Recurr"
          width={100}
          height={100}
          className="mb-2 pointer-events-none"
        />
        <SettingsMenu
          isAuthenticated={!!user}
          onBudgetChange={(b) => setBudget(b)}
        />
      </div>

      <MonthSwitcher
        month={monthToShow}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        direction={direction}
        budget={budget}
      />

      <section className="flex flex-col gap-4">
        {user && (
          <CategoryFilter
            selected={categoryFilter}
            onChange={setCategoryFilter}
          />
        )}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <DayPill key={day}>{day}</DayPill>
          ))}
        </div>
        <Calendar
          dates={dates}
          monthToShow={monthToShow}
          direction={direction}
          isAuthenticated={!!user}
          onAuthRequired={() => setAuthModalOpen(true)}
          categoryFilter={categoryFilter}
        />
      </section>

      <AddSubscription
        onAuthRequired={() => setAuthModalOpen(true)}
        isAuthenticated={!!user}
      />

      {user && <UpcomingRenewals />}
      {user && <AnalyticsDashboard />}

      <AuthModal
        open={authModalOpen}
        setOpen={setAuthModalOpen}
        onSuccess={() => {
          setAuthModalOpen(false);
          fetchRef.current();
        }}
      />

      <div className="mb-6" />
    </div>
  );
};

export default Home;