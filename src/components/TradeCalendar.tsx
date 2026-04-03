import { useMemo, useState } from 'react';
import { Trade } from '@/types/trade';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradeCalendarProps {
  trades: Trade[];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const TradeCalendar = ({ trades }: TradeCalendarProps) => {
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();

  const tradeMap = useMemo(() => {
    const map = new Map<string, { gains: number; losses: number; net: number }>();
    trades.forEach((t) => {
      const key = t.date.slice(0, 10); // YYYY-MM-DD
      const prev = map.get(key) || { gains: 0, losses: 0, net: 0 };
      if (t.resultat === 'Gain') {
        prev.gains += 1;
        prev.net += t.rMultiple;
      } else {
        prev.losses += 1;
        prev.net -= Math.abs(t.rMultiple);
      }
      map.set(key, prev);
    });
    return map;
  }, [trades]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={prev} className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={next} className="h-7 w-7 text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const info = tradeMap.get(dateStr);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          let bg = '';
          let textColor = 'text-muted-foreground';
          let title = '';

          if (info) {
            if (info.net > 0) {
              bg = 'bg-profit/20 border border-profit/40';
              textColor = 'text-profit font-semibold';
            } else if (info.net < 0) {
              bg = 'bg-loss/20 border border-loss/40';
              textColor = 'text-loss font-semibold';
            } else {
              bg = 'bg-muted border border-border';
              textColor = 'text-foreground font-semibold';
            }
            title = `${info.gains}G / ${info.losses}P • Net: ${info.net >= 0 ? '+' : ''}${info.net.toFixed(1)}R`;
          }

          return (
            <div
              key={dateStr}
              title={title}
              className={`
                relative aspect-square flex items-center justify-center rounded-md text-xs cursor-default transition-colors
                ${bg}
                ${textColor}
                ${isToday && !info ? 'ring-1 ring-gold/50' : ''}
              `}
            >
              {day}
              {info && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-profit/30 border border-profit/50" />
          <span className="text-[10px] text-muted-foreground">Gain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-loss/30 border border-loss/50" />
          <span className="text-[10px] text-muted-foreground">Perte</span>
        </div>
      </div>
    </div>
  );
};

export default TradeCalendar;
