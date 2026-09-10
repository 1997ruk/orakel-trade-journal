import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getLocalGoals, putLocalGoals } from '@/services/indexedDB';
import { syncWeeklyGoals } from '@/services/syncService';

export interface WeeklyGoals {
  trades_target: number;
  winrate_target: number;
  r_target: number;
}

const DEFAULTS: WeeklyGoals = { trades_target: 5, winrate_target: 60, r_target: 3 };

export function useWeeklyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<WeeklyGoals>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (userId: string) => {
    // 1. Read local first so the panel works offline
    const local = await getLocalGoals(userId);
    if (local) {
      setGoals({
        trades_target: local.trades_target,
        winrate_target: local.winrate_target,
        r_target: local.r_target,
      });
    }
    setLoading(false);

    // 2. Sync with the backend in the background (push pending, else pull)
    try {
      await syncWeeklyGoals(userId);
      const fresh = await getLocalGoals(userId);
      if (fresh) {
        setGoals({
          trades_target: fresh.trades_target,
          winrate_target: fresh.winrate_target,
          r_target: fresh.r_target,
        });
      }
    } catch (e) {
      console.error('Weekly goals sync failed', e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    load(user.id);

    const onOnline = () => load(user.id);
    window.addEventListener('online', onOnline);
    const interval = setInterval(() => {
      if (navigator.onLine) load(user.id);
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', onOnline);
      clearInterval(interval);
    };
  }, [user, load]);

  const saveGoals = useCallback(async (g: WeeklyGoals) => {
    if (!user) return;
    setGoals(g);
    await putLocalGoals({
      user_id: user.id,
      ...g,
      sync_status: 'pending',
      updated_at: Date.now(),
    });
    if (navigator.onLine) {
      await syncWeeklyGoals(user.id);
    }
  }, [user]);

  return { goals, loading, saveGoals };
}
