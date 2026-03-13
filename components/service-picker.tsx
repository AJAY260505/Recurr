import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { groupedServices, Service } from '@/data/subscriptions';
import { subscriptionSchema } from '@/schema/subscription';

interface ServicePickerProps {
  form: UseFormReturn<z.infer<typeof subscriptionSchema>>;
  onSelect: (service: Service) => void;
}

export const ServicePicker = ({ form, onSelect }: ServicePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="aspect-square p-0" type="button">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.watch('image') || '/placeholder-logo.svg'}
            alt="Service Logo"
            width={40}
            height={40}
            className="size-6 object-contain"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div className="aspect-square border rounded-md h-10 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={field.value || '/placeholder-logo.svg'}
                      alt="Service Logo"
                      className="size-6 object-contain"
                    />
                  </div>
                  <Input placeholder="Custom logo URL" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Square images / SVGs work best. Leave blank for a placeholder
                logo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator className="my-3" />
        <div className="grid grid-cols-5 gap-2">
          {groupedServices.map((group) =>
            group.services.map((service) => (
              <Button
                variant="outline"
                className="aspect-square p-0"
                key={service.name}
                onClick={() => onSelect(service)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.name}
                  width={40}
                  height={40}
                  className="size-6 object-contain"
                />
              </Button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
