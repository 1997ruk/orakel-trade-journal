import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Trade } from '@/types/trade';
import { cn } from '@/lib/utils';

interface TradeCalendarProps {
  trades: Trade[];
}

const TradeCalendar = ({ trades }: TradeCalendarProps) => {
  const { winDays, lossDays, mixedDays } = useMemo(() => {
    const dayMap = new Map<string, { gains: number; losses: number }>();
    trades.forEach(t => {
      const key = t.date.slice(0, 10);
      const entry = dayMap.get(key) || { gains: 0, losses: 0 };
      if (t.resultat === 'Gain') entry.gains++;
      else entry.losses++;
      dayMap.set(key, entry);
    });

    const win: Date[] = [];
    const loss: Date[] = [];
    const mixed: Date[] = [];
    dayMap.forEach((v, k) => {
      const d = new Date(k + 'T00:00:00');
      if (v.gains > 0 && v.losses > 0) mixed.push(d);
      else if (v.gains > 0) win.push(d);
      else loss.push(d);
    });
    return { winDays: win, lossDays: loss, mixedDays: mixed };
  }, [trades]);

  const modifiers = { win: winDays, loss: lossDays, mixed: mixedDays };
  const modifiersClassNames = {
    win: 'bg-profit/20 text-profit font-semibold',
    loss: 'bg-loss/20 text-loss font-semibold',
    mixed: 'bg-gold/20 text-gold font-semibold',
  };

  return (
    <div className="flex flex-col items-center">
      <Calendar
        mode="single"
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className={cn("p-3 pointer-events-auto")}
      />
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-profit" />
          <span className="text-xs text-muted-foreground">Gain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-loss" />
          <span className="text-xs text-muted-foreground">Perte</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gold" />
          <span className="text-xs text-muted-foreground">Mixte</span>
        </div>
      </div>
    </div>
  );
};

export default TradeCalendar;
