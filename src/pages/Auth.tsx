import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (showReset) {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
        setShowReset(false);
      }
      return;
    }

    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else if (!isLogin) {
      toast({ title: 'Compte créé', description: 'Vérifiez votre email pour confirmer votre inscription.' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Connexion — Orakel Trading Journal</title>
        <meta name="description" content="Connectez-vous à Orakel Trading Journal pour accéder à votre journal de trades, vos statistiques et vos objectifs hebdomadaires." />
        <link rel="canonical" href="https://orakel-trade-journal.lovable.app/login" />
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-gold">Orakel</span> Trading Journal
          </h1>
          <p className="text-muted-foreground mt-2">
            {showReset ? 'Réinitialiser le mot de passe' : isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="trader@exemple.com"
              required
              className="bg-secondary border-border mt-1"
            />
          </div>

          {!showReset && (
            <div>
              <Label className="flex items-center gap-2"><Lock className="w-4 h-4" /> Mot de passe</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-secondary border-border mt-1"
              />
            </div>
          )}

          <Button type="submit" className="w-full gradient-gold text-primary-foreground font-semibold" disabled={loading}>
            {loading ? 'Chargement...' : showReset ? 'Envoyer le lien' : isLogin ? 'Se connecter' : "S'inscrire"}
          </Button>

          <div className="flex flex-col items-center gap-2 text-sm">
            {!showReset && (
              <button type="button" onClick={() => setShowReset(true)} className="text-gold hover:underline">
                Mot de passe oublié ?
              </button>
            )}
            <button
              type="button"
              onClick={() => { setShowReset(false); setIsLogin(!isLogin); }}
              className="text-muted-foreground hover:text-foreground"
            >
              {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
