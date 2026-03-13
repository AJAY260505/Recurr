'use client';

import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { getBudget, setBudget } from '@/lib/budget';
import { getCurrencySymbol } from '@/lib/currency';

interface BudgetLimitProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (budget: number | null) => void;
}

export const BudgetLimit = ({ open, setOpen, onSave }: BudgetLimitProps) => {
  const symbol = getCurrencySymbol();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      const existing = getBudget();
      setValue(existing !== null ? String(existing) : '');
    }
  }, [open]);

  const handleSave = () => {
    const parsed = parseFloat(value);
    if (!value || isNaN(parsed) || parsed <= 0) {
      setBudget(null);
      onSave(null);
    } else {
      setBudget(parsed);
      onSave(parsed);
    }
    setOpen(false);
  };

  const handleRemove = () => {
    setBudget(null);
    onSave(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Monthly budget</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Set a monthly spending cap. You'll see a progress bar when approaching the limit.
          </p>
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="e.g. 500"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            StartIcon={<span className="text-muted-foreground text-sm">{symbol}</span>}
          />
          <div className="flex gap-2">
            {getBudget() !== null && (
              <Button variant="outline" className="flex-1" onClick={handleRemove}>
                Remove limit
              </Button>
            )}
            <Button className="flex-1" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};