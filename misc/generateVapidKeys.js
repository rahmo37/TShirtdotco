// This module generates vapid keys
const webPush = require("web-push");

//Generate VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

console.log("Public VAPID key:", vapidKeys.publicKey);
console.log("Private VAPID key:", vapidKeys.privateKey);
