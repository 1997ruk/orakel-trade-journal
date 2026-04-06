CREATE TABLE public.weekly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trades_target INTEGER NOT NULL DEFAULT 5,
  winrate_target NUMERIC NOT NULL DEFAULT 60,
  r_target NUMERIC NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.weekly_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.weekly_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.weekly_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_weekly_goals_updated_at
BEFORE UPDATE ON public.weekly_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();