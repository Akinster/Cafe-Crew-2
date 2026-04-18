const CACHE = “nsg-v1”;
const ASSETS = [”/”, “/index.html”];

self.addEventListener(“install”, e => {
e.waitUntil(
caches.open(CACHE).then(c => c.addAll(ASSETS))
);
self.skipWaiting();
});

self.addEventListener(“activate”, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(“fetch”, e => {
// Only cache GET requests, skip Firebase/API calls
if (e.request.method !== “GET”) return;
if (e.request.url.includes(“firestore”) || e.request.url.includes(“firebase”)) return;

e.respondWith(
fetch(e.request)
.then(res => {
const clone = res.clone();
caches.open(CACHE).then(c => c.put(e.request, clone));
return res;
})
.catch(() => caches.match(e.request))
);
});
// Firebase Push Notifications
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCt7hUsJDUt2lkkgX911wcdvjKXW9iXH0I",
  authDomain: "cafe-crew-30a55.firebaseapp.com",
  projectId: "cafe-crew-30a55",
  storageBucket: "cafe-crew-30a55.firebasestorage.app",
  messagingSenderId: "987104919432",
  appId: "1:987104919432:web:da3b249fc4feaeac7c443d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
  });
});