'use client';

import { useMemo, useState } from 'react';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  getYear,
} from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import { useSubscriptions } from '@/hooks/use-subscriptions';
import { getCurrencySymbol } from '@/lib/currency';
import { groupedServices } from '@/data/subscriptions';
import { Subscription } from '@/types/subscription';

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4',
];

function getCategory(subscription: Subscription): string {
  for (const group of groupedServices) {
    const match = group.services.find(
      (s) => s.name.toLowerCase() === subscription.name.toLowerCase()
    );
    if (match) return group.group;
  }
  return 'Other';
}

function getMonthlyTotal(subscriptions: Subscription[], date: Date): number {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  return subscriptions
    .filter((sub) => {
      const start = new Date(sub.startDate);
      const end = sub.endDate ? new Date(sub.endDate) : null;
      return start <= monthEnd && (end === null || end >= monthStart);
    })
    .reduce((sum, sub) => {
      if (sub.interval === 'monthly') return sum + sub.price;
      if (sub.interval === 'quarterly') return sum + sub.price / 3;
      if (sub.interval === 'yearly') return sum + sub.price / 12;
      return sum;
    }, 0);
}

export const AnalyticsDashboard = () => {
  const { subscriptions } = useSubscriptions();
  const symbol = getCurrencySymbol();
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'yoy'>('trends');

  const now = new Date();
  const currentYear = getYear(now);
  const lastYear = currentYear - 1;

  const last12Months = useMemo(() => {
    return eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now,
    }).map((month) => ({
      label: format(month, 'MMM'),
      total: parseFloat(getMonthlyTotal(subscriptions, month).toFixed(2)),
    }));
  }, [subscriptions]);

  const currentMonthTotal = getMonthlyTotal(subscriptions, now);
  const lastMonthTotal = getMonthlyTotal(subscriptions, subMonths(now, 1));
  const diff = currentMonthTotal - lastMonthTotal;
  const diffPct = lastMonthTotal > 0 ? (diff / lastMonthTotal) * 100 : 0;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      const cat = getCategory(sub);
      const monthly =
        sub.interval === 'monthly' ? sub.price
        : sub.interval === 'quarterly' ? sub.price / 3
        : sub.price / 12;
      map[cat] = (map[cat] || 0) + monthly;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const yoyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const thisYearDate = new Date(currentYear, i, 1);
      const lastYearDate = new Date(lastYear, i, 1);
      return {
        label: format(thisYearDate, 'MMM'),
        [currentYear]: parseFloat(getMonthlyTotal(subscriptions, thisYearDate).toFixed(2)),
        [lastYear]: parseFloat(getMonthlyTotal(subscriptions, lastYearDate).toFixed(2)),
      };
    });
  }, [subscriptions, currentYear, lastYear]);

  const totalAnnual = last12Months.reduce((s, m) => s + m.total, 0);
  const avgMonthly = totalAnnual / 12;

  const tabs = [
    { key: 'trends', label: 'Trends' },
    { key: 'categories', label: 'Categories' },
    { key: 'yoy', label: 'Year vs year' },
  ] as const;

  if (subscriptions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 pb-8 w-full overflow-hidden">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="bg-secondary rounded-xl p-3 flex flex-col gap-1 min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground truncate">This month</p>
          <p className="font-medium text-sm truncate">{symbol}{currentMonthTotal.toFixed(2)}</p>
          <div className="flex items-center gap-1 min-w-0">
            {diff > 0 ? (
              <TrendingUp className="size-3 text-red-500 shrink-0" />
            ) : diff < 0 ? (
              <TrendingDown className="size-3 text-emerald-500 shrink-0" />
            ) : (
              <Minus className="size-3 text-muted-foreground shrink-0" />
            )}
            <p className={`text-[10px] truncate ${
              diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-muted-foreground'
            }`}>
              {diff === 0 ? 'No change' : `${Math.abs(diffPct).toFixed(1)}%`}
            </p>
          </div>
        </div>

        <div className="bg-secondary rounded-xl p-3 flex flex-col gap-1 min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground truncate">Avg/month</p>
          <p className="font-medium text-sm truncate">{symbol}{avgMonthly.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground truncate">12 months</p>
        </div>

        <div className="bg-secondary rounded-xl p-3 flex flex-col gap-1 min-w-0 overflow-hidden">
          <p className="text-xs text-muted-foreground truncate">Annual</p>
          <p className="font-medium text-sm truncate">{symbol}{totalAnnual.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground truncate">Projected</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs py-1.5 rounded-lg transition-all truncate ${
              activeTab === tab.key
                ? 'bg-background text-foreground font-medium shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-secondary rounded-xl p-4 w-full overflow-hidden">
        {activeTab === 'trends' && (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Monthly spend — last 12 months
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last12Months} barSize={14}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs">
                        <p className="font-medium">{symbol}{payload[0].value}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Monthly spend by category
            </p>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <div className="flex flex-col gap-3">
                {categoryData.map((cat, i) => {
                  const pct = totalAnnual > 0
                    ? ((cat.value * 12) / totalAnnual) * 100
                    : 0;
                  return (
                    <div key={cat.name} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="size-2 rounded-full shrink-0"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          <p className="text-xs truncate">{cat.name}</p>
                        </div>
                        <p className="text-xs font-medium shrink-0">
                          {symbol}{cat.value.toFixed(2)}
                          <span className="text-muted-foreground">/mo</span>
                        </p>
                      </div>
                      <div className="h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'yoy' && (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {currentYear} vs {lastYear}
            </p>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-indigo-500" />
                <p className="text-xs text-muted-foreground">{currentYear}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-violet-300" />
                <p className="text-xs text-muted-foreground">{lastYear}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={yoyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs flex flex-col gap-1">
                        <p className="text-muted-foreground">{label}</p>
                        {payload.map((p) => (
                          <p key={p.dataKey} className="font-medium">
                            {p.dataKey}: {symbol}{p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={currentYear}
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={lastYear}
                  stroke="#c4b5fd"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};