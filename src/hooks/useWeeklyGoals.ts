import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

  useEffect(() => {
    if (!user) return;
    supabase
      .from('weekly_goals')
      .select('trades_target, winrate_target, r_target')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setGoals(data);
        setLoading(false);
      });
  }, [user]);

  const saveGoals = useCallback(async (g: WeeklyGoals) => {
    if (!user) return;
    setGoals(g);
    await supabase.from('weekly_goals').upsert({
      user_id: user.id,
      ...g,
    }, { onConflict: 'user_id' });
  }, [user]);

  return { goals, loading, saveGoals };
}
