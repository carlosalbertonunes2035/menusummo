const CACHE_NAME = 'summo-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo192.svg',
    // Optimized: We don't cache all JS here because names change with hash, 
    // but the SW will cache them dynamically on first fetch.
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network-first for most, Cache-first for assets
self.addEventListener('fetch', (event) => {
    // Ignore external API calls (Firebase, Google, etc.) to avoid cache issues
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Return original response if not ok or not a GET
                if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
                    return response;
                }

                // Clone and cache successful GET requests
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(async () => {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;

                // Fallback for document requests
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }

                return new Response('Network error occurred', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});
