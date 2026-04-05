import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Cell, PieChart, Pie,
} from 'recharts';
import { Trade } from '@/types/trade';
import { computeAdvancedStats } from '@/utils/advancedStats';

const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(0, 0%, 10%)',
  border: '1px solid hsl(0, 0%, 18%)',
  borderRadius: '8px',
  color: 'hsl(0, 0%, 95%)',
};

const COLORS = [
  'hsl(43, 74%, 49%)', 'hsl(200, 70%, 50%)', 'hsl(142, 71%, 45%)',
  'hsl(280, 60%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(30, 80%, 55%)',
  'hsl(170, 60%, 45%)', 'hsl(330, 60%, 55%)',
];

interface Props {
  trades: Trade[];
}

export function DrawdownChart({ trades }: Props) {
  const { drawdownCurve } = useMemo(() => computeAdvancedStats(trades), [trades]);
  if (drawdownCurve.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={drawdownCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
        <XAxis dataKey="trade" stroke="hsl(0, 0%, 55%)" fontSize={12} />
        <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} tickFormatter={v => `${v}R`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}R`, 'Drawdown']} />
        <Area type="monotone" dataKey="drawdown" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#ddGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceBarChart({ data, title }: { data: { name: string; totalR: number; count: number; winrate: number }[]; title: string }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
        <XAxis dataKey="name" stroke="hsl(0, 0%, 55%)" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
        <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} tickFormatter={v => `${v}R`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, name: string) => [`${v}R`, name === 'totalR' ? 'Performance' : name]} />
        <Bar dataKey="totalR" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.totalR >= 0 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GainVsPieChart({ trades }: Props) {
  const data = useMemo(() => {
    const gains = trades.filter(t => t.resultat === 'Gain');
    const losses = trades.filter(t => t.resultat === 'Perte');
    const totalGainR = gains.reduce((s, t) => s + t.rMultiple, 0);
    const totalLossR = losses.reduce((s, t) => s + Math.abs(t.rMultiple), 0);
    if (totalGainR === 0 && totalLossR === 0) return [];
    return [
      { name: 'Gains', value: Number(totalGainR.toFixed(2)) },
      { name: 'Pertes', value: Number(totalLossR.toFixed(2)) },
    ];
  }, [trades]);

  if (data.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
          <Cell fill="hsl(142, 71%, 45%)" />
          <Cell fill="hsl(0, 84%, 60%)" />
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}R`]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="flex items-center justify-center h-[200px] text-muted-foreground">Aucune donnée</div>;
}
