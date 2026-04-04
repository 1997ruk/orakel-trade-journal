import { useState, useMemo } from 'react';
import { useTrades } from '@/hooks/useTrades';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import PerformanceChart from '@/components/PerformanceChart';
import WinrateChart from '@/components/WinrateChart';
import TradeForm from '@/components/TradeForm';
import TradeRow from '@/components/TradeRow';
import { Trade } from '@/types/trade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, BarChart3, BookOpen, TrendingUp, Target, Shield,
  Activity, Award, AlertTriangle, Search, LogOut, FileDown
} from 'lucide-react';
import SyncIndicator from '@/components/SyncIndicator';
import { exportJournalPdf } from '@/utils/exportPdf';
import TradeCalendar from '@/components/TradeCalendar';
import { computeStats, filterByPeriod, type Period } from '@/utils/computeStats';
import { SETUPS, ACTIFS } from '@/types/trade';

const PERIOD_LABELS: Record<Period, string> = {
  all: 'Tout',
  week: 'Semaine',
  month: 'Mois',
  quarter: 'Trimestre',
};

const Index = () => {
  const { trades, stats, loading, addTrade, updateTrade, deleteTrade } = useTrades();
  const { signOut } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | undefined>();
  const [filterActif, setFilterActif] = useState('all');
  const [filterSetup, setFilterSetup] = useState('all');
  const [searchDate, setSearchDate] = useState('');
  const [dashboardPeriod, setDashboardPeriod] = useState<Period>('all');

  const filteredTrades = useMemo(() => {
    return trades
      .filter(t => filterActif === 'all' || t.actif === filterActif)
      .filter(t => filterSetup === 'all' || t.setup === filterSetup)
      .filter(t => !searchDate || t.date.includes(searchDate))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, filterActif, filterSetup, searchDate]);

  const periodTrades = useMemo(() => filterByPeriod(trades, dashboardPeriod), [trades, dashboardPeriod]);
  const periodStats = useMemo(() => computeStats(periodTrades), [periodTrades]);

  const handleEdit = (trade: Trade) => {
    setEditTrade(trade);
    setFormOpen(true);
  };

  const handleSubmit = (data: Omit<Trade, 'id'>) => {
    if (editTrade) {
      updateTrade(editTrade.id, data);
      setEditTrade(undefined);
    } else {
      addTrade(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-gold">Orakel</span> Trading Journal
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportJournalPdf(trades, stats)} className="gap-2 border-border text-muted-foreground hover:text-foreground">
              <FileDown className="w-4 h-4" /> Export PDF
            </Button>
            <Button onClick={() => { setEditTrade(undefined); setFormOpen(true); }} className="gradient-gold text-primary-foreground font-semibold gap-2">
              <Plus className="w-4 h-4" /> Nouveau Trade
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground" title="Déconnexion">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-card data-[state=active]:text-gold gap-2">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="journal" className="data-[state=active]:bg-card data-[state=active]:text-gold gap-2">
              <BookOpen className="w-4 h-4" /> Journal
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-card data-[state=active]:text-gold gap-2">
              <Activity className="w-4 h-4" /> Statistiques
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Period filter */}
            <div className="flex items-center gap-2">
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <Button
                  key={p}
                  variant={dashboardPeriod === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDashboardPeriod(p)}
                  className={dashboardPeriod === p ? 'gradient-gold text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}
                >
                  {PERIOD_LABELS[p]}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Trades" value={periodStats.totalTrades} icon={<Activity className="w-5 h-5" />} />
              <StatCard title="Winrate" value={`${periodStats.winrate.toFixed(1)}%`} icon={<Target className="w-5 h-5" />} trend={periodStats.winrate >= 50 ? 'up' : periodStats.winrate > 0 ? 'down' : 'neutral'} />
              <StatCard title="Profit Net" value={`${periodStats.profitNetR >= 0 ? '+' : ''}${periodStats.profitNetR.toFixed(1)}R`} icon={<TrendingUp className="w-5 h-5" />} trend={periodStats.profitNetR >= 0 ? 'up' : 'down'} />
              <StatCard title="Discipline" value={`${periodStats.tauxDiscipline.toFixed(0)}%`} icon={<Shield className="w-5 h-5" />} trend={periodStats.tauxDiscipline >= 80 ? 'up' : periodStats.tauxDiscipline > 0 ? 'down' : 'neutral'} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Courbe de Performance (R)</h3>
                <PerformanceChart trades={periodTrades} />
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Répartition Gains/Pertes</h3>
                <WinrateChart trades={periodTrades} />
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-profit" />
                    <span className="text-xs text-muted-foreground">Gains ({periodStats.tradesGagnants})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-loss" />
                    <span className="text-xs text-muted-foreground">Pertes ({periodStats.tradesPerdants})</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Trades Récents</h3>
              <div className="space-y-2">
                {periodTrades.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucun trade sur cette période.</p>
                ) : (
                  [...periodTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(t => (
                    <TradeRow key={t.id} trade={t} onEdit={handleEdit} onDelete={deleteTrade} />
                  ))
                )}
              </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Calendrier</h3>
                <TradeCalendar trades={periodTrades} />
              </div>
            </div>
          </TabsContent>

          {/* JOURNAL */}
          <TabsContent value="journal" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="pl-10 bg-secondary border-border" placeholder="Filtrer par date" />
              </div>
              <Select value={filterActif} onValueChange={setFilterActif}>
                <SelectTrigger className="w-[150px] bg-secondary border-border"><SelectValue placeholder="Actif" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les actifs</SelectItem>
                  {ACTIFS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterSetup} onValueChange={setFilterSetup}>
                <SelectTrigger className="w-[150px] bg-secondary border-border"><SelectValue placeholder="Setup" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les setups</SelectItem>
                  {SETUPS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {filteredTrades.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun trade trouvé</p>
                </div>
              ) : filteredTrades.map(t => <TradeRow key={t.id} trade={t} onEdit={handleEdit} onDelete={deleteTrade} />)}
            </div>
          </TabsContent>

          {/* STATS */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard title="Total Trades" value={stats.totalTrades} icon={<Activity className="w-5 h-5" />} />
              <StatCard title="Trades Gagnants" value={stats.tradesGagnants} icon={<TrendingUp className="w-5 h-5" />} trend="up" />
              <StatCard title="Trades Perdants" value={stats.tradesPerdants} icon={<AlertTriangle className="w-5 h-5" />} trend="down" />
              <StatCard title="Winrate" value={`${stats.winrate.toFixed(1)}%`} icon={<Target className="w-5 h-5" />} trend={stats.winrate >= 50 ? 'up' : 'down'} />
              <StatCard title="Profit Total" value={`+${stats.profitTotalR.toFixed(1)}R`} icon={<TrendingUp className="w-5 h-5" />} trend="up" />
              <StatCard title="Perte Totale" value={`-${stats.perteTotaleR.toFixed(1)}R`} icon={<AlertTriangle className="w-5 h-5" />} trend="down" />
              <StatCard title="Profit Net" value={`${stats.profitNetR >= 0 ? '+' : ''}${stats.profitNetR.toFixed(1)}R`} icon={<Award className="w-5 h-5" />} trend={stats.profitNetR >= 0 ? 'up' : 'down'} />
              <StatCard title="Moyenne R/Trade" value={`${stats.moyenneR.toFixed(2)}R`} icon={<BarChart3 className="w-5 h-5" />} />
              <StatCard title="Discipline" value={`${stats.tauxDiscipline.toFixed(0)}%`} icon={<Shield className="w-5 h-5" />} trend={stats.tauxDiscipline >= 80 ? 'up' : 'down'} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-1">Setup le plus rentable</p>
                <p className="text-lg font-bold text-profit">{stats.setupPlusRentable}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-1">Setup le moins rentable</p>
                <p className="text-lg font-bold text-loss">{stats.setupMoinsRentable}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-1">Actif le plus rentable</p>
                <p className="text-lg font-bold text-gold">{stats.actifPlusRentable}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TradeForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTrade(undefined); }}
        onSubmit={handleSubmit}
        initialData={editTrade}
      />
    </div>
  );
};

export default Index;
