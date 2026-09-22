import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: string;
  trendPositive?: boolean;
}

export function StatsCard({ title, value, subtitle, icon, iconBg = 'bg-primary/10 text-primary', trend, trendPositive }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-all border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn('p-2.5 rounded-xl', iconBg)}>{icon}</div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-1">
              {trend && (
                <span className={cn('text-xs font-semibold', trendPositive ? 'text-emerald-600' : 'text-rose-600')}>
                  {trend}
                </span>
              )}
              {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
