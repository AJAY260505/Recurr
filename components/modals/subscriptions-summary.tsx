'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { formatDate } from 'date-fns';

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Subscription } from '@/types/subscription';

import { getCurrencySymbol } from '@/lib/currency';

interface SubscriptionsSummaryProps {
  open: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

export const SubscriptionsSummary = ({
  open,
  onClose,
  subscriptions,
}: SubscriptionsSummaryProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Billed transactions</DialogTitle>
            <DialogDescription>
              A quick overview of your subscription spends till date
            </DialogDescription>
          </DialogHeader>
          <Summary subscriptions={subscriptions} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Billed transactions</DrawerTitle>
          <DrawerDescription>
            A quick overview of your subscription spends till date
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-3">
          <Summary subscriptions={subscriptions} isDrawer />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const Summary = ({
  subscriptions,
}: {
  subscriptions: Subscription[];
  isDrawer?: boolean;
}) => {
  const { getTransactionsTillDate } = useSubscriptions();

  const [currentSubscription, setCurrentSubscription] = useState(
    subscriptions[0]
  );

  const transactions = getTransactionsTillDate(currentSubscription);

  useEffect(() => {
    setCurrentSubscription(subscriptions[0]);
  }, [subscriptions]);

  const totalCost = useMemo(() => {
    if (!transactions) return 0;
    return transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
  }, [transactions]);

  if (!subscriptions.length) return null;

  return (
    <div className="flex flex-col py-3 gap-8">
      {subscriptions.length > 1 && (
        <Tabs
          defaultValue={subscriptions[0].id}
          value={currentSubscription?.id}
          onValueChange={(value) => {
            const subscription = subscriptions.find((s) => s.id === value);
            if (subscription) {
              setCurrentSubscription(subscription);
            }
          }}
        >
          <ScrollArea className="flex w-full">
            <TabsList className="flex">
              {subscriptions.map((subscription) => (
                <TabsTrigger
                  key={subscription.id}
                  value={subscription.id}
                  className="flex-1 min-w-12"
                >
                  <Image
                    src={subscription.image}
                    alt={subscription.name}
                    width={20}
                    height={20}
                    className="size-6 object-contain"
                  />
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={currentSubscription?.image ?? ''}
            alt={currentSubscription?.name ?? ''}
            width={28}
            height={28}
            className="size-7 object-contain"
          />
          <div className="flex flex-col">
            <p className="text-sm">{currentSubscription?.name}</p>
            <p className="text-muted-foreground text-xs">
              Started on{' '}
              {formatDate(
                currentSubscription?.startDate || new Date(),
                'MMM dd, yyyy'
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <p className="text-sm text-emerald-700 dark:text-emerald-500">
            {getCurrencySymbol()}
            {currentSubscription?.price}
          </p>
          <p className="text-muted-foreground text-xs">
            / {currentSubscription?.interval}
          </p>
        </div>
      </div>
      <ScrollArea className="max-h-[40vh] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Billed on</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {formatDate(transaction.date, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  {getCurrencySymbol()}
                  {transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right font-medium text-emerald-700 dark:text-emerald-500">
                {getCurrencySymbol()}
                {totalCost}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};
