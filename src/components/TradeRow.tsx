import { Trade } from '@/types/trade';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeRowProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const TradeRow = ({ trade, onEdit, onDelete }: TradeRowProps) => {
  const isGain = trade.resultat === 'Gain';

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:glow-gold transition-all animate-fade-in">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        isGain ? "bg-profit/20" : "bg-loss/20"
      )}>
        {isGain ? <TrendingUp className="w-5 h-5 text-profit" /> : <TrendingDown className="w-5 h-5 text-loss" />}
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
        <div>
          <p className="font-semibold text-sm">{trade.actif}</p>
          <p className="text-xs text-muted-foreground">{new Date(trade.date).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            trade.direction === 'Buy' ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
          )}>
            {trade.direction}
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">Setup</p>
          <p className="text-sm">{trade.setup}</p>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">R Multiple</p>
          <p className={cn("text-sm font-semibold", isGain ? "text-profit" : "text-loss")}>
            {isGain ? '+' : '-'}{Math.abs(trade.rMultiple).toFixed(1)}R
          </p>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">Discipline</p>
          {trade.tradeRespecte
            ? <CheckCircle className="w-4 h-4 text-profit" />
            : <XCircle className="w-4 h-4 text-loss" />
          }
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">Émotion</p>
          <p className="text-xs">{trade.emotion}</p>
        </div>
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(trade)} className="h-8 w-8 text-muted-foreground hover:text-gold">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(trade.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TradeRow;
