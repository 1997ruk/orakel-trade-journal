import { Trade } from '@/types/trade';

export interface AdvancedStats {
  maxDrawdownR: number;
  drawdownCurve: { trade: number; drawdown: number }[];
  maxWinStreak: number;
  maxLossStreak: number;
  bestTradeR: number;
  worstTradeR: number;
  bestTradeDate: string;
  worstTradeDate: string;
  performanceBySetup: { name: string; totalR: number; count: number; winrate: number }[];
  performanceByActif: { name: string; totalR: number; count: number; winrate: number }[];
  performanceByEmotion: { name: string; totalR: number; count: number; winrate: number }[];
  performanceByDay: { name: string; totalR: number; count: number; winrate: number }[];
  performanceByHour: { name: string; totalR: number; count: number; winrate: number }[];
  avgRiskPercent: number;
  tradesOver2Percent: number;
  riskScore: number;
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function groupPerformance(trades: Trade[], keyFn: (t: Trade) => string) {
  const map = new Map<string, { totalR: number; wins: number; count: number }>();
  trades.forEach(t => {
    const key = keyFn(t);
    const prev = map.get(key) || { totalR: 0, wins: 0, count: 0 };
    const r = t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple);
    map.set(key, {
      totalR: prev.totalR + r,
      wins: prev.wins + (t.resultat === 'Gain' ? 1 : 0),
      count: prev.count + 1,
    });
  });
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      totalR: Number(v.totalR.toFixed(2)),
      count: v.count,
      winrate: Number(((v.wins / v.count) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.totalR - a.totalR);
}

export function computeAdvancedStats(trades: Trade[]): AdvancedStats {
  if (trades.length === 0) {
    return {
      maxDrawdownR: 0, drawdownCurve: [], maxWinStreak: 0, maxLossStreak: 0,
      bestTradeR: 0, worstTradeR: 0, bestTradeDate: '-', worstTradeDate: '-',
      performanceBySetup: [], performanceByActif: [], performanceByEmotion: [],
      performanceByDay: [], performanceByHour: [],
      avgRiskPercent: 0, tradesOver2Percent: 0, riskScore: 0,
    };
  }

  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Equity curve & drawdown
  let peak = 0, cumulative = 0, maxDD = 0;
  const drawdownCurve: { trade: number; drawdown: number }[] = [];
  sorted.forEach((t, i) => {
    cumulative += t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple);
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDD) maxDD = dd;
    drawdownCurve.push({ trade: i + 1, drawdown: -Number(dd.toFixed(2)) });
  });

  // Streaks
  let winStreak = 0, lossStreak = 0, maxWin = 0, maxLoss = 0;
  sorted.forEach(t => {
    if (t.resultat === 'Gain') { winStreak++; lossStreak = 0; }
    else { lossStreak++; winStreak = 0; }
    if (winStreak > maxWin) maxWin = winStreak;
    if (lossStreak > maxLoss) maxLoss = lossStreak;
  });

  // Best/worst
  const rValues = sorted.map(t => t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple));
  const bestIdx = rValues.indexOf(Math.max(...rValues));
  const worstIdx = rValues.indexOf(Math.min(...rValues));

  // Risk management
  const avgRisk = trades.reduce((s, t) => s + t.risquePourcentage, 0) / trades.length;
  const over2 = trades.filter(t => t.risquePourcentage > 2).length;
  const respectRate = (trades.filter(t => t.tradeRespecte).length / trades.length) * 100;
  const riskScore = Math.max(0, Math.min(100, respectRate * 0.5 + Math.max(0, 100 - over2 / trades.length * 200) * 0.3 + Math.max(0, 100 - Math.abs(avgRisk - 1) * 50) * 0.2));

  return {
    maxDrawdownR: Number(maxDD.toFixed(2)),
    drawdownCurve,
    maxWinStreak: maxWin,
    maxLossStreak: maxLoss,
    bestTradeR: Number(rValues[bestIdx].toFixed(2)),
    worstTradeR: Number(rValues[worstIdx].toFixed(2)),
    bestTradeDate: sorted[bestIdx].date,
    worstTradeDate: sorted[worstIdx].date,
    performanceBySetup: groupPerformance(trades, t => t.setup),
    performanceByActif: groupPerformance(trades, t => t.actif),
    performanceByEmotion: groupPerformance(trades, t => t.emotion),
    performanceByDay: groupPerformance(trades, t => DAYS_FR[new Date(t.date).getDay()]),
    performanceByHour: groupPerformance(trades, t => `${new Date(t.date).getHours()}h`),
    avgRiskPercent: Number(avgRisk.toFixed(2)),
    tradesOver2Percent: over2,
    riskScore: Number(riskScore.toFixed(0)),
  };
}
