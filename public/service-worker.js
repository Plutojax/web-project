// Cache names
const CACHE_NAME = 'bird-sighting-cache-v1';
const DATA_CACHE_NAME = 'bird-sighting-data-cache-v1';

// Files to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/images/1684000031701.jpg',
    '/images/1684000111436.jpg',
    // Add more files to cache as needed
];

// Offline data storage
let pendingRequests = [];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate service worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(cacheName => {
                        return cacheName.startsWith('bird-sighting-cache-') && cacheName !== CACHE_NAME;
                    }).map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
            })
    );
});

// Store pending requests
const storePendingRequest = request => {
    pendingRequests.push(request.clone());
};

// Process pending requests
const processPendingRequests = async () => {
    for (const request of pendingRequests) {
        const response = await fetch(request);
        if (response.status === 200) {
            // Handle successful response, e.g., upload the data to the server
        }
    }
    pendingRequests = [];
};

// Fetch resources
self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(() => {
                            storePendingRequest(event.request);
                            return cache.match(event.request);
                        });
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/');
                    }
                    return fetch(event.request);
                })
        );
    }
});

// Background sync for pending requests
self.addEventListener('sync', event => {
    if (event.tag === 'sync-pending-requests') {
        event.waitUntil(processPendingRequests());
    }
});
