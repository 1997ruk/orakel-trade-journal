import { useState, useEffect } from 'react';
import { Trade } from '@/types/trade';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DailyReminderProps {
  trades: Trade[];
  onAddTrade: () => void;
}

const DISMISSED_KEY = 'daily_reminder_dismissed';

const DailyReminder = ({ trades, onAddTrade }: DailyReminderProps) => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const hasTradesToday = trades.some(t => t.date === today);
    if (hasTradesToday) {
      setDismissed(true);
      return;
    }
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored === today) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  }, [trades]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, format(new Date(), 'yyyy-MM-dd'));
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-accent/20 border border-accent/40 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
      <div className="bg-accent/30 rounded-full p-2">
        <Bell className="w-5 h-5 text-accent-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          📝 N'oubliez pas de remplir votre journal !
        </p>
        <p className="text-xs text-muted-foreground">
          Aucun trade enregistré aujourd'hui ({format(new Date(), 'EEEE d MMMM', { locale: fr })})
        </p>
      </div>
      <Button size="sm" variant="secondary" onClick={onAddTrade}>
        Ajouter
      </Button>
      <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DailyReminder;
