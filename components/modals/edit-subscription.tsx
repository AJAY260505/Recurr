'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
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
} from '@/components/ui/drawer';

import { SubscriptionForm } from '@/components/forms/SubscriptionForm';

import { subscriptionSchema } from '@/schema/subscription';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Subscription } from '@/types/subscription';
import { useMediaQuery } from '@/hooks/use-media-query';

interface EditSubscriptionProps {
  subscriptionToEdit: Subscription;
  setSubscriptionToEdit: (subscription: Subscription | null) => void;
  open: boolean;
}

export const EditSubscription = ({
  subscriptionToEdit,
  open,
  setSubscriptionToEdit,
}: EditSubscriptionProps) => {
  const { updateSubscription } = useSubscriptions();

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: subscriptionToEdit.name,
      image: subscriptionToEdit.image,
      price: subscriptionToEdit.price,
      interval: subscriptionToEdit.interval,
      isOngoing: !subscriptionToEdit.endDate,
      startDate: new Date(subscriptionToEdit.startDate),
      endDate: subscriptionToEdit.endDate
        ? new Date(subscriptionToEdit.endDate)
        : null,
    },
  });

  function onSubmit(values: z.infer<typeof subscriptionSchema>) {
    updateSubscription(subscriptionToEdit.id, {
      ...subscriptionToEdit,
      name: values.name,
      image: values.image || '/placeholder-logo.svg',
      price: values.price,
      interval: values.interval,
      startDate: values.startDate,
      endDate: values.isOngoing ? null : values.endDate,
    });
    setSubscriptionToEdit(null);
  }

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSubscriptionToEdit(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
            <DialogDescription>
              Update your subscription details.
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm form={form} onSubmit={onSubmit} isEditing />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSubscriptionToEdit(null);
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit subscription</DrawerTitle>
          <DrawerDescription>
            Update your subscription details.
          </DrawerDescription>
        </DrawerHeader>
        <SubscriptionForm form={form} onSubmit={onSubmit} isDrawer isEditing />
      </DrawerContent>
    </Drawer>
  );
};
