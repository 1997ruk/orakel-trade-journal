import { useState, useMemo } from 'react';
import { Trade } from '@/types/trade';
import { WeeklyGoals as Goals, useWeeklyGoals } from '@/hooks/useWeeklyGoals';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Target, Settings2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  trades: Trade[];
}

const WeeklyGoalsPanel = ({ trades }: Props) => {
  const { goals, saveGoals } = useWeeklyGoals();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goals>(goals);

  const weekTrades = useMemo(() => {
    const now = new Date();
    const ws = startOfWeek(now, { weekStartsOn: 1 });
    const we = endOfWeek(now, { weekStartsOn: 1 });
    return trades.filter(t => {
      const d = new Date(t.date);
      return isWithinInterval(d, { start: ws, end: we });
    });
  }, [trades]);

  const weekStats = useMemo(() => {
    const total = weekTrades.length;
    const wins = weekTrades.filter(t => t.resultat === 'gain').length;
    const winrate = total > 0 ? (wins / total) * 100 : 0;
    const totalR = weekTrades.reduce((s, t) => s + t.r_multiple, 0);
    return { total, winrate, totalR };
  }, [weekTrades]);

  const pctTrades = goals.trades_target > 0 ? Math.min(100, (weekStats.total / goals.trades_target) * 100) : 0;
  const pctWinrate = goals.winrate_target > 0 ? Math.min(100, (weekStats.winrate / goals.winrate_target) * 100) : 0;
  const pctR = goals.r_target > 0 ? Math.min(100, (weekStats.totalR / goals.r_target) * 100) : 0;

  const handleSave = () => {
    saveGoals(draft);
    setEditing(false);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4 text-gold" /> Objectifs Hebdo
        </CardTitle>
        <Popover open={editing} onOpenChange={(o) => { setEditing(o); if (o) setDraft(goals); }}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <Settings2 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3 bg-card border-border">
            <p className="text-sm font-medium text-foreground">Configurer les objectifs</p>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Nombre de trades</label>
              <Input type="number" min={1} value={draft.trades_target} onChange={e => setDraft(d => ({ ...d, trades_target: +e.target.value }))} className="h-8 bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Winrate cible (%)</label>
              <Input type="number" min={0} max={100} value={draft.winrate_target} onChange={e => setDraft(d => ({ ...d, winrate_target: +e.target.value }))} className="h-8 bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">R cible</label>
              <Input type="number" step={0.5} value={draft.r_target} onChange={e => setDraft(d => ({ ...d, r_target: +e.target.value }))} className="h-8 bg-secondary border-border" />
            </div>
            <Button size="sm" onClick={handleSave} className="w-full gradient-gold text-primary-foreground gap-1">
              <Check className="w-3 h-3" /> Enregistrer
            </Button>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoalRow label="Trades" current={weekStats.total} target={goals.trades_target} pct={pctTrades} unit="" />
        <GoalRow label="Winrate" current={+weekStats.winrate.toFixed(1)} target={goals.winrate_target} pct={pctWinrate} unit="%" />
        <GoalRow label="Profit (R)" current={+weekStats.totalR.toFixed(2)} target={goals.r_target} pct={pctR} unit="R" />
      </CardContent>
    </Card>
  );
};

const GoalRow = ({ label, current, target, pct, unit }: { label: string; current: number; target: number; pct: number; unit: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">
        {current}{unit} / {target}{unit}
      </span>
    </div>
    <Progress value={pct} className="h-2" />
  </div>
);

export default WeeklyGoalsPanel;
