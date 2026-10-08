# pinyin-trainer
je souhaite créer une appli d'entraienemtn vocal des pynin.
il faudra avoir l'ensemble des combinaisons des sons en base de donnée.

on pourra ecouter, puis reecouter un son, et puis il y aura different niveau de dificulté:
soit un questionaire a choix multiple
soit il faudra l'écrire soi meme.


pour celui a choix multiple, il faudra a la fois proposer les different ton, mais aussi d'autres "sons" qui ressemblent beaucoup. il faudra pour cela avoir un tableu de "proximité" pour une oreil européene afin qu'on affine l'orreil de l'utilisateur pour qu'il apprenne rapidmeent.


je veux une sorte d'appli, je veux donc qu'il enregistre en local le score de reussite pour chaque son, qu'il comprenne ce qu'on a du mal a identifier, et qu'il essai des sons qu'on a du mal en priorité (mais quand meme dem anière aléatoier des sons qu'on est sensé avoir confirmé, pour confirmer).



Architecture Technique : Modèle PWA "Vanilla" (Progressive Web App)

Le projet repose sur une architecture "Offline-First" (Priorité au hors-ligne) et "Vanilla" (Sans framework). Il ne nécessite ni React, ni Vue.js, ni étape de compilation (build process). Il est interprété directement par le navigateur.

L'architecture se divise en 3 piliers principaux :

1. Le Cœur PWA (L'installation et le Hors-ligne)

C'est ce qui transforme le site web en une véritable application mobile installable.

manifest.json (Le passeport de l'application) : Un fichier de configuration standardisé lu par le navigateur. Il définit le nom de l'application, les icônes à utiliser sur l'écran d'accueil, la couleur de la barre d'état du téléphone, et force l'affichage en plein écran ("display": "standalone"), masquant ainsi l'interface du navigateur.
sw.js (Le Service Worker) : C'est un script JavaScript qui tourne en tâche de fond, indépendamment de la page web. Il agit comme un proxy (un intermédiaire) entre l'application et le réseau.
Lors de l'installation : Il met en cache (télécharge sur le téléphone) tous les fichiers vitaux (index.html, style.css, app.js, les icônes).
Lors du lancement : Il intercepte les requêtes réseau. Si le téléphone capte mal ou n'a pas internet, le Service Worker sert instantanément les fichiers depuis le cache local. L'application démarre ainsi en 0 milliseconde.
Icônes maskables : Présence d'icônes spécifiques (ex: icon-maskable-512x512.png) permettant au système d'exploitation (surtout Android) de rogner l'icône à la forme standard du téléphone (rond, carré arrondi, goutte d'eau).
2. L'Interface Utilisateur (UI)
index.html (Structure & Balises Meta) : Contient le squelette de l'application. Il inclut des balises <meta> cruciales pour le mobile, notamment viewport-fit=cover (pour gérer l'encoche des iPhone) et interactive-widget=resizes-content (pour gérer l'apparition du clavier virtuel sans casser le design).
style.css (Design System Utility-First) : Le CSS n'utilise pas de framework externe lourd comme Bootstrap. Il utilise une approche "Utility-First" (similaire à Tailwind CSS), où chaque classe a un but unique (ex: .flex, .p-2, .text-blue-500). Cela permet de garder un fichier extrêmement léger. Il intègre aussi les variables CSS pour les "Safe Areas" (env(safe-area-inset-bottom)) d'iOS.
3. La Logique Métier & Gestion d'État
app.js (Vanilla JavaScript) : Gère toute l'interactivité sans dépendance majeure.
Performances (60 FPS) : Au lieu de détruire et recréer les éléments HTML à chaque frappe sur le clavier (ce qui ferait ramer l'application), le script met à jour uniquement le contenu textuel (innerHTML) des éléments ciblés.
Stockage Local (State Management) : Les préférences de l'utilisateur (devises sélectionnées) et les dernières données téléchargées sont sauvegardées en continu dans le localStorage du navigateur.
Gestion des API (Lie-Fi proof) : Les appels vers l'extérieur (ex: récupération des taux) utilisent l'objet AbortController. Si le réseau est trop lent (le fameux "Lie-Fi" où le téléphone affiche de la 4G mais rien ne charge), la requête est tuée après 3,5 secondes pour ne pas bloquer l'application, et le système bascule sur les données en cache.
API Natives (i18n) : Utilisation de l'API native Intl (Intl.NumberFormat, Intl.DisplayNames) pour traduire et formater les nombres selon la langue du téléphone, évitant d'importer une lourde bibliothèque de traduction.
4. Dépendances Externes

Le projet suit une règle stricte de minimalisme. La seule bibliothèque tierce autorisée est Sortable.js (sortable.min.js), un script très léger dédié exclusivement à la gestion fluide du glisser-déposer (Drag & Drop) tactile pour réorganiser la liste.

En résumé pour votre cahier des charges : "Le futur projet devra adopter une architecture Progressive Web App (PWA) 'Vanilla', garantissant une installation native via le navigateur, un fonctionnement 100% hors-ligne grâce à un Service Worker, et des performances optimales par l'absence de frameworks intermédiaires. Les données devront persister localement via l'API Web Storage."
