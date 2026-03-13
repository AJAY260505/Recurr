'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { addDays, addMonths, addYears, differenceInDays, format, isWithinInterval } from 'date-fns';
import { Bell } from 'lucide-react';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { getCurrencySymbol } from '@/lib/currency';
import { Subscription } from '@/types/subscription';

function getNextRenewal(sub: Subscription): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(sub.startDate);
  current.setHours(0, 0, 0, 0);

  const end = sub.endDate ? new Date(sub.endDate) : null;

  // Advance to the next upcoming renewal date
  while (current < today) {
    switch (sub.interval) {
      case 'monthly':
        current = addMonths(current, 1);
        break;
      case 'quarterly':
        current = addMonths(current, 3);
        break;
      case 'yearly':
        current = addYears(current, 1);
        break;
    }
  }

  if (end && current > end) return null;
  return current;
}

export const UpcomingRenewals = () => {
  const { subscriptions } = useSubscriptions();
  const symbol = getCurrencySymbol();

  const renewals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = addDays(today, 7);

    return subscriptions
      .map((sub) => ({ sub, next: getNextRenewal(sub) }))
      .filter(({ next }) => next && isWithinInterval(next, { start: today, end: in7Days }))
      .sort((a, b) => a.next!.getTime() - b.next!.getTime());
  }, [subscriptions]);

  if (renewals.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header banner */}
      <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        <Bell className="size-4 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-500 font-medium">
          You have {renewals.length} renewal{renewals.length > 1 ? 's' : ''} this week
        </p>
      </div>

      {/* Renewal list */}
      <div className="flex flex-col gap-2">
        {renewals.map(({ sub, next }) => {
          const daysLeft = differenceInDays(next!, new Date());
          const isToday = daysLeft === 0;
          const isTomorrow = daysLeft === 1;

          const label = isToday
            ? 'Today'
            : isTomorrow
            ? 'Tomorrow'
            : `In ${daysLeft} days`;

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                  <Image
                    src={sub.image}
                    alt={sub.name}
                    width={20}
                    height={20}
                    className="object-contain size-5"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium truncate">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(next!, 'MMM d')} · {label}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <p className="text-sm font-medium">{symbol}{sub.price.toFixed(2)}</p>
                <p className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                  isToday
                    ? 'bg-red-500/15 text-red-500'
                    : isTomorrow
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};