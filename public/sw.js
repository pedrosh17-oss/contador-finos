self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
  });
  
  // 🔔 RECEBER E MOSTRAR NOTIFICAÇÃO PUSH
  self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '🍻 Contador de Finos';
    const options = {
      body: data.body || 'Novo fino registado!',
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      data: { url: '/' }
    };
  
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // CLICAR NA NOTIFICAÇÃO ABRE A APP
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  });