self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Este archivo vacío es suficiente para que Android reconozca que es una App Instalable (PWA)
});