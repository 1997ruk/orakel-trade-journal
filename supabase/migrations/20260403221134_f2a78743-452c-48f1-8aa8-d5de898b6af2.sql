ALTER TABLE public.trades ADD COLUMN tags TEXT[] DEFAULT '{}';
CREATE INDEX idx_trades_tags ON public.trades USING GIN(tags);