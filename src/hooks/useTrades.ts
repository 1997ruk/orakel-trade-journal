import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trade, TradeStats } from '@/types/trade';

const STORAGE_KEY = 'orakel-trades';

const loadTrades = (): Trade[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveTrades = (trades: Trade[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(loadTrades);

  useEffect(() => { saveTrades(trades); }, [trades]);

  const addTrade = useCallback((trade: Omit<Trade, 'id'>) => {
    setTrades(prev => [...prev, { ...trade, id: crypto.randomUUID() }]);
  }, []);

  const updateTrade = useCallback((id: string, updates: Partial<Trade>) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  }, []);

  const stats = useMemo((): TradeStats => {
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

    // Setup analysis
    const setupMap = new Map<string, number>();
    trades.forEach(t => {
      const curr = setupMap.get(t.setup) || 0;
      setupMap.set(t.setup, curr + (t.resultat === 'Gain' ? t.rMultiple : -Math.abs(t.rMultiple)));
    });
    const setupEntries = [...setupMap.entries()];
    const bestSetup = setupEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const worstSetup = setupEntries.sort((a, b) => a[1] - b[1])[0]?.[0] || '-';

    // Actif analysis
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
  }, [trades]);

  return { trades, stats, addTrade, updateTrade, deleteTrade };
}
