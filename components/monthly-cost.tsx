import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import MotionNumber from 'motion-number';

import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Subscription } from '@/types/subscription';
import { getCurrency, getCurrencySymbol } from '@/lib/currency';

interface MonthlyCostProps {
  value: number;
  subscriptions: Subscription[];
  month: Date;
}

export const MonthlyCost = ({
  value,
  subscriptions,
  month,
}: MonthlyCostProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MotionNumber
              value={value}
              format={{
                style: 'currency',
                currency: getCurrency(),
                currencyDisplay: 'narrowSymbol',
              }}
            />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="w-fit rounded-xl bg-background border-foreground/10 p-0"
        >
          <h2 className="border-b border-foreground/10 py-3 px-3 font-medium">
            Total cost this month
          </h2>
          <ScrollArea className="max-h-60 overflow-y-auto">
            <div className="flex flex-col gap-3 px-3 py-3">
              {subscriptions.length > 0 ? (
                subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between gap-12"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Image
                          src={subscription.image as string}
                          width={40}
                          height={40}
                          alt={subscription.name}
                          className="size-4 object-contain"
                        />
                        <p>{subscription.name}</p>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {format(subscription.startDate, 'do')}{' '}
                        {format(month, 'MMMM')}
                      </p>
                    </div>
                    <div className="flex flex-col text-right">
                      <p className="font-medium text-emerald-700 dark:text-emerald-500">
                        {getCurrencySymbol()}
                        {subscription.price}
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        {((subscription.price / value) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No subscriptions this month
                </p>
              )}
            </div>
          </ScrollArea>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
