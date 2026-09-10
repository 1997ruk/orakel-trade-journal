import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TradesInfo = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Journal de trades — Orakel Trading Journal</title>
      <meta name="description" content="Enregistrez chaque trade : actif, setup, direction, entrée, stop, take profit, R-multiple, émotion, captures d'écran et tags personnalisés." />
      <link rel="canonical" href="https://orakel-trade-journal.lovable.app/trades" />
      <meta property="og:title" content="Journal de trades — Orakel Trading Journal" />
      <meta property="og:description" content="Un journal complet : setups, R-multiple, émotions, captures d'écran, tags et export PDF." />
      <meta property="og:url" content="https://orakel-trade-journal.lovable.app/trades" />
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
      <h1 className="text-4xl font-bold">Journal de trades</h1>
      <p className="text-muted-foreground text-lg">
        Chaque trade est enregistré avec tout ce qui compte pour progresser : la date, l'actif,
        le setup, la direction, le prix d'entrée, le stop loss, le take profit, le risque en pourcentage
        et la taille de position.
      </p>
      <h2 className="text-2xl font-bold pt-4">Ce que vous notez pour chaque trade</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
        <li>Résultat et R-multiple calculé automatiquement</li>
        <li>Respect du plan de trading et émotion ressentie</li>
        <li>Notes avant et après l'exécution</li>
        <li>Capture d'écran du graphique</li>
        <li>Tags personnalisés au-delà des setups prédéfinis</li>
      </ul>
      <h2 className="text-2xl font-bold pt-4">Filtres et export</h2>
      <p className="text-muted-foreground">
        Filtrez par date, actif ou setup, retrouvez vos trades en un instant et exportez
        l'ensemble de votre journal en PDF avec les statistiques complètes.
      </p>
      <div className="flex gap-3 pt-4">
        <Link to="/"><Button className="gradient-gold text-primary-foreground font-semibold">Créer mon journal</Button></Link>
        <Link to="/stats"><Button variant="outline" className="border-border">Voir les statistiques</Button></Link>
      </div>
    </main>
  </div>
);

export default TradesInfo;
