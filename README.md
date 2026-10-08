# Pinyin Trainer

Pinyin Trainer est une Progressive Web App (PWA) "Vanilla" conçue pour s'entraîner à reconnaître et à écrire les sons du Pinyin (le système de transcription phonétique du mandarin). 

L'application intègre une base de données audio complète des syllabes Pinyin et permet un apprentissage adaptatif hors-ligne.

## Crédits et Sources Audio

Les fichiers audio (`.mp3`) utilisés dans ce projet proviennent du dépôt open-source suivant :
*   **Dépôt d'origine** : [davinfifield/mp3-chinese-pinyin-sound](https://github.com/davinfifield/mp3-chinese-pinyin-sound)
*   **Licence** : Le dépôt d'origine est distribué sous licence open-source (généralement MIT), ce qui permet leur réutilisation et distribution. Ces sons ont été sourcés initialement dans un but éducatif.

## Fonctionnalités

- **Base de données audio complète** : Plus de 1600 sons recouvrant toutes les combinaisons de syllabes et de tons (1 à 4, plus le ton neutre).
- **Deux modes de difficulté** :
  - **QCM (Choix Multiple)** : Entraînement de l'oreille. Les mauvaises réponses proposées sont basées sur des sonorités proches (ex: `b` et `p`, `zh` et `z`, différents tons) pour aiguiser la discrimination auditive.
  - **Saisie directe** : Pour vérifier la mémoration exacte. L'utilisateur doit écrire lui-même la syllabe et le chiffre du ton (ex: `xue2`, `ba1`).
- **Apprentissage adaptatif (Spaced Repetition)** : Les sons qui sont le moins bien maîtrisés réapparaissent plus fréquemment (80% de chance d'interroger un son avec un score faible). Le système maintient aussi de temps en temps des acquis de façon aléatoire.
- **Suivi des performances** : Le score est enregistré localement sur l'appareil.

## Architecture Technique (PWA Vanilla)

Le projet repose sur une architecture "Offline-First" sans framework (pas de React ou de Vue, pas de phase de build).

- **`index.html` & `style.css`** : Squelette et design system "Utility-First" (inspiré de Tailwind) pour un rendu extrêmement léger, fluide et mobile-first (incluant la gestion des safe-areas pour iOS).
- **`app.js`** : Contient toute la logique métier, la gestion d'état locale (via `localStorage`) et la génération dynamique des distracteurs (QCM) sans dépendances lourdes. L'interface se met à jour en manipulant directement le DOM pour une performance optimale.
- **`sounds_list.js`** : Un registre recensant tous les sons disponibles.
- **`sw.js` (Service Worker)** : Gère le cache. Les fichiers vitaux sont pré-mis en cache à l'installation. Les fichiers audio, très nombreux, sont mis en cache paresseusement ("Lazy Caching") au fur et à mesure qu'ils sont écoutés.
- **`manifest.json`** : Permet l'installation de l'application sur l'écran d'accueil du téléphone avec un affichage natif (`standalone`).

## Installation et Lancement

1. Hébergez ce dossier sur un serveur web (ex: Cloudflare Pages, GitHub Pages).
2. Ouvrez l'URL dans un navigateur web moderne.
3. Cliquez sur "Ajouter à l'écran d'accueil" depuis votre téléphone pour l'installer comme une vraie application.
4. L'application marchera ensuite même sans connexion internet (Offline-First).
