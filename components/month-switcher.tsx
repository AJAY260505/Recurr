'use client';


import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MonthlyCost } from '@/components/monthly-cost';

import { useSubscriptions } from '@/hooks/use-subscriptions';

import { cn } from '@/lib/utils';

interface MonthSwitcherProps {
  month: Date;
  onPrevious: () => void;
  onNext: () => void;
  direction: number;
  budget: number | null;
}

export const MonthSwitcher = ({
  month,
  onPrevious,
  onNext,
  direction,
  budget,
}: MonthSwitcherProps) => {
  const slideVariants = {
    initial: (direction: number) => ({ y: direction * 20, opacity: 0 }),
    animate: { y: 0, opacity: 1 },
    exit: (direction: number) => ({ y: direction * -20, opacity: 0 }),
  };

  const { getMonthSubscriptions, subscriptions } = useSubscriptions();
  const monthSubscriptions = getMonthSubscriptions(month, subscriptions);

  const totalCost = monthSubscriptions.reduce(
    (total, subscription) => total + subscription.price,
    0
  );

  const pct = budget ? Math.min((totalCost / budget) * 100, 100) : 0;
  const isWarning = budget !== null && totalCost >= budget * 0.8;
  const isExceeded = budget !== null && totalCost > budget;

  return (
    <div className="flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <Button variant="ghost" size="icon" onClick={onPrevious}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNext}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.h2
              key={format(month, 'MMMM yyyy')}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              custom={direction}
              className="text-xl font-medium"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {format(month, 'MMMM')}
            </motion.h2>
            <motion.h2
              layout="position"
              transition={{ duration: 0.25 }}
              className="text-xl text-muted-foreground -ml-1"
            >
              {format(month, 'yyyy')}
            </motion.h2>
          </AnimatePresence>
        </div>
        <p className={cn('font-medium', isExceeded && 'text-red-500')}>
          <MonthlyCost
            value={totalCost}
            subscriptions={monthSubscriptions}
            month={month}
          />
        </p>
      </header>

      {/* Budget progress bar */}
      {budget !== null && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full transition-colors duration-300',
                isExceeded
                  ? 'bg-red-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className={cn(
              'text-[10px]',
              isExceeded ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-muted-foreground'
            )}>
              {isExceeded
                ? `${Math.round(pct)}% of budget exceeded`
                : `${Math.round(pct)}% of budget used`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Budget: {budget.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};