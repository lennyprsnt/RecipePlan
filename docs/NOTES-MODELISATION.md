# Notes de modélisation : RecipePlan

## 1. Règles de gestion

Utilisateurs et sécurité
- RG1 : un utilisateur est identifié par son email, unique.
- RG2 : le mot de passe a au moins 8 caractères et est stocké haché.
- RG3 : un utilisateur a un rôle : utilisateur ou administrateur.
- RG4 : un utilisateur ne voit et ne modifie que ses propres recettes et plannings.
- RG5 : un administrateur peut supprimer la recette de n'importe qui.

Recettes
- RG6 : un utilisateur possède 0 ou plusieurs recettes ; une recette appartient à un seul utilisateur.
- RG7 : une recette comprend au moins un ingrédient.
- RG8 : chaque ingrédient d'une recette a une quantité positive et une unité parmi g, kg, ml, cl, l, piece.
- RG9 : une recette a un titre et au moins 1 portion.

Planning
- RG10 : un utilisateur possède 0 ou plusieurs plannings ; un planning appartient à un seul utilisateur.
- RG11 : au plus un planning par utilisateur et par semaine.
- RG12 : un planning contient 0 ou plusieurs repas ; plusieurs recettes peuvent être prévues au même créneau.
- RG13 : un repas planifié concerne une seule recette ; une recette peut être planifiée plusieurs fois.
- RG14 : supprimer une recette la retire des plannings.

Liste de courses
- RG15 : elle est calculée à partir des recettes planifiées.
- RG16 : les quantités d'un même ingrédient sont additionnées après conversion en unité de base (g pour les masses, ml pour les volumes).
- RG17 : une masse et un volume ne sont jamais additionnés.

## 2. MCD

### Entités
| Entité | Identifiant | Propriétés |
|---|---|---|
| UTILISATEUR | id_utilisateur | email, mot_de_passe_hash, role |
| RECETTE | id_recette | titre, portions |
| ETAPE | id_etape | ordre, texte |
| INGREDIENT | id_ingredient | nom |
| PLANNING | id_planning | date_debut_semaine |
| REPAS_PLANIFIE | id_repas | jour, moment |

### Associations et cardinalités
| Association | Entité A | Entité B | Propriétés portées |
|---|---|---|---|
| POSSEDER_RECETTE | UTILISATEUR (0,n) | RECETTE (1,1) | aucune |
| POSSEDER_PLANNING | UTILISATEUR (0,n) | PLANNING (1,1) | aucune |
| CONTENIR | PLANNING (0,n) | REPAS_PLANIFIE (1,1) | aucune |
| CONCERNER | REPAS_PLANIFIE (1,1) | RECETTE (0,n) | aucune |
| DETAILLER | RECETTE (0,n) | ETAPE (1,1) | aucune |
| COMPOSER | RECETTE (1,n) | INGREDIENT (0,n) | quantite, unite |

## 3. MLD relationnel

(PK = clé primaire, # = clé étrangère)

- UTILISATEUR (PK id_utilisateur, email, mot_de_passe_hash, role)
- RECETTE (PK id_recette, titre, portions, #id_utilisateur)
- ETAPE (PK id_etape, ordre, texte, #id_recette)
- INGREDIENT (PK id_ingredient, nom)
- COMPOSER (PK #id_recette, PK #id_ingredient, quantite, unite)
- PLANNING (PK id_planning, date_debut_semaine, #id_utilisateur)
- REPAS_PLANIFIE (PK id_repas, jour, moment, #id_planning, #id_recette)

Contraintes :
- UTILISATEUR.email est unique.
- PLANNING : (id_utilisateur, date_debut_semaine) est unique.
- jour est compris entre 0 et 6 ; moment vaut midi ou soir ; unite vaut g, kg, ml, cl, l ou piece.

## 4. MPD et dictionnaire de données

| Table | Champ | Type | Description | Contraintes | Équivalent MongoDB |
|---|---|---|---|---|---|
| UTILISATEUR | id_utilisateur | INT | Identifiant | PK, auto-incrémenté | _id ObjectId |
| UTILISATEUR | email | VARCHAR(255) | Adresse email | NOT NULL, UNIQUE | String, unique |
| UTILISATEUR | mot_de_passe_hash | VARCHAR(255) | Mot de passe haché (bcrypt) | NOT NULL | String |
| UTILISATEUR | role | ENUM | Rôle | user ou admin, défaut user | String, enum |
| RECETTE | id_recette | INT | Identifiant | PK | _id ObjectId |
| RECETTE | titre | VARCHAR(100) | Titre | NOT NULL | String |
| RECETTE | portions | INT | Nombre de portions | >= 1, défaut 2 | Number |
| RECETTE | id_utilisateur | INT | Propriétaire | FK vers UTILISATEUR, NOT NULL | owner ObjectId |
| ETAPE | id_etape | INT | Identifiant | PK | tableau steps |
| ETAPE | ordre | INT | Position de l'étape | NOT NULL | position dans le tableau |
| ETAPE | texte | TEXT | Description | NOT NULL | String |
| ETAPE | id_recette | INT | Recette concernée | FK vers RECETTE | intégré |
| INGREDIENT | id_ingredient | INT | Identifiant | PK | pas de collection |
| INGREDIENT | nom | VARCHAR(100) | Nom en minuscules | NOT NULL, UNIQUE | ingredients[].name String |
| COMPOSER | id_recette | INT | Recette | PK composée, FK | intégré |
| COMPOSER | id_ingredient | INT | Ingrédient | PK composée, FK | intégré |
| COMPOSER | quantite | DECIMAL(10,2) | Quantité | > 0 | ingredients[].quantity Number |
| COMPOSER | unite | ENUM | Unité | g, kg, ml, cl, l, piece | ingredients[].unit String, enum |
| PLANNING | id_planning | INT | Identifiant | PK | _id ObjectId |
| PLANNING | date_debut_semaine | DATE | Premier jour de la semaine | NOT NULL | weekStart Date |
| PLANNING | id_utilisateur | INT | Propriétaire | FK ; UNIQUE avec date_debut_semaine | owner ObjectId |
| REPAS_PLANIFIE | id_repas | INT | Identifiant | PK | entries[]._id |
| REPAS_PLANIFIE | jour | TINYINT | 0 = lundi, 6 = dimanche | 0 à 6 | entries[].day Number |
| REPAS_PLANIFIE | moment | ENUM | Moment | midi ou soir | entries[].meal String, enum |
| REPAS_PLANIFIE | id_planning | INT | Planning concerné | FK vers PLANNING | intégré |
| REPAS_PLANIFIE | id_recette | INT | Recette prévue | FK vers RECETTE | entries[].recipe ObjectId |

## 5. Passage du MLD vers MongoDB

| Relationnel | MongoDB | Raison |
|---|---|---|
| UTILISATEUR | collection users | tel quel |
| RECETTE + ETAPE + COMPOSER + INGREDIENT | collection recipes, avec ingredients[] et steps[] intégrés | toujours lus avec la recette, nombre limité, créés et supprimés avec elle |
| PLANNING + REPAS_PLANIFIE | collection plans, avec entries[] intégrés | un repas n'existe que dans un planning, lus ensemble |
| Clé étrangère id_utilisateur | champ owner (ObjectId) | référence, pour filtrer par utilisateur et appliquer les droits |
| id_recette dans REPAS_PLANIFIE | entries[].recipe (ObjectId) | référence : la recette est réutilisée sur plusieurs semaines |
| INGREDIENT | pas de collection | pas de catalogue partagé, le nom est stocké dans chaque ligne d'ingrédient, ce qui évite une jointure |

Autres choix à justifier :
- La liste de courses n'est pas stockée : elle se déduit du planning, la stocker créerait un risque d'incohérence.
- Le planning référence les recettes au lieu de les copier : modifier une recette met à jour tous les plannings qui l'utilisent.

## 6. Index

| Collection | Index | Raison |
|---|---|---|
| users | email unique | pas de doublon de compte, connexion rapide |
| recipes | owner | retrouver vite les recettes d'un utilisateur |
| plans | (owner, weekStart) unique | un seul planning par semaine et par utilisateur |

## 7. Cas d'utilisation (un diagramme par acteur)

- Visiteur : s'inscrire ; se connecter.
- Utilisateur : créer une recette ; consulter ses recettes ; supprimer sa recette ; créer le planning d'une semaine ; ajouter un repas ; retirer un repas ; générer la liste de courses.
- Administrateur : supprimer la recette de n'importe quel utilisateur ; il hérite de l'utilisateur.

Relations :
- Tous les cas de l'utilisateur et de l'administrateur incluent « S'authentifier ».
- « Générer la liste de courses » inclut « Convertir et additionner les unités ».

## 8. Diagramme de classes

- Utilisateur (id, email, motDePasseHash, role) : sInscrire(), seConnecter().
- Recette (id, titre, portions, etapes) : ajouterIngredient().
- LigneIngredient (nom, quantite, unite).
- Planning (id, dateDebutSemaine) : ajouterRepas(), retirerRepas(), genererListeCourses().
- RepasPlanifie (id, jour, moment).
- ConvertisseurUnites (service) : agreger(lignes).
- Énumérations : Role, Unite, Moment.

Relations :
- Utilisateur 1 vers 0..* Recette.
- Utilisateur 1 vers 0..* Planning.
- Recette ◆ 1..* LigneIngredient (composition).
- Planning ◆ 0..* RepasPlanifie (composition).
- RepasPlanifie 0..* vers 1 Recette.
- Planning dépend de ConvertisseurUnites.

## 9. Diagrammes de séquence

Connexion (Utilisateur, Interface React, API Express, Zod, MongoDB) :
1. L'utilisateur saisit son email et son mot de passe.
2. React envoie POST /api/auth/login.
3. L'API valide les données avec Zod.
4. L'API cherche l'utilisateur dans MongoDB (findOne).
5. MongoDB renvoie l'utilisateur et son hachage.
6. L'API compare le mot de passe (bcrypt) et signe un JWT.
7. L'API répond 200 avec le token.
8. React affiche la page des recettes.
- Alternative : données invalides, 400 ; email inconnu ou mot de passe faux, 401.

Liste de courses (Utilisateur, Interface React, API Express, Middleware auth, MongoDB, Service unités) :
1. L'utilisateur clique sur « Générer la liste de courses ».
2. React envoie GET /api/plans/:id/shopping-list avec le token.
3. Le middleware vérifie le token et renvoie l'identifiant de l'utilisateur.
4. L'API cherche le planning de cet utilisateur dans MongoDB et charge les recettes liées.
5. L'API envoie les ingrédients au service d'unités (aggregateIngredients).
6. Le service renvoie la liste agrégée.
7. L'API répond 200 avec la liste, et React l'affiche.
- Alternative : token absent ou invalide, 401 ; planning introuvable ou appartenant à un autre utilisateur, 404.

## 10. Droits d'accès

| Action | Propriétaire | Autre utilisateur | Administrateur |
|---|---|---|---|
| Voir ou modifier une recette | oui | non (404) | non |
| Supprimer une recette | oui | non (404) | oui |
| Voir son planning et sa liste de courses | oui | non (404) | non |

Une ressource d'un autre utilisateur renvoie 404 plutôt que 403, pour ne pas révéler son existence.

## 11. Limites connues

- Pas d'équivalence entre masse et volume : un ingrédient en grammes et en litres reste sur deux lignes.
- Pas de catalogue d'ingrédients partagé : des variantes d'orthographe sont possibles.
- Pas de mise à l'échelle des quantités selon le nombre de portions.

## 12. À confirmer avec l'enseignant

- Le MPD attendu est-il relationnel (types SQL) ou MongoDB ?
- Quels diagrammes UML sont exigés exactement ?

## 13. Livrables à produire

- [ ] MCD (draw.io)
- [ ] MLD (draw.io)
- [ ] MPD (draw.io)
- [ ] Dictionnaire de données (dans les notes, puis dans MODELISATION.md)
- [ ] Cas d'utilisation : visiteur, utilisateur, administrateur
- [ ] Diagramme de classes
- [ ] Séquence : connexion
- [ ] Séquence : liste de courses
- [ ] docs/MODELISATION.md assemblé