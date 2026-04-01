import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, trend, subtitle, className }: StatCardProps) => {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-5 animate-fade-in transition-all hover:glow-gold",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-gold">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={cn(
          "text-2xl font-bold",
          trend === 'up' && 'text-profit',
          trend === 'down' && 'text-loss',
          !trend && 'text-foreground'
        )}>
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-foreground mb-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
