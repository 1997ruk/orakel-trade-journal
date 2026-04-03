import { useState } from 'react';
import { Trade, Direction, Resultat, Emotion, SETUPS, ACTIFS, EMOTIONS } from '@/types/trade';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ImagePlus, X, Plus } from 'lucide-react';

interface TradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
  initialData?: Trade;
}

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  actif: 'EURUSD',
  setup: 'OB',
  direction: 'Buy' as Direction,
  prixEntree: 0,
  stopLoss: 0,
  takeProfit: 0,
  risquePourcentage: 1,
  taillePosition: 0.01,
  resultat: 'Gain' as Resultat,
  rMultiple: 0,
  tradeRespecte: true,
  emotion: 'Discipline' as Emotion,
  noteAvant: '',
  noteApres: '',
  imageUrl: null as string | null,
  tags: [] as string[],
};

const TradeForm = ({ open, onOpenChange, onSubmit, initialData }: TradeFormProps) => {
  const [form, setForm] = useState(initialData ? { ...initialData, tags: initialData.tags || [] } : { ...defaultForm });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [tagInput, setTagInput] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ ...defaultForm });
    setPreviewUrl(null);
    onOpenChange(false);
  };

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('trade-screenshots').upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('trade-screenshots').getPublicUrl(path);
      update('imageUrl', path);
      setPreviewUrl(URL.createObjectURL(file));
    }
    setUploading(false);
  };

  const removeImage = () => {
    update('imageUrl', null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl">
            {initialData ? 'Modifier le trade' : 'Nouveau Trade'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Actif</Label>
              <Select value={form.actif} onValueChange={v => update('actif', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIFS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setup</Label>
              <Select value={form.setup} onValueChange={v => update('setup', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SETUPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Direction</Label>
              <Select value={form.direction} onValueChange={v => update('direction', v as Direction)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix d'entrée</Label>
              <Input type="number" step="any" value={form.prixEntree} onChange={e => update('prixEntree', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Stop Loss</Label>
              <Input type="number" step="any" value={form.stopLoss} onChange={e => update('stopLoss', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Take Profit</Label>
              <Input type="number" step="any" value={form.takeProfit} onChange={e => update('takeProfit', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Risque (%)</Label>
              <Input type="number" step="0.1" value={form.risquePourcentage} onChange={e => update('risquePourcentage', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Taille position</Label>
              <Input type="number" step="0.01" value={form.taillePosition} onChange={e => update('taillePosition', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>R Multiple</Label>
              <Input type="number" step="0.1" value={form.rMultiple} onChange={e => update('rMultiple', +e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <Label>Résultat</Label>
              <Select value={form.resultat} onValueChange={v => update('resultat', v as Resultat)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gain">Gain ✅</SelectItem>
                  <SelectItem value="Perte">Perte ❌</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Émotion</Label>
              <Select value={form.emotion} onValueChange={v => update('emotion', v as Emotion)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.tradeRespecte} onCheckedChange={v => update('tradeRespecte', v)} />
            <Label>Trade respecté (plan suivi)</Label>
          </div>

          {/* Image upload */}
          <div>
            <Label>Capture d'écran</Label>
            <div className="mt-1">
              {previewUrl ? (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Trade screenshot" className="max-h-32 rounded-lg border border-border" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-dashed border-border hover:border-gold transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {uploading ? 'Upload en cours...' : 'Ajouter une capture'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label>Note avant trade</Label>
            <Textarea value={form.noteAvant} onChange={e => update('noteAvant', e.target.value)} placeholder="Analyse, raison d'entrée..." className="bg-secondary border-border" />
          </div>
          <div>
            <Label>Note après trade</Label>
            <Textarea value={form.noteApres} onChange={e => update('noteApres', e.target.value)} placeholder="Leçons apprises, ce qui a bien/mal fonctionné..." className="bg-secondary border-border" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 gradient-gold text-primary-foreground font-semibold">
              {initialData ? 'Modifier' : 'Ajouter le trade'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeForm;
