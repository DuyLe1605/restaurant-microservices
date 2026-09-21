import * as React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có bản ghi nào để hiển thị.',
  actionText,
  onAction,
  icon = <Inbox className="h-12 w-12 text-muted-foreground/60" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[260px] p-8 text-center rounded-xl border border-dashed bg-muted/20">
      <div className="mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionText}
        </Button>
      )}
    </div>
  );
}
