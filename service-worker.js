// Service Worker for Misconduct Logger App - Enhanced for Offline Use

const CACHE_NAME = 'misconduct-logger-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './convert-to-apk.html',
  './generate-icons.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2'
];

// Create a separate cache for user data
const DATA_CACHE_NAME = 'misconduct-logger-data-v1';

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Caching app shell and assets');
          return cache.addAll(ASSETS_TO_CACHE);
        }),
      // Create data cache
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          console.log('Setting up data cache');
          return cache;
        })
    ])
    .then(() => {
      console.log('Service worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep the current app cache and data cache
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and controlling clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - enhanced for offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests separately (if you have any)
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // For normal page/asset requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Make network request and cache the response
        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch((error) => {
            console.log('Fetch failed; returning offline fallback', error);
            
            // Fallback for different types of requests
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('./icon-192.png');
            }
            
            // For HTML pages, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Default fallback
            return new Response('تعذر الاتصال بالإنترنت. التطبيق يعمل حالياً في وضع عدم الاتصال.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  // Try to fetch from network first
  try {
    const response = await fetch(request);
    // Cache successful responses
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('API fetch failed, falling back to cache', error);
    const cachedResponse = await cache.match(request);
    
    // Return cached response or a custom offline response
    return cachedResponse || new Response(JSON.stringify({
      success: false,
      message: 'أنت حالياً في وضع عدم الاتصال. سيتم حفظ البيانات محلياً وسيتم مزامنتها عند توفر الاتصال.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}