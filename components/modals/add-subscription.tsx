'use client';

import { useState } from 'react';
import { z } from 'zod';
import { CalendarPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHotkeys } from '@mantine/hooks';

import { Button } from '@/components/ui/button';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { subscriptionSchema } from '@/schema/subscription';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useMediaQuery } from '@/hooks/use-media-query';

interface AddSubscriptionProps {
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const AddSubscription = ({ isAuthenticated, onAuthRequired }: AddSubscriptionProps) => {
  const { addSubscription } = useSubscriptions();

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      image: '',
      price: 0,
      interval: 'monthly',
      isOngoing: true,
      startDate: new Date(),
      endDate: null,
    },
  });

  function onSubmit(values: z.infer<typeof subscriptionSchema>) {
    addSubscription({
      id: crypto.randomUUID(),
      name: values.name,
      image: values.image || '/placeholder-logo.svg',
      price: values.price,
      interval: values.interval,
      startDate: values.startDate,
      endDate: values.isOngoing ? null : values.endDate,
    });
    form.reset();
    setOpen(false);
  }

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    setOpen(true);
  };

  useHotkeys([['mod+a', handleOpen]]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="my-4" variant="outline" onClick={handleOpen}>
            <CalendarPlus className="size-4 mr-2" />
            Add subscription
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add subscription</DialogTitle>
            <DialogDescription>
              Fill in your subscription details to start tracking them.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm form={form} onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="my-4" variant="outline" onClick={handleOpen}>
          <CalendarPlus className="size-4 mr-2" />
          Add subscription
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add subscription</DrawerTitle>
          <DrawerDescription>
            Fill in your subscription details to start tracking them.
          </DrawerDescription>
        </DrawerHeader>
        <SubscriptionForm form={form} onSubmit={onSubmit} isDrawer />
      </DrawerContent>
    </Drawer>
  );
};