// Listen for push events
console.log("Hi");
self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  // Get the data from the push event
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Notification";
  const options = {
    body: data.message || "You have a new message.",
    icon: "../ERPSystem(FrontEnd)/img/Male.png", // Replace with your notification icon
    badge: "../ERPSystem(FrontEnd)/img/Female.png", // Replace with your badge icon
  };

  // Show the notification
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification click events
// self.addEventListener("notificationclick", function (event) {
//   console.log("Notification clicked:", event);

//   event.notification.close();

// Navigate to a specific URL when the notification is clicked
//   event.waitUntil(
//     clients.openWindow("/chat") // Replace with your chat interface URL
//   );
// });
