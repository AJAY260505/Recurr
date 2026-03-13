import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface KeyboardShortcutsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const KeyboardShortcuts = ({
  open,
  setOpen,
}: KeyboardShortcutsProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Here are all the keyboard shortcuts for the app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Add subscription</p>
            <Kbd keys={['mod', 'A']} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Previous month</p>
            <Kbd keys={['ArrowLeft']} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Next month</p>
            <Kbd keys={['ArrowRight']} />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Go to current month</p>
            <Kbd keys={['M']} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
