# CLAUDE.md — Amicale SP (Application pompiers)

## Vue d'ensemble

Application SPA single-file (`index.html`, ~20 750 lignes) pour la gestion d'une amicale de sapeurs-pompiers. Pas de build system, pas de framework — HTML/CSS/JS pur. Conçue pour une démo, avec des données en mémoire (pas de backend).

## Architecture

### Fichier unique : `index.html`

Tout est dans un seul fichier structuré ainsi :
- **Lignes 1–1700** : CSS (variables, composants, responsive, mode PC)
- **Lignes 1700–6900** : HTML (écrans, modals, formulaires)
- **Lignes 6900–20750** : JavaScript (une seule balise `<script>`, données + logique + patches versionnés)

### Navigation SPA

- Fonction `goPage(id)` affiche un `<div class="screen" id="pg-xxx">` et cache les autres
- `BACK_MAP` (ligne ~11850) définit la hiérarchie parent de chaque page
- Monkey-patching : `goPage` est wrappée ~15 fois par des patches versionnés (v43→v65)
- Hooks dans goPage pour rafraîchir les données dynamiques (carousel, events, locations)

### Système de modals (`.mow`)

- Classe CSS `.mow` avec `.mow.open { display:flex }` / `.mow:not(.open) { display:none }`
- Z-index hiérarchie : `.mow` default=6000, élevés=8500, inscription/bénévole=9000, tour=9100, toast=9800
- `AMICALE_openPopup(el)` ferme tous les popups avant d'en ouvrir un nouveau
- `AMICALE_closeAllPopups()` ferme tout (modals + overlays)

### Mode PC

- `body.pc-mode` active le layout desktop
- `.pc-topbar` (z-index:5000) — barre de navigation sticky en haut
- `.toggle-pc-btn` bascule entre mobile et PC

## Données principales (toutes en mémoire JS)

| Variable | Ligne | Description |
|----------|-------|-------------|
| `EVENTS_DATA` | ~7410 | Événements (repas, bal, tournoi) |
| `BENEVOLES_DATA` | ~7426 | Bénévoles par événement (max, liste) |
| `VOYAGES_DATA` | ~8838 | Voyages (saintmalo, strasbourg, colo_ete) |
| `MEMBRES_DATA` | ~8249 | 9 membres avec profil complet |
| `BIENS_AMICAL` | ~8736 | Biens locatifs (appart, barnum, remor, camping) |
| `RESA` | ~8720 | Réservations par bien |
| `DEMANDES_LOCATION` | ~8798 | Demandes de location |
| `INSCRIPTIONS_VOYAGES` | ~8858 | Inscriptions voyages |
| `INSCRIPTIONS_EVENEMENTS` | ~8869 | Inscriptions événements |

### Convention `window.X = X`

Les `const` au top-level ne créent PAS de propriétés `window`. Si du code dans un IIFE accède à `window.X`, il faut ajouter `window.X = X` après la déclaration.

## Fonctions clés

### Carousel dynamique (page accueil amicaliste)
- `renderCarouselDynamique()` — génère les slides depuis EVENTS_DATA + VOYAGES_DATA
- `goSlide(idx)` / `initCarousel()` — navigation, auto-avance 5s, touch/swipe
- `CAROUSEL_TOTAL` (var, pas const) — mis à jour dynamiquement

### Événements
- `renderEvenementsCards()` — cartes dynamiques depuis EVENTS_DATA
- `ouvrirFicheEvenement(evKey)` — ouvre modal détail (z:8500)
- `inscrireEvenement(evKey)` → `ouvrirModalInscriptionEvent()`
- Sections bénévoles/inscrits pliantes avec chevron

### Voyages
- `ouvrirFicheVoyage(voyKey)` — ouvre modal détail (z:8500)
- `inscrireVoyage(voyKey)` → `ouvrirModalInscriptionEvent()`

### Location
- `renderBiensBureau()` / `renderBiensAmical()` — grilles de biens
- `ouvrirFicheBien(key)` / `ouvrirFicheBienBureau(key)` — fiches détail
- `renderFicheGalerie(containerId, photos)` — carousel photos avec flèches
- `renderGalerieBureau()` — galerie bureau avec upload + bouton couverture
- `setCouvertureBien(idx)` — définit la photo de couverture
- `ajouterPhotoBien(input)` / `supprimerPhotoBien(idx)` — gestion photos
- `bien.couverture` — index de la photo de couverture (null = première)

### Bénévoles
- `ouvrirBenevoleAmical(evId, evNom)` — modal inscription bénévole
- `confirmerBenevoleAmical()` — confirme l'inscription
- `hasBenevoleSlots(evId)` — vérifie places disponibles

### Commissions (système dynamique)
- Commissions fixes : locations, événements, voyages, sport, noël, FDF, Sainte-Barbe, solidarité, foyer
- Commissions dynamiques créées via `modal-ajout-secteur`
- Pages dynamiques : `pg-commission-dynamique-bureau` / `pg-commission-dynamique-amical`

## CSS — Variables principales

```
--accent: #FF6B35 (orange)
--blu, --grn, --rd, --pur, --amb, --tea — couleurs thème
--color-text-primary, --color-background-primary — adaptées light/dark
--font-sans: 'Inter', sans-serif
```

## Patterns à respecter

1. **Pas de `const` pour les variables modifiées dynamiquement** — utiliser `var` (ex: `CAROUSEL_TOTAL`)
2. **Toujours `window.X = X`** si du code IIFE accède à `window.X`
3. **z-index hiérarchie** : default modals 6000 < fiches 8500 < inscription 9000 < tour 9100 < toast 9800
4. **onclick inline** pour les éléments générés dynamiquement (pas d'addEventListener)
5. **`event.stopPropagation()`** sur les boutons enfants dans les cartes cliquables
6. **`showToast('message')`** pour les notifications utilisateur
7. **Escape HTML** dans les strings dynamiques : `str.replace(/'/g,"\\'")`

## Commandes

```bash
# Pas de build system — ouvrir index.html dans un navigateur
# Tests avec Playwright (Chromium pré-installé)
npx playwright test
# ou directement
node -e "const {chromium}=require('playwright'); ..."
```

## Déploiement futur

Architecture recommandée : **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- Multi-tenant : une amicale = une organisation
- Auth par email/invitation
- Storage pour les photos/documents
- Row Level Security pour l'isolation des données

## Git

- Branche de dev : `claude/application-overview-a67xvo`
- PRs squash-mergées dans `main`
- Repo : `nicolas53200/amicale`
