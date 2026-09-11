import { useMemo, useState } from 'react';
import { Trade, SETUPS, ACTIFS, EMOTIONS } from '@/types/trade';
import { runBacktest, DEFAULT_CONFIG, type BacktestConfig } from '@/utils/backtest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { FlaskConical, RotateCcw, TrendingUp, TrendingDown, Percent, Wallet, Shield, Activity } from 'lucide-react';

interface Props { trades: Trade[] }

const fmtMoney = (n: number) =>
  `${n >= 0 ? '' : '-'}${Math.abs(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} $`;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
        active
          ? 'border-gold bg-gold/15 text-gold'
          : 'border-border text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, icon, tone = 'neutral' }: {
  label: string; value: string; icon: React.ReactNode; tone?: 'up' | 'down' | 'neutral';
}) {
  const color = tone === 'up' ? 'text-profit' : tone === 'down' ? 'text-loss' : 'text-foreground';
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

const BacktestLab = ({ trades }: Props) => {
  const [config, setConfig] = useState<BacktestConfig>(DEFAULT_CONFIG);

  const result = useMemo(() => runBacktest(trades, config), [trades, config]);

  const toggle = (key: 'actifs' | 'setups' | 'directions' | 'emotions', value: string) => {
    setConfig(c => {
      const list = c[key];
      return { ...c, [key]: list.includes(value) ? list.filter(v => v !== value) : [...list, value] };
    });
  };

  const positive = result.pnl >= 0;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Configuration */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-gold" /> Stratégie
            </h3>
            <Button
              variant="ghost" size="sm"
              onClick={() => setConfig(DEFAULT_CONFIG)}
              className="text-muted-foreground hover:text-foreground gap-1 h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Réinit.
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Capital ($)</label>
              <Input
                type="number" min={100} step={100} value={config.capitalInitial}
                onChange={e => setConfig(c => ({ ...c, capitalInitial: Math.max(1, Number(e.target.value) || 0) }))}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Risque / trade (%)</label>
              <Input
                type="number" min={0.1} step={0.1} value={config.risquePct}
                onChange={e => setConfig(c => ({ ...c, risquePct: Math.max(0.1, Number(e.target.value) || 0) }))}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Du</label>
              <Input
                type="date" value={config.dateFrom}
                onChange={e => setConfig(c => ({ ...c, dateFrom: e.target.value }))}
                className="bg-secondary border-border mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Au</label>
              <Input
                type="date" value={config.dateTo}
                onChange={e => setConfig(c => ({ ...c, dateTo: e.target.value }))}
                className="bg-secondary border-border mt-1"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Actifs</p>
            <div className="flex flex-wrap gap-1.5">
              {ACTIFS.map(a => (
                <Chip key={a} active={config.actifs.includes(a)} onClick={() => toggle('actifs', a)}>{a}</Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Setups</p>
            <div className="flex flex-wrap gap-1.5">
              {SETUPS.map(s => (
                <Chip key={s} active={config.setups.includes(s)} onClick={() => toggle('setups', s)}>{s}</Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Direction</p>
            <div className="flex flex-wrap gap-1.5">
              {['Buy', 'Sell'].map(d => (
                <Chip key={d} active={config.directions.includes(d)} onClick={() => toggle('directions', d)}>{d}</Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Émotions</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map(e => (
                <Chip key={e} active={config.emotions.includes(e)} onClick={() => toggle('emotions', e)}>{e}</Chip>
              ))}
            </div>
          </div>

          <Chip
            active={config.seulementRespectes}
            onClick={() => setConfig(c => ({ ...c, seulementRespectes: !c.seulementRespectes }))}
          >
            Uniquement les trades respectés
          </Chip>
        </div>

        {/* Résultats */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Capital final" value={fmtMoney(result.capitalFinal)} icon={<Wallet className="w-4 h-4" />} tone={positive ? 'up' : 'down'} />
            <Metric label="Résultat" value={`${positive ? '+' : ''}${fmtMoney(result.pnl)}`} icon={positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} tone={positive ? 'up' : 'down'} />
            <Metric label="Rendement" value={`${result.roi >= 0 ? '+' : ''}${result.roi.toFixed(1)}%`} icon={<Percent className="w-4 h-4" />} tone={result.roi >= 0 ? 'up' : 'down'} />
            <Metric label="Drawdown max" value={`-${result.maxDrawdownPct.toFixed(1)}%`} icon={<TrendingDown className="w-4 h-4" />} tone="down" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="Trades simulés" value={`${result.totalTrades}`} icon={<Activity className="w-4 h-4" />} />
            <Metric label="Winrate" value={`${result.winrate.toFixed(1)}%`} icon={<Percent className="w-4 h-4" />} tone={result.winrate >= 50 ? 'up' : 'down'} />
            <Metric
              label="Facteur de profit"
              value={result.profitFactor === Infinity ? '∞' : result.profitFactor.toFixed(2)}
              icon={<TrendingUp className="w-4 h-4" />}
              tone={result.profitFactor >= 1 ? 'up' : 'down'}
            />
            <Metric label="Espérance" value={`${result.expectancyR >= 0 ? '+' : ''}${result.expectancyR.toFixed(2)}R`} icon={<Shield className="w-4 h-4" />} tone={result.expectancyR >= 0 ? 'up' : 'down'} />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Courbe de capital simulée</h3>
              <span className="text-xs text-muted-foreground">
                {result.totalR >= 0 ? '+' : ''}{result.totalR.toFixed(1)}R cumulés · {result.maxWinStreak} gains d'affilée · {result.maxLossStreak} pertes d'affilée
              </span>
            </div>
            {result.totalTrades === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                Aucun trade ne correspond à cette stratégie. Ajustez les filtres.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={result.curve}>
                  <defs>
                    <linearGradient id="btGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} width={70}
                    tickFormatter={(v: number) => `${Math.round(v).toLocaleString('fr-FR')}`} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [fmtMoney(v), 'Capital']}
                    labelFormatter={(l: number) => `Trade #${l}`}
                  />
                  <ReferenceLine y={config.capitalInitial} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="capital" stroke="hsl(var(--gold))" strokeWidth={2} fill="url(#btGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {result.totalTrades > 0 && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Détail de la simulation</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-xs text-muted-foreground text-left">
                      <th className="py-2 font-medium">#</th>
                      <th className="py-2 font-medium">Date</th>
                      <th className="py-2 font-medium">Actif</th>
                      <th className="py-2 font-medium">Setup</th>
                      <th className="py-2 font-medium">Sens</th>
                      <th className="py-2 font-medium text-right">R</th>
                      <th className="py-2 font-medium text-right">Résultat</th>
                      <th className="py-2 font-medium text-right">Capital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={r.id} className="border-t border-border/60">
                        <td className="py-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2">{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                        <td className="py-2">{r.actif}</td>
                        <td className="py-2 text-muted-foreground">{r.setup}</td>
                        <td className="py-2 text-muted-foreground">{r.direction}</td>
                        <td className={`py-2 text-right font-medium ${r.r >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {r.r >= 0 ? '+' : ''}{r.r.toFixed(2)}R
                        </td>
                        <td className={`py-2 text-right ${r.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {r.pnl >= 0 ? '+' : ''}{fmtMoney(r.pnl)}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{fmtMoney(r.capital)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestLab;
