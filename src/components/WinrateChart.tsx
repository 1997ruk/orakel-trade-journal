import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Trade } from '@/types/trade';

interface WinrateChartProps {
  trades: Trade[];
}

const WinrateChart = ({ trades }: WinrateChartProps) => {
  const data = useMemo(() => {
    const wins = trades.filter(t => t.resultat === 'Gain').length;
    const losses = trades.filter(t => t.resultat === 'Perte').length;
    if (wins === 0 && losses === 0) return [];
    return [
      { name: 'Gains', value: wins },
      { name: 'Pertes', value: losses },
    ];
  }, [trades]);

  const COLORS = ['hsl(142, 71%, 45%)', 'hsl(0, 84%, 60%)'];

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Aucune donnée
      </div>
    );
  }

  const winrate = trades.length > 0
    ? ((trades.filter(t => t.resultat === 'Gain').length / trades.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 10%)',
              border: '1px solid hsl(0, 0%, 18%)',
              borderRadius: '8px',
              color: 'hsl(0, 0%, 95%)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold text-gold">{winrate}%</span>
          <p className="text-xs text-muted-foreground">Winrate</p>
        </div>
      </div>
    </div>
  );
};

export default WinrateChart;
