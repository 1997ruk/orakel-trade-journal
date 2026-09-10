import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Mail, Lock, Target, Shield, LineChart, WifiOff } from 'lucide-react';

const Landing = () => {
  const { user, loading, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre inscription.' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Orakel Trading Journal — Journal de trading & statistiques</title>
        <meta name="description" content="Créez votre journal de trading gratuit : enregistrez vos trades, suivez winrate, R-multiple, drawdown et discipline sur un dashboard clair, en ligne et hors ligne." />
        <link rel="canonical" href="https://orakel-trade-journal.lovable.app/" />
        <meta property="og:title" content="Orakel Trading Journal — Inscription gratuite" />
        <meta property="og:description" content="Inscrivez-vous et accédez au dashboard : trades, statistiques avancées, objectifs hebdomadaires et export PDF." />
        <meta property="og:url" content="https://orakel-trade-journal.lovable.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Orakel Trading Journal',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web, Android',
          description: 'Journal de trading professionnel avec statistiques avancées, objectifs hebdomadaires et mode hors ligne.',
          url: 'https://orakel-trade-journal.lovable.app/',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        })}</script>
      </Helmet>

      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold"><span className="text-gold">Orakel</span> Trading Journal</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/trades" className="text-muted-foreground hover:text-foreground hidden sm:inline">Journal</Link>
            <Link to="/stats" className="text-muted-foreground hover:text-foreground hidden sm:inline">Statistiques</Link>
            <Link to="/login" className="text-gold hover:underline">Se connecter</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Le journal de trading qui construit votre <span className="text-gold">discipline</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Enregistrez chaque trade, mesurez votre winrate, votre R-multiple et votre drawdown,
              et suivez vos objectifs hebdomadaires — sur ordinateur comme sur Android, même hors connexion.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4">
              <Feature icon={<LineChart className="w-4 h-4" />} title="Statistiques avancées" text="Equity curve, drawdown, séries de gains et pertes." />
              <Feature icon={<Target className="w-4 h-4" />} title="Objectifs hebdo" text="Trades, winrate et R cible suivis en temps réel." />
              <Feature icon={<Shield className="w-4 h-4" />} title="Score de discipline" text="Respect du plan et du risk management." />
              <Feature icon={<WifiOff className="w-4 h-4" />} title="Mode hors ligne" text="Vos trades se synchronisent au retour du réseau." />
            </ul>
          </div>

          <section aria-labelledby="signup-title" className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 id="signup-title" className="text-xl font-bold">Créer un compte gratuit</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="trader@exemple.com" required className="bg-secondary border-border mt-1" />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Lock className="w-4 h-4" /> Mot de passe</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-secondary border-border mt-1" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full gradient-gold text-primary-foreground font-semibold">
                {submitting ? 'Création...' : "S'inscrire gratuitement"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center">
              Déjà un compte ? <Link to="/login" className="text-gold hover:underline">Accéder au dashboard</Link>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/trades" className="hover:text-foreground">Journal de trades</Link>
          <Link to="/stats" className="hover:text-foreground">Statistiques</Link>
          <Link to="/login" className="hover:text-foreground">Connexion</Link>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <li className="rounded-lg border border-border bg-card p-4">
    <p className="flex items-center gap-2 font-semibold text-gold text-sm">{icon}{title}</p>
    <p className="text-sm text-muted-foreground mt-1">{text}</p>
  </li>
);

export default Landing;
