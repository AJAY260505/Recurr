'use client';

import { cn } from '@/lib/utils';

const CATEGORIES = [
  'All',
  'Entertainment',
  'Work & Productivity',
  'Health & Fitness',
  'Education',
  'Finance',
  'Shopping',
  'Food & Drink',
  'Travel',
  'News & Media',
  'Software & Tools',
  'Gaming',
  'Other',
];

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto w-full"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all',
            selected === cat
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};