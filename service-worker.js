const CACHE_NAME = 'comparateur-energie-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/js/jquery-3.6.0.min.js',
  '/assets/js/chart.min.js',
  '/assets/js/tailwind.min.js',
  '/assets/css/fontawesome.min.css',
  '/assets/img/favicon.ico',
  '/assets/img/favicon-32x32.png',
  '/assets/img/favicon-16x16.png',
  '/assets/img/apple-touch-icon.png',
  '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.error(`Échec de mise en cache pour ${url}:`, error);
              return Promise.resolve();
            });
          })
        );
      })
      .catch(error => {
        console.error('Erreur lors de la mise en cache:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-HTTP(S)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Erreur lors de la mise en cache de la réponse:', error);
              });

            return response;
          })
          .catch(() => {
            // Retourner une réponse par défaut en cas d'erreur
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('Pas de connexion internet');
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 