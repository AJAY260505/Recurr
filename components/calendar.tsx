'use client';

import { useState, useEffect } from 'react';
import { isSameMonth, getDate } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import { DatePill } from '@/components/date-pill';
import { AddSubscriptionOnDate } from '@/components/modals/add-subscription-on-date';
import { SubscriptionsSummary } from '@/components/modals/subscriptions-summary';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Subscription } from '@/types/subscription';
import { oldToNewLogoMap } from '@/lib/migrate-logos';

interface CalendarProps {
  dates: Date[];
  monthToShow: Date;
  direction: number;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const Calendar = ({ dates, monthToShow, direction, isAuthenticated, onAuthRequired }: CalendarProps) => {
  const slideVariants = {
    initial: (direction: number) => ({
      y: direction * 40,
      opacity: 0,
    }),
    animate: { y: 0, opacity: 1 },
    exit: (direction: number) => ({
      y: direction * -40,
      opacity: 0,
    }),
  };

  const { getMonthSubscriptions, subscriptions, updateSubscription } =
    useSubscriptions();

  const monthSubscriptions = getMonthSubscriptions(monthToShow, subscriptions);

  const [dateToAddTo, setDateToAddTo] = useState<Date | null>(null);
  const [subscriptionToShow, setSubscriptionToShow] = useState<Subscription[]>([]);

  useEffect(() => {
    const migrateLogos = () => {
      const needsMigration =
        subscriptions.length > 0 && !localStorage.getItem('LOGO_MIGRATION_V1');

      if (!needsMigration) return;

      subscriptions.forEach((subscription) => {
        if (oldToNewLogoMap[subscription.image as keyof typeof oldToNewLogoMap]) {
          updateSubscription(subscription.id, {
            ...subscription,
            image: oldToNewLogoMap[subscription.image as keyof typeof oldToNewLogoMap],
          });
        }
      });

      localStorage.setItem('LOGO_MIGRATION_V1', 'true');
    };

    migrateLogos();
  }, [subscriptions, updateSubscription]);

  const handleAddSubscription = (date: Date) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setDateToAddTo(date);
  };

  return (
    <>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={monthToShow.toISOString()}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="grid grid-cols-7 gap-2"
        >
          {dates.map((date) => (
            <DatePill
              key={date.toISOString()}
              date={date}
              isCurrentMonth={isSameMonth(date, monthToShow)}
              subscriptions={monthSubscriptions.filter(
                (subscription) =>
                  getDate(subscription.startDate) === getDate(date)
              )}
              onAddSubscription={() => handleAddSubscription(date)}
              onShowSubscriptionsSummary={(subscription) =>
                setSubscriptionToShow(subscription)
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <AddSubscriptionOnDate
        open={!!dateToAddTo}
        onClose={() => setDateToAddTo(null)}
        dateToAddTo={dateToAddTo || new Date()}
        isAuthenticated={isAuthenticated}
        onAuthRequired={onAuthRequired}
      />
      <SubscriptionsSummary
        open={!!subscriptionToShow.length}
        onClose={() => setSubscriptionToShow([])}
        subscriptions={subscriptionToShow}
      />
    </>
  );
};