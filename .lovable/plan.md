

# Plan : Activer Lovable Cloud — Base de données, Authentification & Stockage

## Résumé

Migrer l'application Orakel Trading Journal du localStorage vers Lovable Cloud (Supabase) avec authentification utilisateur, base de données relationnelle et stockage des captures d'écran.

## Étapes

### 1. Activer Lovable Cloud
- Activer Lovable Cloud depuis l'interface Lovable (clic sur "Enable Lovable Cloud" dans le panneau Cloud)

### 2. Créer le schéma de base de données (migration)
- **Table `profiles`** : `id` (FK → auth.users), `username`, `email`, `created_at`
  - Trigger automatique pour créer un profil à l'inscription
- **Table `trades`** : toutes les colonnes existantes du type `Trade` + `user_id` (FK → profiles) + `image_url` (text, nullable)
- **Bucket de stockage** `trade-screenshots` (privé) pour les captures d'écran
- **RLS activé** sur toutes les tables :
  - `trades` : SELECT/INSERT/UPDATE/DELETE uniquement si `user_id = auth.uid()`
  - `profiles` : SELECT pour l'utilisateur authentifié, UPDATE sur son propre profil
  - Storage : politiques pour que chaque utilisateur ne puisse accéder qu'à son propre dossier

### 3. Créer les pages d'authentification
- **Page `/auth`** : formulaire Login / Inscription (email + mot de passe)
- **Composant `AuthGuard`** : protège les routes, redirige vers `/auth` si non connecté
- **Bouton de déconnexion** dans le header
- Gestion de session via `onAuthStateChange`

### 4. Migrer le hook `useTrades` vers Supabase
- Remplacer le localStorage par des requêtes Supabase :
  - `addTrade` → `supabase.from('trades').insert()`
  - `updateTrade` → `supabase.from('trades').update()`
  - `deleteTrade` → `supabase.from('trades').delete()`
  - Chargement → `supabase.from('trades').select().eq('user_id', uid)`
- Les stats restent calculées côté client à partir des données récupérées

### 5. Ajouter l'upload de captures d'écran
- Modifier `TradeForm` : ajouter un champ d'upload d'image
- Upload vers le bucket `trade-screenshots` dans le dossier `{user_id}/`
- Stocker l'URL publique dans la colonne `image_url` du trade
- Afficher la miniature dans `TradeRow` si une image existe

### 6. Mettre à jour le routage
- Routes : `/auth`, `/` (protégée par AuthGuard)
- Route `/reset-password` pour la réinitialisation du mot de passe

## Détails techniques

```text
Routes:
  /auth           → Login/Signup (public)
  /reset-password → Reset password (public)
  /               → Dashboard (protégé)

Tables Supabase:
  profiles (id uuid PK, username text, email text, created_at timestamptz)
  trades (id uuid PK, user_id uuid FK, date date, actif text, setup text, 
          direction text, prix_entree numeric, stop_loss numeric, 
          take_profit numeric, risque_pourcentage numeric, 
          taille_position numeric, resultat text, r_multiple numeric, 
          trade_respecte boolean, emotion text, note_avant text, 
          note_apres text, image_url text)

Storage:
  Bucket: trade-screenshots (privé)
  Structure: {user_id}/{filename}
```

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| Migration SQL | Créer tables + RLS + trigger + bucket |
| `src/pages/Auth.tsx` | Créer — page login/signup |
| `src/pages/ResetPassword.tsx` | Créer — page reset password |
| `src/components/AuthGuard.tsx` | Créer — protection des routes |
| `src/hooks/useAuth.ts` | Créer — gestion session |
| `src/hooks/useTrades.ts` | Modifier — Supabase au lieu de localStorage |
| `src/components/TradeForm.tsx` | Modifier — ajouter upload image |
| `src/components/TradeRow.tsx` | Modifier — afficher miniature |
| `src/types/trade.ts` | Modifier — ajouter `image_url`, adapter types |
| `src/App.tsx` | Modifier — ajouter routes auth |
| `src/pages/Index.tsx` | Modifier — bouton déconnexion, AuthGuard |

