'use client';

import { useState, useEffect } from 'react';

import { useOs } from '@mantine/hooks';

interface KbdProps {
  keys: string[];
}

export const Kbd = ({ keys }: KbdProps) => {
  const os = useOs();
  const isMacOS = os === 'macos' || os === 'ios';

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const renderKeys = keys.map((key) => {
    switch (key) {
      case 'mod':
        return isMacOS ? (
          <p className="text-sm">⌘</p>
        ) : (
          <p className="text-sm">Ctrl</p>
        );
      case 'shift':
        return <span>↑</span>;
      case 'ArrowRight':
        return <span>→</span>;
      case 'ArrowLeft':
        return <span>←</span>;
      case 'alt':
        return isMacOS ? <span>⌥</span> : <span>Alt</span>;
      default:
        return key;
    }
  });

  return (
    <div className="p-1 flex itesm-center gap-0.5 rounded-md bg-muted border border-foreground/10 text-sm">
      {renderKeys}
    </div>
  );
};
