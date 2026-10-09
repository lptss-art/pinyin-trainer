const CACHE_NAME = 'pinyin-trainer-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './sounds_list.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Si pas en cache, on fetch et on le met en cache (Lazy Caching pour les sons)
            return fetch(e.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                
                return networkResponse;
            }).catch(() => {
                // Gestion du mode offline si le fichier n'a jamais été fetch
                return new Response('Network error or offline');
            });
        })
    );
});
