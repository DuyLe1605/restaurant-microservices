import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { useServiceRequests, useResolveServiceRequest, useDismissServiceRequest } from '@/hooks/use-service-requests';
import { ServiceRequest } from '@/api/service-request.api';
import { formatDateTime } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import {
  BellRing,
  Droplets,
  Shirt,
  Utensils,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  CALL_STAFF: {
    icon: <BellRing className="h-5 w-5" />,
    label: 'Gọi phục vụ',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  WATER: {
    icon: <Droplets className="h-5 w-5" />,
    label: 'Thêm nước',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  TOWEL: {
    icon: <Shirt className="h-5 w-5" />,
    label: 'Gọi khăn',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  EXTRA_UTENSIL: {
    icon: <Utensils className="h-5 w-5" />,
    label: 'Thêm dụng cụ',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  OTHER: {
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Yêu cầu khác',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-900/30',
  },
};

function getElapsed(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}ph trước`;
  return `${Math.floor(diff / 3600)}h trước`;
}

export function ServiceRequestsPage() {
  const [filter, setFilter] = React.useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const { data: requests = [], isLoading, refetch } = useServiceRequests(false);
  const resolveMutation = useResolveServiceRequest();
  const dismissMutation = useDismissServiceRequest();

  const filtered = React.useMemo(() => {
    if (filter === 'ALL') return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Yêu cầu Phục vụ"
        description="Các yêu cầu từ khách hàng qua QR – cập nhật tự động mỗi 5 giây"
        actions={
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center text-xs font-bold bg-rose-500 text-white rounded-full h-5 min-w-5 px-1.5 animate-pulse">
                {pendingCount}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              Tải lại
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 border-b">
        {([['PENDING', 'Đang chờ'], ['ALL', 'Tất cả'], ['RESOLVED', 'Đã xử lý']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              filter === val
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
            {val === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-rose-500 text-white rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          <p className="text-sm font-medium">
            {filter === 'PENDING' ? 'Không có yêu cầu nào đang chờ 🎉' : 'Không có dữ liệu'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((req) => (
            <ServiceRequestCard
              key={req.id}
              req={req}
              onResolve={() => resolveMutation.mutate(req.id)}
              onDismiss={() => dismissMutation.mutate(req.id)}
              isResolving={resolveMutation.isPending}
              isDismissing={dismissMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardProps {
  req: ServiceRequest;
  onResolve: () => void;
  onDismiss: () => void;
  isResolving: boolean;
  isDismissing: boolean;
}

function ServiceRequestCard({ req, onResolve, onDismiss, isResolving, isDismissing }: CardProps) {
  const cfg = TYPE_CONFIG[req.type] ?? TYPE_CONFIG.OTHER;
  const isPending = req.status === 'PENDING';
  const [elapsed, setElapsed] = React.useState(() => getElapsed(req.createdAt));

  React.useEffect(() => {
    if (!isPending) return;
    const id = setInterval(() => setElapsed(getElapsed(req.createdAt)), 10000);
    return () => clearInterval(id);
  }, [req.createdAt, isPending]);

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 flex items-center gap-4 shadow-sm transition-all',
        isPending
          ? 'bg-card border-border hover:shadow-md'
          : 'bg-muted/30 border-border/50 opacity-70'
      )}
    >
      <div className={cn('rounded-xl p-2.5 shrink-0', cfg.bg, cfg.color)}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm">{cfg.label}</span>
          <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
            Bàn {req.tableNumber}
          </span>
          {req.status === 'RESOLVED' && (
            <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full px-2 py-0.5">
              ✓ Đã xử lý
            </span>
          )}
          {req.status === 'DISMISSED' && (
            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full px-2 py-0.5">
              Đã bỏ qua
            </span>
          )}
        </div>
        {req.note && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">Ghi chú: {req.note}</p>
        )}
        <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{isPending ? elapsed : formatDateTime(req.createdAt)}</span>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
            onClick={onResolve}
            disabled={isResolving || isDismissing}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Xong
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-rose-600"
            onClick={onDismiss}
            disabled={isResolving || isDismissing}
          >
            <XCircle className="h-3.5 w-3.5" />
            Bỏ
          </Button>
        </div>
      )}
    </div>
  );
}
