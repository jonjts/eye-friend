self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('eye-friend-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/notification.mp3'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 