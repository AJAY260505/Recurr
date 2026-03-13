'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import MotionNumber from 'motion-number';

import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Subscription } from '@/types/subscription';
import { getCurrency, getCurrencySymbol } from '@/lib/currency';

interface MonthlyCostProps {
  value: number;
  subscriptions: Subscription[];
  month: Date;
}

interface DonutSegment {
  subscription: Subscription;
  startAngle: number;
  endAngle: number;
  x: number;
  y: number;
}

const DONUT_RADIUS = 80;
const INNER_RADIUS = 52;
const CENTER = 110;
const ICON_ORBIT = 104;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

function buildSegments(subscriptions: Subscription[], total: number): DonutSegment[] {
  let angle = 0;
  return subscriptions.map((sub) => {
    const slice = total > 0 ? (sub.price / total) * 360 : 360 / subscriptions.length;
    const mid = angle + slice / 2;
    const pos = polarToCartesian(CENTER, CENTER, ICON_ORBIT, mid);
    const seg = { subscription: sub, startAngle: angle, endAngle: angle + slice, x: pos.x, y: pos.y };
    angle += slice;
    return seg;
  });
}

const DonutChart = ({ subscriptions, total, month }: { subscriptions: Subscription[]; total: number; month: Date }) => {
  const segments = buildSegments(subscriptions, total);
  const symbol = getCurrencySymbol();

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
    '#f43f5e', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#818cf8',
  ];

  return (
    <svg width={CENTER * 2} height={CENTER * 2 + 24} viewBox={`0 0 ${CENTER * 2} ${CENTER * 2 + 24}`}>
      {/* Track ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={DONUT_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={28}
      />

      {/* Segments */}
      {subscriptions.length === 1 ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={DONUT_RADIUS}
          fill="none"
          stroke={colors[0]}
          strokeWidth={28}
          strokeLinecap="round"
        />
      ) : (
        segments.map((seg, i) => (
          <path
            key={seg.subscription.id}
            d={describeArc(CENTER, CENTER, DONUT_RADIUS, seg.startAngle, seg.endAngle - 2)}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={28}
            strokeLinecap="round"
          />
        ))
      )}

      {/* Center text */}
      <text
        x={CENTER}
        y={CENTER - 8}
        textAnchor="middle"
        fontSize="9"
        fill="currentColor"
        opacity={0.5}
        fontFamily="inherit"
      >
        Monthly spend
      </text>
      <text
        x={CENTER}
        y={CENTER + 10}
        textAnchor="middle"
        fontSize="16"
        fontWeight="500"
        fill="currentColor"
        fontFamily="inherit"
      >
        {symbol}{total.toFixed(2)}
      </text>

      {/* Logos around ring */}
      {segments.map((seg) => (
        <foreignObject
          key={seg.subscription.id}
          x={seg.x - 10}
          y={seg.y - 10}
          width={20}
          height={20}
        >
          <div style={{ borderRadius: '50%', overflow: 'hidden', width: 20, height: 20, background: 'var(--color-background-secondary)' }}>
            <Image
              src={seg.subscription.image}
              alt={seg.subscription.name}
              width={20}
              height={20}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
        </foreignObject>
      ))}
    </svg>
  );
};

export const MonthlyCost = ({ value, subscriptions, month }: MonthlyCostProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={isHovered} onOpenChange={setIsHovered}>
        <TooltipTrigger
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MotionNumber
              value={value}
              format={{ style: 'currency', currency: getCurrency(), currencyDisplay: 'narrowSymbol' }}
            />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="rounded-2xl bg-background border-foreground/10 p-0 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {subscriptions.length > 0 ? (
              <motion.div
                key="donut"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col items-center p-4"
              >
                <DonutChart subscriptions={subscriptions} total={value} month={month} />
                <div className="w-full mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {subscriptions.map((sub, i) => {
                    const colors = [
                      '#6366f1','#8b5cf6','#a855f7','#ec4899',
                      '#f43f5e','#f97316','#eab308','#22c55e',
                      '#14b8a6','#06b6d4','#3b82f6','#818cf8',
                    ];
                    return (
                      <div key={sub.id} className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
                          <Image src={sub.image} alt={sub.name} width={14} height={14} className="size-3.5 object-contain" />
                          <p className="text-xs">{sub.name}</p>
                        </div>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {getCurrencySymbol()}{sub.price}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm px-4 py-3"
              >
                No subscriptions this month
              </motion.p>
            )}
          </AnimatePresence>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};