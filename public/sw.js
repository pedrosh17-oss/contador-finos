self.addEventListener('push', function (event) {
    if (!event.data) return;
  
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Novo fino registado!',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: { dateOfArrival: Date.now() }
      };
  
      event.waitUntil(
        self.registration.showNotification(data.title || '🍻 Contador de Finos', options)
      );
    } catch (e) {
      console.error('Erro no evento push do Service Worker:', e);
    }
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/')
    );
  });