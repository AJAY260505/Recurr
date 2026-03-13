import { z } from 'zod';

import { groupedServices } from '@/data/subscriptions';

const allLogos = groupedServices.flatMap((group) =>
  group.services.map((service) => service.image)
);

export const subscriptionSchema = z
  .object({
    name: z
      .string()
      .min(1, {
        message: 'Subscription name is required.',
      })
      .max(50, {
        message:
          'Subscription name is a bit too long. Keep it short and sweet.',
      }),
    image: z.string().optional(),
    price: z.number().min(0, { message: 'Price cannot be negative.' }),
    interval: z.enum(['monthly', 'quarterly', 'yearly']),
    isOngoing: z.boolean(),
    startDate: z.date(),
    endDate: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (data.image) {
        if (
          data.image === '/placeholder-logo.svg' ||
          allLogos.includes(data.image)
        ) {
          return true;
        }
        return z.string().url().safeParse(data.image).success;
      }
      return true;
    },
    {
      message: 'Please provide a valid URL.',
      path: ['image'],
    }
  )
  .refine(
    (data) => {
      if (!data.isOngoing && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'Subscription must have an end date if it is not ongoing.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate) {
        return data.startDate < data.endDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date.',
      path: ['endDate'],
    }
  );
