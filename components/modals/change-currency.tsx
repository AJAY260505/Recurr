import { useState } from 'react';
import { localeToCurrency, currencyToName, getCurrency, getExchangeRate } from '@/lib/currency';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandList, CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChangeCurrencyProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ChangeCurrency = ({ open, setOpen }: ChangeCurrencyProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [value, setValue] = useState(getCurrency());
  const [loading, setLoading] = useState(false);

  const { subscriptions, updateSubscription } = useSubscriptions();

  const allCurrencies = Array.from(
    new Set(Object.values(localeToCurrency))
  ).map((currency) => ({
    label: `${currencyToName[currency as keyof typeof currencyToName]} (${currency})`,
    value: currency,
  }));

  const handleSave = async () => {
    const fromCurrency = getCurrency();
    const toCurrency = value;

    if (fromCurrency === toCurrency) {
      localStorage.setItem('CURRENCY_PREFERENCE', value);
      setOpen(false);
      return;
    }

    setLoading(true);

    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency);

      for (const sub of subscriptions) {
        await updateSubscription(sub.id, {
          ...sub,
          price: parseFloat((sub.price * rate).toFixed(2)),
        });
      }

      // Save to localStorage
      localStorage.setItem('CURRENCY_PREFERENCE', toCurrency);

      // Save to Supabase so it persists across logins
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({ user_id: user.id, currency: toCurrency });
      }

      toast.success(`Converted all prices to ${toCurrency}`);
      setOpen(false);
      window.location.reload();
    } catch {
      toast.error('Failed to fetch exchange rate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change currency</DialogTitle>
          <DialogDescription>
            Pick a currency — all your subscription prices will be converted at
            the current exchange rate.
          </DialogDescription>
        </DialogHeader>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal>
          <PopoverTrigger>
            <>
              <Button
                variant="outline"
                aria-expanded={open}
                onClick={() => setIsPopoverOpen(true)}
                className="w-full justify-between"
              >
                {value
                  ? allCurrencies.find((c) => c.value === value)?.label
                  : 'Select currency'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
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
                          setIsPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === currency.value ? 'opacity-100' : 'opacity-0'
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
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {loading ? 'Converting...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};