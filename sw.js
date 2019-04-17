var cacheStorageKey = "cache-7";
var cacheList = [
    "index.css"
];

var tag = "service worker";

var postMessage = function (message) {
    self.clients.matchAll()
        .then(function (clients) {
            if (clients && clients.length) {
                clients.forEach(function (client) {
                    client.postMessage(message);
                })
            }
        })
}

self.addEventListener("install", function (e) {
    postMessage("service worker install is fired");
    e.waitUntil(
        caches.open(cacheStorageKey)
            .then(function (cache) {
                cache.addAll(cacheList);
            })
            .then(function () {
                self.skipWaiting();
            })
    )
});

self.addEventListener('fetch', function (e) {
    postMessage("service worker fetch is fired")
    e.respondWith(
        caches.match(e.request).then(function (response) {
            if (response != null) {
                return response
            }
            return fetch(e.request.url)
        })
    )
});

self.addEventListener('activate', function (e) {
    postMessage("service worker activate is fired");
    e.waitUntil(
        Promise.all(
            [
                caches.keys().then(function (cacheNames) {
                    return cacheNames.map(name => {
                        if (name !== cacheStorageKey) {
                            postMessage("service worker delete cache " + name);
                            return caches.delete(name)
                        }
                    })
                })
            ]
        ).then(() => {
            return self.clients.claim();
        })
    )
})