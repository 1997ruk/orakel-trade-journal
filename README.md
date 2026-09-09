# Orakel Trading Journal

Crée une application mobile et web appelée Orakel Trading Journal.

C’est un journal de trading professionnel qui permet aux traders d’enregistrer leurs trades, d’analyser leurs performances et d’améliorer leur discipline.

1. Base de données

L’application doit utiliser une base de données pour stocker toutes les informations des utilisateurs et des trades.

Tables principales :

Table Utilisateurs :

id_utilisateur

nom

email

mot_de_passe

date_inscription

Table Trades :

id_trade

id_utilisateur

date_trade

actif (ex: EURUSD, XAUUSD, BTCUSD…)

setup (OB, FVG, Breaker Block, Range, Liquidity Sweep…)

direction (Buy / Sell)

prix_entree

stop_loss

take_profit

risque_pourcentage

taille_position

resultat (Gain / Perte)

r_multiple

trade_respecte (Oui / Non)

emotion (Confiance, Peur, Impatience, Revenge trade, Discipline)

note_avant_trade

note_apres_trade

image_trade (capture d’écran)

2. Statistiques automatiques (à partir de la base de données)

L’application doit calculer automatiquement :

Nombre total de trades

Nombre de trades gagnants

Nombre de trades perdants

Winrate (%)

Profit total en R

Perte totale en R

Profit net en R

Moyenne R par trade

Setup le plus rentable

Setup le moins rentable

Actif le plus rentable

Taux de discipline (% de trades respectés)

3. Tableau de bord (Dashboard)

Le tableau de bord doit afficher :

Performance de la semaine

Performance du mois

Courbe de performance (en R)

Graphique Winrate

Nombre de trades cette semaine

Score de discipline

4. Fonctionnalités

Ajouter un trade

Modifier un trade

Supprimer un trade

Ajouter une capture d’écran

Filtrer par date, actif, setup

Exporter le journal en PDF

5. Design

Style professionnel

Couleurs : Noir, Or, Blanc

Interface simple, moderne et lisible

Application mobile + web

6. Objectif

L’objectif de l’application est d’aider le trader à améliorer :

Sa stratégie

Sa discipline

Sa psychologie

Sa rentabilité

L’application doit être rapide, simple à utiliser, et orientée analyse de performance.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://orakel-trade-journal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c6846b3-08c3-4bc9-a5ff-af2d106b1e72).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
