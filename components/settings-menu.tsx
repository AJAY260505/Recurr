'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
  Settings,
  Sun,
  Moon,
  Download,
  Upload,
  Keyboard,
  XIcon,
  DollarSign,
} from 'lucide-react';
import { useOs, useHotkeys } from '@mantine/hooks';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

import { KeyboardShortcuts } from '@/components/modals/keyboard-shortcuts';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Subscription } from '@/types/subscription';
import { ChangeCurrency } from './modals/change-currency';

export const SettingsMenu = () => {
  const { theme, setTheme } = useTheme();

  const { exportSubscriptions, importSubscriptions } = useSubscriptions();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useHotkeys([['alt+t', toggleTheme]]);

  const os = useOs();
  const isMac = os === 'macos' || os === 'ios';

  const [isKeyboardShortcutsModalOpen, setIsKeyboardShortcutsModalOpen] =
    useState(false);

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();

    try {
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast.error('Imported data is invalid', {
          description: 'Please ensure the data is in the correct format',
        });
        return;
      }

      const validatedSubscriptions = data.filter((sub: Subscription) => {
        if (
          !sub.id ||
          !sub.name ||
          sub.price === undefined ||
          sub.price === null ||
          !sub.startDate ||
          !sub.interval
        ) {
          toast.error(`${sub.name} is missing required fields`, {
            description: 'Please ensure all fields are present',
          });
          return false;
        }

        if (
          typeof sub.id !== 'string' ||
          typeof sub.name !== 'string' ||
          typeof sub.price !== 'number' ||
          isNaN(new Date(sub.startDate).getTime()) ||
          !['monthly', 'quarterly', 'yearly'].includes(sub.interval)
        ) {
          toast.error(`Invalid data types in subscription: ${sub.name}`);
          return false;
        }

        if (sub.endDate && isNaN(new Date(sub.endDate).getTime())) {
          toast.error(`Invalid end date in subscription: ${sub.name}`);
          return false;
        }

        return true;
      });

      importSubscriptions(validatedSubscriptions);
    } catch (error) {
      toast.error('Error importing data: ' + (error as Error).message);
    }

    importSubscriptions(JSON.parse(text));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const [isChangeCurrencyModalOpen, setIsChangeCurrencyModalOpen] =
    useState(false);

  return (
    <>
      <input
        type="file"
        onChange={importData}
        hidden
        accept="application/json"
        ref={inputRef}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline">
            <Settings className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={10}>
          <DropdownMenuLabel>
            Recurr
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === 'light' ? (
                <Sun className="size-4 mr-2" />
              ) : (
                <Moon className="size-4 mr-2" />
              )}
              <span>Toggle theme</span>
              <DropdownMenuShortcut>
                {isMac ? '⌥T' : 'Alt+T'}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsChangeCurrencyModalOpen(true)}
            >
              <DollarSign className="size-4 mr-2" />
              <span>Change currency</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsKeyboardShortcutsModalOpen(true)}
            >
              <Keyboard className="size-4 mr-2" />
              <span>Keyboard shortcuts</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => inputRef.current?.click()}>
              <Upload className="size-4 mr-2" />
              <span>Import data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportSubscriptions}>
              <Download className="size-4 mr-2" />
              <span>Export data</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <KeyboardShortcuts
        open={isKeyboardShortcutsModalOpen}
        setOpen={setIsKeyboardShortcutsModalOpen}
      />
      <ChangeCurrency
        open={isChangeCurrencyModalOpen}
        setOpen={setIsChangeCurrencyModalOpen}
      />
    </>
  );
};