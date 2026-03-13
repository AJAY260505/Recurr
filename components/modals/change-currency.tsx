import { useState } from 'react';

import { localeToCurrency, currencyToName, getCurrency } from '@/lib/currency';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ChangeCurrencyProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ChangeCurrency = ({ open, setOpen }: ChangeCurrencyProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [value, setValue] = useState(getCurrency());

  const allCurrencies = Array.from(
    new Set(Object.values(localeToCurrency))
  ).map((currency) => ({
    label: `${
      currencyToName[currency as keyof typeof currencyToName]
    } (${currency})`,
    value: currency,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change currency</DialogTitle>
          <DialogDescription>
            Pick a currency to use for your subscriptions
          </DialogDescription>
        </DialogHeader>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal>
          <PopoverTrigger>
            <>
              <Button
                variant="outline"
                aria-expanded={open}
                onClick={() => {
                  setIsPopoverOpen(true);
                }}
                className="w-full justify-between"
              >
                {value
                  ? allCurrencies.find((currency) => currency.value === value)
                      ?.label
                  : 'Select currency'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
              <p className="text-sm text-muted-foreground text-left mt-2">
                A refresh is required for the changes to take effect.
              </p>
            </>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search currency..." />
              <CommandList className="h-40">
                <CommandEmpty>No currency found.</CommandEmpty>
                <ScrollArea className="h-64">
                  <CommandGroup>
                    {allCurrencies.map((currency) => (
                      <CommandItem
                        key={currency.value}
                        value={currency.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? '' : currentValue);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === currency.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {currency.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <DialogFooter>
          <Button
            onClick={() => {
              localStorage.setItem('CURRENCY_PREFERENCE', value);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
