// ===== Service Worker — Cache offline =====

var CACHE_NAME = 'vesanerie-v1';

var PRECACHE_URLS = [
  '/',
  '/art/',
  '/tech/',
  '/music/',
  '/mentions-legales.html',
  '/404.html',
  '/css/variables.css',
  '/css/base.css',
  '/css/components/theme-toggle.css',
  '/css/components/landing.css',
  '/css/components/cards.css',
  '/css/components/about.css',
  '/css/components/scroll.css',
  '/css/components/pile.css',
  '/css/components/gallery.css',
  '/css/components/folder.css',
  '/css/components/film.css',
  '/css/components/anim.css',
  '/css/components/tiktok.css',
  '/css/components/art-fiche.css',
  '/css/components/mentions.css',
  '/css/components/error-page.css',
  '/css/pdf-viewer.css',
  '/css/tech.css',
  '/css/music.css',
  '/js/main.js',
  '/js/art.js',
  '/js/art/state.js',
  '/js/art/fiche.js',
  '/js/art/lightbox.js',
  '/js/art/cinema.js',
  '/js/art/tiktok.js',
  '/js/art/pdf-viewer.js',
  '/js/art/tilt.js',
  '/js/tech.js',
  '/js/music.js'
];

// Install: precache shell
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
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
