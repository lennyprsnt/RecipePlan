# Notes de modélisation (brouillon)

## Règles de gestion
Utilisateurs et sécurité
- RG1 : un utilisateur est identifié par son email, unique.
- RG2 : le mot de passe a au moins 8 caractères et est stocké haché.
- RG3 : un utilisateur a un rôle : utilisateur ou administrateur.
- RG4 : un utilisateur ne voit et ne modifie que ses propres recettes et plannings.
- RG5 : un administrateur peut supprimer la recette de n'importe qui.
Recettes
- RG6 : un utilisateur possède 0 ou plusieurs recettes ; une recette appartient à un seul utilisateur.
- RG7 : une recette comprend au moins un ingrédient.
- RG8 : chaque ingrédient a une quantité positive et une unité parmi g, kg, ml, cl, l, piece.
- RG9 : une recette a un titre et au moins 1 portion.
Planning
- RG10 : un utilisateur possède 0 ou plusieurs plannings ; un planning appartient à un seul utilisateur.
- RG11 : au plus un planning par utilisateur et par semaine.
- RG12 : un planning contient de 0 à 14 repas (7 jours x midi ou soir).
- RG13 : un repas planifié concerne une seule recette ; une recette peut être planifiée plusieurs fois.
- RG14 : supprimer une recette la retire des plannings.
Liste de courses
- RG15 : elle est calculée à partir des recettes planifiées.
- RG16 : les quantités d'un même ingrédient sont additionnées après conversion en unité de base.
- RG17 : une masse et un volume ne sont jamais additionnés.

## Entités du MCD
- UTILISATEUR (email, mot_de_passe_hash, role)
- RECETTE (titre, portions)
- ETAPE (ordre, texte)
- INGREDIENT (nom)
- PLANNING (date_debut_semaine)
- REPAS_PLANIFIE (jour, moment)
- Association COMPOSER entre RECETTE et INGREDIENT, qui porte quantite et unite.

## Collections MongoDB
- users, recipes (ingrédients et étapes intégrés), plans (repas intégrés).

## Choix à justifier
- Ingrédients dans la recette : lus avec elle, n'existent pas seuls, nombre limité.
- Repas dans le planning : 14 au maximum, lus avec le planning.
- Recettes référencées dans le planning : réutilisées sur plusieurs semaines.
- Liste de courses non stockée : elle se déduit du planning.
- owner sur recipes et plans : filtrer par utilisateur et appliquer les droits.
- Pas de collection ingredients : pas de catalogue partagé, évite une jointure.

## Index
- users.email unique ; recipes.owner ; plans (owner, weekStart) unique.

## Cas d'utilisation
- Visiteur : s'inscrire, se connecter.
- Utilisateur : créer, consulter, supprimer ses recettes ; créer un planning ;
  ajouter ou retirer un repas ; générer la liste de courses.
- Administrateur : supprimer la recette de n'importe quel utilisateur.

## À faire plus tard
- Séquence « liste de courses » (jour 3), séquence « connexion » (jour 5), schémas (jour 7).