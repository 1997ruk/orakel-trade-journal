import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatsInfo = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Statistiques de trading — Orakel Trading Journal</title>
      <meta name="description" content="Winrate, R-multiple moyen, drawdown maximum, séries de gains et pertes, performance par setup, actif, jour et émotion." />
      <link rel="canonical" href="https://orakel-trade-journal.lovable.app/stats" />
      <meta property="og:title" content="Statistiques de trading — Orakel Trading Journal" />
      <meta property="og:description" content="Analysez vos performances : equity curve, drawdown, discipline et risk management." />
      <meta property="og:url" content="https://orakel-trade-journal.lovable.app/stats" />
      <meta property="og:type" content="website" />
    </Helmet>

    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold"><span className="text-gold">Orakel</span> Trading Journal</span>
        </Link>
        <Link to="/login" className="text-sm text-gold hover:underline">Se connecter</Link>
      </div>
    </header>

    <main className="container mx-auto px-4 py-12 max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold">Statistiques de trading</h1>
      <p className="text-muted-foreground text-lg">
        Le dashboard calcule automatiquement vos indicateurs à partir de vos trades,
        par semaine, mois, trimestre ou sur l'ensemble de votre historique.
      </p>
      <h2 className="text-2xl font-bold pt-4">Indicateurs disponibles</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>Courbe de performance (equity curve) en R</li>
        <li>Drawdown maximum et courbe de drawdown</li>
        <li>Séries de gains et de pertes consécutives</li>
        <li>Meilleur et pire trade</li>
        <li>Performance par setup, par actif, par jour et par émotion</li>
        <li>Score de discipline et score de risk management</li>
        <li>Objectifs hebdomadaires : nombre de trades, winrate cible, R cible</li>
      </ul>
      <div className="flex gap-3 pt-4">
        <Link to="/"><Button className="gradient-gold text-primary-foreground font-semibold">Commencer gratuitement</Button></Link>
        <Link to="/trades"><Button variant="outline" className="border-border">Voir le journal</Button></Link>
      </div>
    </main>
  </div>
);

export default StatsInfo;
