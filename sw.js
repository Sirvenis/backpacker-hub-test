const CACHE_NAME = 'backpacker-hub-v10';
const APP_SHELL = [
  './index.html?v=10',
  './styles.css?v=10',
  './app.js?v=10',
  './manifest.webmanifest?v=10',
  './icon.svg',
  './games/index.html?v=3',
  './games/games.css?v=3',
  './games/games.js?v=1',
  './games/ladder-dash.html',
  './games/word-sprout.html',
  './games/pocket-snake.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => key === CACHE_NAME ? null : caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => caches.match('./index.html?v=10'))));
});
