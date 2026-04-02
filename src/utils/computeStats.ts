import { Trade, TradeStats } from '@/types/trade';

export function computeStats(trades: Trade[]): TradeStats {
  const total = trades.length;
  if (total === 0) return {
    totalTrades: 0, tradesGagnants: 0, tradesPerdants: 0, winrate: 0,
    profitTotalR: 0, perteTotaleR: 0, profitNetR: 0, moyenneR: 0,
    setupPlusRentable: '-', setupMoinsRentable: '-', actifPlusRentable: '-', tauxDiscipline: 0,
  };

  const gagnants = trades.filter(t => t.resultat === 'Gain');
  const perdants = trades.filter(t => t.resultat === 'Perte');
  const profitR = gagnants.reduce((s, t) => s + t.rMultiple, 0);
  const perteR = perdants.reduce((s, t) => s + Math.abs(t.rMultiple), 0);
  const respectes = trades.filter(t => t.tradeRespecte).length;

  const setupMap = new Map<string, number>();
  trades.forEach(t => {
    const curr = setupMap.get(t.setup) || 0;
    setupMap.set(t.setup, curr + (t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple)));
  });
  const setupEntries = [...setupMap.entries()];
  const bestSetup = setupEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const worstSetup = setupEntries.sort((a, b) => a[1] - b[1])[0]?.[0] || '-';

  const actifMap = new Map<string, number>();
  trades.forEach(t => {
    const curr = actifMap.get(t.actif) || 0;
    actifMap.set(t.actif, curr + (t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple)));
  });
  const bestActif = [...actifMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return {
    totalTrades: total,
    tradesGagnants: gagnants.length,
    tradesPerdants: perdants.length,
    winrate: (gagnants.length / total) * 100,
    profitTotalR: profitR,
    perteTotaleR: perteR,
    profitNetR: profitR - perteR,
    moyenneR: (profitR - perteR) / total,
    setupPlusRentable: bestSetup,
    setupMoinsRentable: worstSetup,
    actifPlusRentable: bestActif,
    tauxDiscipline: (respectes / total) * 100,
  };
}

export type Period = 'all' | 'week' | 'month' | 'quarter';

export function filterByPeriod(trades: Trade[], period: Period): Trade[] {
  if (period === 'all') return trades;
  const now = new Date();
  const ms = { week: 7, month: 30, quarter: 90 }[period] * 24 * 60 * 60 * 1000;
  const cutoff = new Date(now.getTime() - ms);
  return trades.filter(t => new Date(t.date) >= cutoff);
}
