import { fetchHandler } from "./fetchHandler.js";
import { urlObject } from "./urls.js";

// Check if Service Workers and Push API are supported
export function initiateSubscription() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    navigator.serviceWorker
      .register("../service-worker.js")
      .then((registration) => {
        //Ask for permission
        return Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            return subscribeUserToPush(registration);
          } else {
            console.error("Notification permission denied.");
          }
        });
      })
      .catch(function (error) {
        console.error("Service Worker registration failed:", error);
      });
  } else {
    console.error("Service Worker Is Not Supported In This Browser");
  }
}

async function subscribeUserToPush(registration) {
  const publicVapidKey =
    "BK6KC2D0jTxiwOFWO9HjwTgBrIyqSdiyC7E44gGu3VEIG8ubVRsGQEr5QZwoFmtkYHAiQ03TZkmWLLqlUX-brg8";
  const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

  try {
    // Subscribe the user to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Ensures the user must see notifications
      applicationServerKey: convertedVapidKey,
    });

    // Send the subscription details to the backend
    await sendSubscriptionToServer(subscription);
  } catch (error) {
    console.error("Failed to subscribe the user:", error);
  }
}

// Function to send the subscription object to the backend
async function sendSubscriptionToServer(subscription) {
  try {
    const requestInfo = {
      url: urlObject.saveSubscription,
      data: subscription,
      method: fetchHandler.methods.post,
    };
    const data = await fetchHandler.sendRequest(requestInfo);
  } catch (error) {
    console.error(error.message);
  }
}

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
