import { Trade } from '@/types/trade';

export interface BacktestConfig {
  capitalInitial: number;
  risquePct: number;
  actifs: string[];
  setups: string[];
  directions: string[];
  emotions: string[];
  seulementRespectes: boolean;
  dateFrom: string;
  dateTo: string;
}

export interface BacktestPoint {
  index: number;
  date: string;
  capital: number;
  cumulR: number;
  drawdownPct: number;
}

export interface BacktestTradeRow {
  id: string;
  date: string;
  actif: string;
  setup: string;
  direction: string;
  r: number;
  pnl: number;
  capital: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  rows: BacktestTradeRow[];
  curve: BacktestPoint[];
  totalTrades: number;
  wins: number;
  losses: number;
  winrate: number;
  totalR: number;
  avgR: number;
  expectancyR: number;
  profitFactor: number;
  capitalFinal: number;
  pnl: number;
  roi: number;
  maxDrawdownPct: number;
  maxWinStreak: number;
  maxLossStreak: number;
  bestR: number;
  worstR: number;
  disciplinePct: number;
}

export const DEFAULT_CONFIG: BacktestConfig = {
  capitalInitial: 10000,
  risquePct: 1,
  actifs: [],
  setups: [],
  directions: [],
  emotions: [],
  seulementRespectes: false,
  dateFrom: '',
  dateTo: '',
};

export function filterTrades(trades: Trade[], c: BacktestConfig): Trade[] {
  return trades
    .filter(t => (c.actifs.length === 0 || c.actifs.includes(t.actif)))
    .filter(t => (c.setups.length === 0 || c.setups.includes(t.setup)))
    .filter(t => (c.directions.length === 0 || c.directions.includes(t.direction)))
    .filter(t => (c.emotions.length === 0 || c.emotions.includes(t.emotion)))
    .filter(t => (!c.seulementRespectes || t.tradeRespecte))
    .filter(t => (!c.dateFrom || t.date >= c.dateFrom))
    .filter(t => (!c.dateTo || t.date <= c.dateTo))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function signedR(t: Trade): number {
  return t.resultat === 'Gain' ? Math.abs(t.rMultiple) : -Math.abs(t.rMultiple);
}

export function runBacktest(trades: Trade[], config: BacktestConfig): BacktestResult {
  const selected = filterTrades(trades, config);
  const risk = config.risquePct / 100;

  let capital = config.capitalInitial;
  let peak = config.capitalInitial;
  let cumulR = 0;
  let maxDD = 0;
  let winStreak = 0, lossStreak = 0, maxWinStreak = 0, maxLossStreak = 0;
  let grossWin = 0, grossLoss = 0;

  const rows: BacktestTradeRow[] = [];
  const curve: BacktestPoint[] = [{
    index: 0,
    date: selected[0]?.date ?? '',
    capital: config.capitalInitial,
    cumulR: 0,
    drawdownPct: 0,
  }];

  selected.forEach((t, i) => {
    const r = signedR(t);
    const pnl = capital * risk * r;
    capital += pnl;
    cumulR += r;

    if (r >= 0) { grossWin += r; winStreak++; lossStreak = 0; }
    else { grossLoss += Math.abs(r); lossStreak++; winStreak = 0; }
    maxWinStreak = Math.max(maxWinStreak, winStreak);
    maxLossStreak = Math.max(maxLossStreak, lossStreak);

    peak = Math.max(peak, capital);
    const dd = peak > 0 ? ((peak - capital) / peak) * 100 : 0;
    maxDD = Math.max(maxDD, dd);

    rows.push({
      id: t.id,
      date: t.date,
      actif: t.actif,
      setup: t.setup,
      direction: t.direction,
      r,
      pnl,
      capital,
    });
    curve.push({ index: i + 1, date: t.date, capital, cumulR, drawdownPct: dd });
  });

  const total = selected.length;
  const wins = selected.filter(t => t.resultat === 'Gain').length;
  const losses = total - wins;
  const respectes = selected.filter(t => t.tradeRespecte).length;
  const rValues = rows.map(r => r.r);

  return {
    config,
    rows,
    curve,
    totalTrades: total,
    wins,
    losses,
    winrate: total ? (wins / total) * 100 : 0,
    totalR: cumulR,
    avgR: total ? cumulR / total : 0,
    expectancyR: total ? cumulR / total : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
    capitalFinal: capital,
    pnl: capital - config.capitalInitial,
    roi: config.capitalInitial > 0 ? ((capital - config.capitalInitial) / config.capitalInitial) * 100 : 0,
    maxDrawdownPct: maxDD,
    maxWinStreak,
    maxLossStreak,
    bestR: rValues.length ? Math.max(...rValues) : 0,
    worstR: rValues.length ? Math.min(...rValues) : 0,
    disciplinePct: total ? (respectes / total) * 100 : 0,
  };
}
