import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trade, TradeStats } from '@/types/trade';

export function useTrades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    if (!user) { setTrades([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (!error && data) {
      setTrades(data.map(t => ({
        id: t.id,
        date: t.date,
        actif: t.actif,
        setup: t.setup,
        direction: t.direction as Trade['direction'],
        prixEntree: t.prix_entree,
        stopLoss: t.stop_loss,
        takeProfit: t.take_profit,
        risquePourcentage: t.risque_pourcentage,
        taillePosition: t.taille_position,
        resultat: t.resultat as Trade['resultat'],
        rMultiple: t.r_multiple,
        tradeRespecte: t.trade_respecte,
        emotion: t.emotion as Trade['emotion'],
        noteAvant: t.note_avant || '',
        noteApres: t.note_apres || '',
        imageUrl: t.image_url,
        tags: (t as any).tags || [],
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const addTrade = useCallback(async (trade: Omit<Trade, 'id'>) => {
    if (!user) return;
    const { error } = await supabase.from('trades').insert({
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
    } as any);
    if (!error) await fetchTrades();
  }, [user, fetchTrades]);

  const updateTrade = useCallback(async (id: string, updates: Partial<Trade>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
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

    const { error } = await supabase.from('trades').update(dbUpdates).eq('id', id).eq('user_id', user.id);
    if (!error) await fetchTrades();
  }, [user, fetchTrades]);

  const deleteTrade = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('trades').delete().eq('id', id).eq('user_id', user.id);
    if (!error) await fetchTrades();
  }, [user, fetchTrades]);

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
