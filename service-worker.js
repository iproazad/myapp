// Service Worker for Misconduct Logger App - Enhanced for Offline Use

const CACHE_NAME = 'misconduct-logger-v3';
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
        }),
      // Create images cache
      caches.open('misconduct-logger-images')
        .then((cache) => {
          console.log('Setting up images cache');
          return cache;
        })
    ])
    .then(() => {
      console.log('Service worker installed successfully');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  // Define caches to keep
  const cacheKeeplist = [
    CACHE_NAME, 
    DATA_CACHE_NAME,
    'misconduct-logger-images'
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep the current app cache, data cache, and images cache
          if (!cacheKeeplist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated and taking control of clients');
      // Take immediate control of all clients under service worker's scope
      return self.clients.claim();
    })
  );
});

// Fetch event - enhanced for offline support with cache-first strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests separately (if you have any)
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // For normal page/asset requests - use Cache First strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, try to fetch it
        return fetch(event.request.clone())
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
            if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Default fallback
            return new Response('تعذر الاتصال بالإنترنت. التطبيق يعمل حالياً في وضع عدم الاتصال.', {
              status: 200, // Return 200 instead of 503 to avoid error messages
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

// Pre-cache the main page for offline access
self.addEventListener('message', (event) => {
  // If the client sends a message to precache the main page
  if (event.data && event.data.type === 'PRECACHE_MAIN_PAGE') {
    console.log('Received request to precache main page');
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './app.js'
      ]);
    }).then(() => {
      console.log('Main page precached successfully');
      // Notify the client that precaching is complete
      if (event.source) {
        event.source.postMessage({
          type: 'PRECACHE_COMPLETE'
        });
      }
    }).catch(error => {
      console.error('Failed to precache main page:', error);
    });
  }
});