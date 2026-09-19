import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog box */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {title && <h2 className="text-xl font-bold tracking-tight mb-1">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
