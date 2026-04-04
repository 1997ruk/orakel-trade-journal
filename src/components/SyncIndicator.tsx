import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getSyncState, onSyncStateChange, type SyncState } from '@/services/syncService';

const config: Record<SyncState, { icon: React.ReactNode; label: string; className: string }> = {
  offline: {
    icon: <WifiOff className="w-3.5 h-3.5" />,
    label: 'Hors ligne',
    className: 'bg-muted text-muted-foreground',
  },
  syncing: {
    icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
    label: 'Synchronisation...',
    className: 'bg-accent/20 text-accent',
  },
  synced: {
    icon: <Check className="w-3.5 h-3.5" />,
    label: 'Synchronisé',
    className: 'bg-profit/20 text-profit',
  },
  error: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Erreur sync',
    className: 'bg-destructive/20 text-destructive',
  },
};

export default function SyncIndicator() {
  const [state, setState] = useState<SyncState>(getSyncState());

  useEffect(() => onSyncStateChange(setState), []);

  const c = config[state];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.icon}
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  );
}
