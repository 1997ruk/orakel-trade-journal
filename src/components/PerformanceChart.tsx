import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trade } from '@/types/trade';

interface PerformanceChartProps {
  trades: Trade[];
}

const PerformanceChart = ({ trades }: PerformanceChartProps) => {
  const data = useMemo(() => {
    if (trades.length === 0) return [];
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    return sorted.map((t, i) => {
      cumulative += t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple);
      return {
        trade: i + 1,
        r: Number(cumulative.toFixed(2)),
        date: new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      };
    });
  }, [trades]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Aucun trade enregistré
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
        <XAxis dataKey="date" stroke="hsl(0, 0%, 55%)" fontSize={12} />
        <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} tickFormatter={(v) => `${v}R`} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(0, 0%, 10%)',
            border: '1px solid hsl(0, 0%, 18%)',
            borderRadius: '8px',
            color: 'hsl(0, 0%, 95%)',
          }}
          formatter={(value: number) => [`${value}R`, 'Performance']}
        />
        <Area
          type="monotone"
          dataKey="r"
          stroke="hsl(43, 74%, 49%)"
          strokeWidth={2}
          fill="url(#goldGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
