self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.title || "Instafy";
  const options = {
    body: payload.body || "Ada notifikasi baru.",
    icon: "/favicon/web-app-manifest-192x192.png",
    badge: "/favicon/favicon-96x96.png",
    data: {
      url: payload.url || "/notifications",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/notifications", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url.includes(self.location.origin));
      if (matchingClient) {
        matchingClient.focus();
        matchingClient.navigate(url);
        return;
      }

      return self.clients.openWindow(url);
    })
  );
});
