// ===== Service Worker — Cache offline =====

var CACHE_NAME = 'vesanerie-v11';

// Shell minimal seulement. O2Switch (PowerBoost) renvoie des 429 quand on tire
// beaucoup de fichiers d'un coup : cette liste faisait 42 URLs et la rafale
// d'installation se faisait rate-limiter. Pire, cache.addAll echoue en bloc des
// qu'une seule requete rate, donc le cache restait vide.
// Le reste n'a pas besoin d'etre precache : le handler fetch plus bas est
// cache-first et range chaque asset au premier passage.
var PRECACHE_URLS = [
  '/',
  '/css/home.css',
  '/js/main.js',
  '/404.html'
];

// Install: precache shell
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // un fichier qui rate ne doit pas faire echouer tout le precache
      return Promise.all(PRECACHE_URLS.map(function(u) {
        return cache.add(u).catch(function() {});
      }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    // For R2 images: cache on first load, serve from cache after
    if (url.hostname.includes('r2.dev')) {
      e.respondWith(
        caches.open(CACHE_NAME).then(function(cache) {
          return cache.match(e.request).then(function(cached) {
            if (cached) return cached;
            return fetch(e.request).then(function(response) {
              if (response.ok) cache.put(e.request, response.clone());
              return response;
            });
          });
        })
      );
    }
    return;
  }

  // HTML: network-first (fresh content, fallback to cache)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, response.clone());
        });
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/404.html');
        });
      })
    );
    return;
  }

  // CSS/JS: cache-first (immutable assets, fast load)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response.ok) {
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});
