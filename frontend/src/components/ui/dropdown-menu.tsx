import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end' | 'center';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'end', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const alignClass = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[align];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        data-state={isOpen ? 'open' : 'closed'}
        className="cursor-pointer inline-flex"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[160px] rounded-xl border bg-popover/95 backdrop-blur-md p-1.5 text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 focus:outline-none dark:border-border/80',
            alignClass,
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            role="menu"
            aria-orientation="vertical"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  className?: string;
}

export function DropdownMenuItem({
  children,
  icon,
  onClick,
  disabled = false,
  variant = 'default',
  className,
}: DropdownMenuItemProps) {
  const variantStyles = {
    default: 'text-foreground hover:bg-muted focus:bg-muted',
    danger: 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50',
    success: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 focus:bg-emerald-50',
    warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 focus:bg-amber-50',
  }[variant];

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 text-left',
        variantStyles,
        className
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('-mx-1 my-1 h-px bg-border/60', className)} />;
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground', className)}>
      {children}
    </div>
  );
}
