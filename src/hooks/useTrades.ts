import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Trade, TradeStats } from '@/types/trade';
import {
  getAllLocalTrades,
  putLocalTrade,
  deleteLocalTrade,
  addPendingOp,
  type LocalTrade,
} from '@/services/indexedDB';
import { startAutoSync, fullSync } from '@/services/syncService';

function toTrade(lt: LocalTrade): Trade {
  return {
    id: lt.id,
    date: lt.date,
    actif: lt.actif,
    setup: lt.setup,
    direction: lt.direction as Trade['direction'],
    prixEntree: lt.prix_entree,
    stopLoss: lt.stop_loss,
    takeProfit: lt.take_profit,
    risquePourcentage: lt.risque_pourcentage,
    taillePosition: lt.taille_position,
    resultat: lt.resultat as Trade['resultat'],
    rMultiple: lt.r_multiple,
    tradeRespecte: lt.trade_respecte,
    emotion: lt.emotion as Trade['emotion'],
    noteAvant: lt.note_avant || '',
    noteApres: lt.note_apres || '',
    imageUrl: lt.image_url,
    tags: lt.tags || [],
  };
}

export function useTrades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocal = useCallback(async () => {
    if (!user) { setTrades([]); setLoading(false); return; }
    const local = await getAllLocalTrades(user.id);
    setTrades(local.map(toTrade));
    setLoading(false);
  }, [user]);

  // Start auto-sync and load from IndexedDB
  useEffect(() => {
    if (!user) { setTrades([]); setLoading(false); return; }

    loadLocal();

    const cleanup = startAutoSync(user.id);

    // After sync completes, reload from IndexedDB
    const interval = setInterval(loadLocal, 3000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [user, loadLocal]);

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const localTrade: LocalTrade = {
      id,
      user_id: user.id,
      date: trade.date,
      actif: trade.actif,
      setup: trade.setup,
      direction: trade.direction,
      prix_entree: trade.prixEntree,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      risque_pourcentage: trade.risquePourcentage,
      taille_position: trade.taillePosition,
      resultat: trade.resultat,
      r_multiple: trade.rMultiple,
      trade_respecte: trade.tradeRespecte,
      emotion: trade.emotion,
      note_avant: trade.noteAvant,
      note_apres: trade.noteApres,
      image_url: trade.imageUrl || null,
      tags: trade.tags || [],
      sync_status: 'pending',
    };

    await putLocalTrade(localTrade);
    await addPendingOp({
      id: crypto.randomUUID(),
      type: 'insert',
      trade_id: id,
      data: localTrade,
      timestamp: Date.now(),
    });

    // Optimistic UI update
    setTrades(prev => [toTrade(localTrade), ...prev]);

    // Try immediate sync
    if (navigator.onLine) fullSync(user.id).then(loadLocal);
  }, [user, loadLocal]);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!user) return;

    const dbUpdates: Partial<LocalTrade> = {};
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.actif !== undefined) dbUpdates.actif = updates.actif;
    if (updates.setup !== undefined) dbUpdates.setup = updates.setup;
    if (updates.direction !== undefined) dbUpdates.direction = updates.direction;
    if (updates.prixEntree !== undefined) dbUpdates.prix_entree = updates.prixEntree;
    if (updates.stopLoss !== undefined) dbUpdates.stop_loss = updates.stopLoss;
    if (updates.takeProfit !== undefined) dbUpdates.take_profit = updates.takeProfit;
    if (updates.risquePourcentage !== undefined) dbUpdates.risque_pourcentage = updates.risquePourcentage;
    if (updates.taillePosition !== undefined) dbUpdates.taille_position = updates.taillePosition;
    if (updates.resultat !== undefined) dbUpdates.resultat = updates.resultat;
    if (updates.rMultiple !== undefined) dbUpdates.r_multiple = updates.rMultiple;
    if (updates.tradeRespecte !== undefined) dbUpdates.trade_respecte = updates.tradeRespecte;
    if (updates.emotion !== undefined) dbUpdates.emotion = updates.emotion;
    if (updates.noteAvant !== undefined) dbUpdates.note_avant = updates.noteAvant;
    if (updates.noteApres !== undefined) dbUpdates.note_apres = updates.noteApres;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    // Update local
    const locals = await getAllLocalTrades(user.id);
    const existing = locals.find(t => t.id === id);
    if (existing) {
      const updated = { ...existing, ...dbUpdates, sync_status: 'pending' as const };
      await putLocalTrade(updated);
    }

    await addPendingOp({
      id: crypto.randomUUID(),
      type: 'update',
      trade_id: id,
      data: dbUpdates,
      timestamp: Date.now(),
    });

    // Optimistic
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

    if (navigator.onLine) fullSync(user.id).then(loadLocal);
  }, [user, loadLocal]);

  const deleteTrade = useCallback(async (id: string) => {
    if (!user) return;

    await deleteLocalTrade(id);
    await addPendingOp({
      id: crypto.randomUUID(),
      type: 'delete',
      trade_id: id,
      timestamp: Date.now(),
    });

    setTrades(prev => prev.filter(t => t.id !== id));

    if (navigator.onLine) fullSync(user.id).then(loadLocal);
  }, [user, loadLocal]);

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
  }, [trades]);

  return { trades, stats, loading, addTrade, updateTrade, deleteTrade };
}
