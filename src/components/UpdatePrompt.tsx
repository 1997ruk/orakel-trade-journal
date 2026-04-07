import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdate = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      const handleUpdate = () => setShowUpdate(true);

      if (reg.waiting) {
        handleUpdate();
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdate();
          }
        });
      });
    };

    checkForUpdate();

    // Check for updates every 60 seconds
    const interval = setInterval(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      reg?.update();
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // controllerchange listener in main.tsx will reload
    setTimeout(() => window.location.reload(), 1500);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border border-primary/30 bg-card p-4 shadow-2xl md:left-auto md:right-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <RefreshCw className={`h-5 w-5 text-primary ${updating ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Nouvelle version disponible</p>
          <p className="text-sm text-muted-foreground">
            Mettez à jour pour profiter des dernières améliorations
          </p>
        </div>
        <button onClick={() => setShowUpdate(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={handleUpdate} className="mt-3 w-full" size="sm" disabled={updating}>
        <RefreshCw className={`mr-2 h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
        {updating ? 'Mise à jour...' : 'Mettre à jour'}
      </Button>
    </div>
  );
}
