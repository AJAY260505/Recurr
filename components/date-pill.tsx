'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { format, isToday } from 'date-fns';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

import { SubscriptionTooltipContent } from '@/components/subscription-tooltip-content';

import { cn } from '@/lib/utils';
import { Subscription } from '@/types/subscription';
import { EditSubscription } from '@/components/modals/edit-subscription';

interface DatePillProps {
  date: Date;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
  onAddSubscription: (date: Date) => void;
  onShowSubscriptionsSummary: (subscriptions: Subscription[]) => void;
}

export const DatePill = ({
  date,
  isCurrentMonth,
  subscriptions,
  onAddSubscription,
  onShowSubscriptionsSummary,
}: DatePillProps) => {
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);

  const renderSubscriptionImage = (subscription: Subscription) => {
    return (
      <Image
        src={subscription.image}
        width={40}
        height={40}
        alt={subscription.name}
        className="-translate-y-2.5 size-6 object-contain"
      />
    );
  };

  if (subscriptions.length) {
    return (
      <>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger>
              <div
                className={cn(
                  'text-center rounded-xl h-16 relative text-sm',
                  'flex items-center justify-center',
                  'cursor-pointer',
                  isCurrentMonth
                    ? 'bg-secondary/60'
                    : 'bg-transparent text-muted-foreground',
                  isToday(date) && 'border border-foreground/10',
                  'cursor-pointer hover:bg-secondary transition-colors'
                )}
                onClick={() => onShowSubscriptionsSummary(subscriptions)}
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {isCurrentMonth &&
                    subscriptions.length === 1 &&
                    renderSubscriptionImage(subscriptions[0])}
                  {isCurrentMonth && subscriptions.length > 1 && (
                    <div className="h-5 w-5 rounded-full text-xs bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center -translate-y-3">
                      {subscriptions.length}
                    </div>
                  )}
                </motion.div>
                <p className="absolute bottom-1 w-full">{format(date, 'd')}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="w-fit rounded-xl bg-secondary border-foreground/10 p-0"
            >
              <SubscriptionTooltipContent
                subscriptions={subscriptions}
                onEdit={(subscription) => {
                  setSubscriptionToEdit(subscription);
                }}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {subscriptionToEdit && (
          <EditSubscription
            subscriptionToEdit={subscriptionToEdit}
            open={subscriptionToEdit !== null}
            setSubscriptionToEdit={setSubscriptionToEdit}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        'text-center rounded-xl h-16 relative text-sm',
        'flex items-center justify-center',
        isCurrentMonth
          ? 'bg-secondary/60'
          : 'bg-transparent text-muted-foreground',
        isToday(date) && 'border border-foreground/10',
        'cursor-pointer hover:bg-secondary transition-colors'
      )}
      onClick={() => onAddSubscription(date)}
    >
      <p className="absolute bottom-1 w-full">{format(date, 'd')}</p>
    </div>
  );
};
