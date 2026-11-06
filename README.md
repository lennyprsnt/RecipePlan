# RecipePlan

Application web MERN (MongoDB, Express, React, Node.js) pour créer ses recettes, planifier ses repas de la semaine et obtenir automatiquement une liste de courses.

Point clé : les quantités d'un même ingrédient sont additionnées après conversion des unités compatibles. Par exemple, 500 g + 1 kg de farine donnent 1,5 kg.

Projet réalisé seul dans le cadre de la formation. Auteur : <ton nom>.

## Sommaire

1. Fonctionnalités
2. Technologies
3. Prérequis
4. Installation et lancement
5. Comptes de démonstration
6. Scénario de démonstration
7. Documentation de l'API
8. Règles métier
9. Tests
10. Structure du projet
11. Dépannage
12. Limites connues
13. Documentation de modélisation

## 1. Fonctionnalités

| Fonctionnalité | Interface | API |
|---|---|---|
| Inscription et connexion | oui | oui |
| Créer une recette (titre, portions, ingrédients avec quantité et unité) | oui | oui |
| Lister ses recettes | oui | oui |
| Supprimer une recette | oui | oui |
| Consulter ou modifier une recette | non | oui |
| Créer le planning d'une semaine | oui | oui |
| Ajouter ou retirer un repas (jour, midi ou soir, recette) | oui | oui |
| Liste de courses avec conversion des unités | oui | oui |
| Suppression d'une recette par l'administrateur | non | oui |

Autres points :
- Chaque utilisateur ne voit que ses propres recettes et plannings.
- L'interface gère les états de chargement, d'erreur et de liste vide.
- Les données envoyées sont validées côté serveur.

## 2. Technologies

| Couche | Outils |
|---|---|
| Interface | React, Vite, React Router |
| API REST | Node.js, Express 5, Zod (validation) |
| Base de données | MongoDB, Mongoose |
| Authentification | JWT (durée de 2 heures), bcryptjs |
| Tests | Vitest, Supertest, mongodb-memory-server |

## 3. Prérequis

- Node.js 20 ou plus
- Git
- Docker (pour lancer MongoDB), ou une instance MongoDB déjà installée sur le port 27017
- Une connexion internet au premier lancement des tests (téléchargement d'un binaire MongoDB)

## 4. Installation et lancement

### 4.1 Récupérer le projet

```bash
git clone <url-du-depot>
cd recipeplan
```

### 4.2 Lancer MongoDB

```bash
docker run -d --name mongo-recipeplan -p 27017:27017 mongo:7
```

Si le conteneur existe déjà : `docker start mongo-recipeplan`.

### 4.3 Lancer l'API (http://localhost:5000)

```bash
cd server
cp .env.example .env
```

Ouvrir `server/.env` et renseigner les variables :

| Variable | Rôle | Valeur conseillée |
|---|---|---|
| MONGO_URI | Adresse de la base | mongodb://127.0.0.1:27017/recipeplan |
| JWT_SECRET | Secret de signature des tokens | une longue phrase de votre choix |
| PORT | Port de l'API | 5000 |

Puis :

```bash
npm install
npm run seed
npm run dev
```

Le terminal doit afficher `MongoDB connecté` puis `API sur http://localhost:5000`.

Attention : `npm run seed` vide les collections users, recipes et plans avant de recréer les données de démonstration. Il sert aussi à remettre la base à zéro.

### 4.4 Lancer l'interface (http://localhost:5173)

Dans un second terminal :

```bash
cd client
npm install
npm run dev
```

Ouvrir http://localhost:5173. Les appels à `/api` sont redirigés vers l'API par le proxy de Vite (configuré dans `client/vite.config.js`). L'API et l'interface doivent donc tourner en même temps.

## 5. Comptes de démonstration

Créés par `npm run seed`. Mot de passe commun : `motdepasse123`.

| Email | Rôle | Contenu |
|---|---|---|
| alice@example.com | utilisateur | 2 recettes et 1 planning (semaine du 2026-11-09) |
| bob@example.com | utilisateur | aucune donnée |
| admin@example.com | administrateur | aucune donnée |

Données de départ d'Alice :

| Recette | Ingrédients |
|---|---|
| Pâtes tomate (2 pers.) | pâtes 250 g, tomate 4 piece, huile 2 cl |
| Gâteau au yaourt (6 pers.) | farine 0,5 kg, huile 50 ml, œuf 3 piece |

| Planning du 2026-11-09 | Recette |
|---|---|
| Lundi soir | Pâtes tomate |
| Mercredi soir | Pâtes tomate |
| Samedi midi | Gâteau au yaourt |

## 6. Scénario de démonstration

Avant de commencer : exécuter `npm run seed` pour repartir d'une base propre.

### Partie A : parcours complet avec Alice

1. Ouvrir http://localhost:5173 et se connecter avec `alice@example.com`.
2. Cliquer sur « Recettes ». Deux recettes sont affichées : Pâtes tomate (2 pers., 3 ingrédients) et Gâteau au yaourt (6 pers., 3 ingrédients).
3. Cliquer sur « + Nouvelle recette » et saisir : titre `Crêpes`, 4 portions, puis trois ingrédients : `farine` 600 g, `lait` 50 cl, `œuf` 2 piece. Cliquer sur « Enregistrer ». La recette apparaît dans la liste.
4. Aller dans « Planning » et choisir la semaine 2026-11-09 dans la liste déroulante. Les trois repas du seed s'affichent.
5. Cliquer sur « Générer la liste de courses ». Résultat attendu :

| Ingrédient | Quantité |
|---|---|
| farine | 500 g |
| huile | 90 ml |
| pâtes | 500 g |
| tomate | 8 piece |
| œuf | 3 piece |

Le détail du calcul : huile = 2 cl × 2 repas (40 ml) + 50 ml = 90 ml ; pâtes = 250 g × 2 = 500 g ; tomate = 4 × 2 = 8. L'ordre des lignes peut varier.

6. Ajouter un repas : Dimanche, soir, recette Crêpes, puis cliquer sur « Ajouter ». Le repas apparaît dans la liste.
7. Régénérer la liste de courses. Résultat attendu :

| Ingrédient | Quantité | Explication |
|---|---|---|
| farine | 1.1 kg | 500 g + 600 g = 1100 g, affiché en kg |
| lait | 500 ml | 50 cl converti en ml |
| huile | 90 ml | inchangé |
| pâtes | 500 g | inchangé |
| tomate | 8 piece | inchangé |
| œuf | 5 piece | 3 + 2 |

8. Cliquer sur « Retirer » à côté du repas Crêpes : il disparaît et la liste de courses est à régénérer.

### Partie B : états de l'interface et erreurs

1. Se déconnecter, puis se connecter avec `bob@example.com`.
2. « Recettes » affiche « Aucune recette pour le moment. » et « Planning » affiche « Aucun planning : crée ta première semaine. » (état liste vide).
3. Dans « Planning », créer une semaine puis la recréer avec la même date : un message d'erreur s'affiche (un seul planning par semaine).
4. Se connecter avec un mauvais mot de passe : le message « Identifiants incorrects » s'affiche.
5. Arrêter l'API (Ctrl+C dans son terminal) puis recharger la page : un message d'erreur s'affiche à la place de la liste. Relancer ensuite l'API avec `npm run dev`.

### Partie C : droits d'accès via l'API

Les commandes suivantes se lancent dans un terminal, API démarrée. Les tokens sont dans la réponse JSON des connexions : copier la valeur du champ `token` pour remplacer `TOKEN_ALICE`, `TOKEN_BOB` et `TOKEN_ADMIN`.

```bash
# 1. Sans token : 401
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/recipes

# 2. Connexion d'Alice, Bob et admin (copier chaque token)
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"motdepasse123"}'
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"bob@example.com","password":"motdepasse123"}'
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"motdepasse123"}'

# 3. Recettes d'Alice : copier le champ _id de « Crêpes » à la place de ID_CREPES
curl -s http://localhost:5000/api/recipes -H "Authorization: Bearer TOKEN_ALICE"

# 4. Bob tente de lire puis de supprimer la recette d'Alice : 404 dans les deux cas
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/recipes/ID_CREPES -H "Authorization: Bearer TOKEN_BOB"
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:5000/api/recipes/ID_CREPES -H "Authorization: Bearer TOKEN_BOB"

# 5. L'administrateur supprime la recette d'Alice : 204
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:5000/api/recipes/ID_CREPES -H "Authorization: Bearer TOKEN_ADMIN"

# 6. Validation côté serveur : unité invalide, 400
curl -s -w "\n%{http_code}\n" -X POST http://localhost:5000/api/recipes -H "Authorization: Bearer TOKEN_ALICE" -H "Content-Type: application/json" -d '{"title":"Test","ingredients":[{"name":"x","quantity":1,"unit":"tasse"}]}'
```

Résumé des codes attendus : 401, puis 404, 404, 204, puis 400.

Les tokens expirent au bout de 2 heures : se reconnecter pour en obtenir un nouveau.

## 7. Documentation de l'API

Base : `http://localhost:5000/api`. Toutes les routes, sauf `/auth/*`, demandent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Description | Réponse |
|---|---|---|---|
| POST | /auth/register | Créer un compte (email, password de 8 caractères minimum) | 201 + token |
| POST | /auth/login | Se connecter | 200 + token |
| GET | /recipes | Lister ses recettes | 200 |
| POST | /recipes | Créer une recette | 201 |
| GET | /recipes/:id | Détail d'une recette (propriétaire) | 200 ou 404 |
| PUT | /recipes/:id | Modifier une recette (propriétaire) | 200 ou 404 |
| DELETE | /recipes/:id | Supprimer (propriétaire ou admin) | 204 ou 404 |
| GET | /plans | Lister ses plannings | 200 |
| POST | /plans | Créer le planning d'une semaine (`weekStart`) | 201 ou 409 |
| POST | /plans/:id/entries | Ajouter un repas (`day`, `meal`, `recipe`) | 201 ou 404 |
| DELETE | /plans/:id/entries/:entryId | Retirer un repas | 204 ou 404 |
| GET | /plans/:id/shopping-list | Liste de courses agrégée | 200 ou 404 |

Exemple de corps pour créer une recette :

```json
{
  "title": "Crêpes",
  "servings": 4,
  "ingredients": [
    { "name": "farine", "quantity": 600, "unit": "g" },
    { "name": "lait", "quantity": 50, "unit": "cl" }
  ]
}
```

Exemple de corps pour ajouter un repas (`day` va de 0 pour lundi à 6 pour dimanche) :

```json
{ "day": 6, "meal": "soir", "recipe": "<id de la recette>" }
```

Codes d'erreur :

| Code | Signification |
|---|---|
| 400 | Données invalides ou identifiant mal formé |
| 401 | Token absent, invalide ou expiré |
| 404 | Ressource inexistante ou appartenant à un autre utilisateur |
| 409 | Doublon (email déjà utilisé, semaine déjà planifiée) |
| 500 | Erreur serveur |

## 8. Règles métier

- Unités acceptées : g, kg, ml, cl, l, piece.
- Les masses (g, kg) sont additionnées entre elles ; les volumes (ml, cl, l) entre eux ; les pièces entre elles.
- Un ingrédient exprimé à la fois en masse et en volume reste sur deux lignes séparées.
- L'unité d'affichage est kg ou l à partir de 1000 g ou 1000 ml, sinon g ou ml.
- Une recette est visible et modifiable uniquement par son auteur. Sur la recette d'un autre utilisateur, l'API répond 404, pas 403, pour ne pas révéler son existence.
- Seul l'auteur ou un administrateur peut supprimer une recette.
- Un utilisateur ne peut planifier que ses propres recettes.
- Un seul planning par utilisateur et par semaine.
- La suppression d'une recette la retire aussi de tous les plannings.
- Les mots de passe sont hachés avec bcrypt et ne sont jamais stockés en clair.

## 9. Tests

```bash
cd server
npm test
```

| Fichier | Vérifie |
|---|---|
| tests/units.test.js | 500 g + 1 kg = 1,5 kg ; cl + ml ; masse et volume non mélangés ; unité inconnue rejetée |
| tests/api.test.js | 401 sans token ; 404 sur la recette d'un autre utilisateur ; 400 pour une unité invalide ; liste de courses d'un planning |

Les tests d'API utilisent une base MongoDB en mémoire : la base de développement n'est pas modifiée. Tous les tests doivent être au vert.

## 10. Structure du projet

```
recipeplan/
  README.md
  docs/
    MODELISATION.md
  client/
    vite.config.js
    src/
      main.jsx  App.jsx  api.js  useApi.js  Status.jsx  AuthContext.jsx
      pages/    Login.jsx  Recipes.jsx  RecipeForm.jsx  Planner.jsx
  server/
    .env.example
    src/
      app.js  server.js  seed.js
      models/       User.js  Recipe.js  Plan.js
      routes/       auth.js  recipes.js  plans.js
      middleware/   auth.js
      services/     units.js
    tests/          units.test.js  api.test.js
```

## 11. Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:27017` au démarrage de l'API | MongoDB n'est pas lancé | `docker start mongo-recipeplan` |
| `secretOrPrivateKey must have a value` | `.env` absent ou mal placé | le fichier doit être dans `server/`, à côté de `package.json` |
| `Cannot use import statement outside a module` | `"type": "module"` manquant | l'ajouter dans `server/package.json` |
| Port 5000 ou 5173 déjà utilisé | un autre programme l'occupe | changer `PORT` dans `.env` (et la cible du proxy dans `client/vite.config.js`) |
| Message « Token invalide ou expiré » dans l'interface | le token a plus de 2 heures | se déconnecter puis se reconnecter |
| L'interface affiche une erreur partout | l'API n'est pas lancée | lancer `npm run dev` dans `server` |
| Les tests échouent au premier lancement | le binaire MongoDB n'a pas pu être téléchargé | vérifier la connexion internet et relancer |
| Données de démonstration modifiées | utilisation précédente | relancer `npm run seed` |

## 12. Limites connues

- Pas d'équivalence entre masse et volume : 1 l de lait n'est pas converti en grammes.
- Les quantités ne sont pas ajustées au nombre de portions.
- La modification d'une recette et le rôle administrateur ne sont disponibles que par l'API.
- Le token est stocké dans le localStorage ; une version en production utiliserait un cookie HttpOnly.
- Pas de réinitialisation de mot de passe.

## 13. Documentation de modélisation

La modélisation de la base de données (MCD, MLD, MPD et diagramme de cas d'utilisation) est regroupée dans un seul schéma :

[Voir la modélisation (Modélisation.png)](docs/Mod%C3%A9lisation.png)

![Modélisation de RecipePlan](docs/Mod%C3%A9lisation.png)

