import { supabase } from '@/integrations/supabase/client';
import {
  getAllPendingOps,
  deletePendingOp,
  putLocalTrades,
  deleteLocalTrade,
  putLocalTrade,
  getAllLocalTrades,
  type LocalTrade,
  type PendingOperation,
} from './indexedDB';

export type SyncState = 'offline' | 'syncing' | 'synced' | 'error';

type SyncListener = (state: SyncState) => void;

let listeners: SyncListener[] = [];
let currentState: SyncState = navigator.onLine ? 'synced' : 'offline';
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function getSyncState() { return currentState; }

export function onSyncStateChange(fn: SyncListener) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function setState(s: SyncState) {
  currentState = s;
  listeners.forEach(fn => fn(s));
}

export async function syncPendingOps(userId: string): Promise<void> {
  if (!navigator.onLine) { setState('offline'); return; }

  const ops = await getAllPendingOps();
  if (ops.length === 0) { setState('synced'); return; }

  setState('syncing');

  for (const op of ops) {
    try {
      await processOp(op, userId);
      await deletePendingOp(op.id);
      // Mark local trade as synced
      if (op.type !== 'delete' && op.data) {
        await putLocalTrade({ ...op.data as LocalTrade, sync_status: 'synced' });
      }
    } catch (err) {
      console.error('Sync op failed', op.id, err);
      setState('error');
      return;
    }
  }

  setState('synced');
}

async function processOp(op: PendingOperation, userId: string) {
  switch (op.type) {
    case 'insert': {
      const d = op.data!;
      const { error } = await supabase.from('trades').insert({
        id: d.id,
        user_id: userId,
        date: d.date!,
        actif: d.actif!,
        setup: d.setup!,
        direction: d.direction!,
        prix_entree: d.prix_entree!,
        stop_loss: d.stop_loss!,
        take_profit: d.take_profit!,
        risque_pourcentage: d.risque_pourcentage!,
        taille_position: d.taille_position!,
        resultat: d.resultat!,
        r_multiple: d.r_multiple!,
        trade_respecte: d.trade_respecte!,
        emotion: d.emotion!,
        note_avant: d.note_avant || '',
        note_apres: d.note_apres || '',
        image_url: d.image_url || null,
        tags: d.tags || [],
      } as any);
      if (error) throw error;
      break;
    }
    case 'update': {
      const updates: Record<string, unknown> = { ...op.data };
      delete updates.id;
      delete updates.user_id;
      delete updates.sync_status;
      const { error } = await supabase.from('trades').update(updates).eq('id', op.trade_id).eq('user_id', userId);
      if (error) throw error;
      break;
    }
    case 'delete': {
      const { error } = await supabase.from('trades').delete().eq('id', op.trade_id).eq('user_id', userId);
      if (error) throw error;
      break;
    }
  }
}

export async function pullFromSupabase(userId: string): Promise<void> {
  if (!navigator.onLine) return;

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !data) return;

  // Get local pending ops to avoid overwriting pending changes
  const pendingOps = await getAllPendingOps();
  const pendingTradeIds = new Set(pendingOps.map(o => o.trade_id));

  const remoteTrades: LocalTrade[] = data
    .filter(t => !pendingTradeIds.has(t.id))
    .map(t => ({
      id: t.id,
      user_id: t.user_id,
      date: t.date,
      actif: t.actif,
      setup: t.setup,
      direction: t.direction,
      prix_entree: t.prix_entree,
      stop_loss: t.stop_loss,
      take_profit: t.take_profit,
      risque_pourcentage: t.risque_pourcentage,
      taille_position: t.taille_position,
      resultat: t.resultat,
      r_multiple: t.r_multiple,
      trade_respecte: t.trade_respecte,
      emotion: t.emotion,
      note_avant: t.note_avant || '',
      note_apres: t.note_apres || '',
      image_url: t.image_url || null,
      tags: (t as any).tags || [],
      sync_status: 'synced' as const,
    }));

  await putLocalTrades(remoteTrades);

  // Remove local trades that were deleted remotely (not pending)
  const local = await getAllLocalTrades(userId);
  const remoteIds = new Set(data.map(t => t.id));
  for (const lt of local) {
    if (!remoteIds.has(lt.id) && !pendingTradeIds.has(lt.id)) {
      await deleteLocalTrade(lt.id);
    }
  }
}

export async function fullSync(userId: string) {
  if (!navigator.onLine) { setState('offline'); return; }
  setState('syncing');
  try {
    await syncPendingOps(userId);
    await pullFromSupabase(userId);
    setState('synced');
  } catch {
    setState('error');
  }
}

export function startAutoSync(userId: string) {
  stopAutoSync();

  // Sync on reconnect
  const onOnline = () => fullSync(userId);
  const onOffline = () => setState('offline');
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Periodic sync every 5 min
  syncInterval = setInterval(() => {
    if (navigator.onLine) fullSync(userId);
  }, 5 * 60 * 1000);

  // Initial sync
  fullSync(userId);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    stopAutoSync();
  };
}

function stopAutoSync() {
  if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
}

// --- Weekly goals sync ---

export async function syncWeeklyGoals(userId: string): Promise<void> {
  const local = await getLocalGoals(userId);

  if (!navigator.onLine) return;

  if (local && local.sync_status === 'pending') {
    const { error } = await supabase.from('weekly_goals').upsert({
      user_id: userId,
      trades_target: local.trades_target,
      winrate_target: local.winrate_target,
      r_target: local.r_target,
    }, { onConflict: 'user_id' });
    if (!error) {
      await putLocalGoals({ ...local, sync_status: 'synced' });
    }
    return;
  }

  const { data } = await supabase
    .from('weekly_goals')
    .select('trades_target, winrate_target, r_target')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) {
    await putLocalGoals({
      user_id: userId,
      trades_target: data.trades_target,
      winrate_target: data.winrate_target,
      r_target: data.r_target,
      sync_status: 'synced',
      updated_at: Date.now(),
    });
  }
}
