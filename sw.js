const CACHE_NAME = "xiaoqianbao-v4";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES);
    })
  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }

        })

      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});


self.addEventListener("fetch", event => {

  /*
     index.html 不使用旧缓存
     每次优先拿最新版本
  */

  if (
    event.request.mode === "navigate" ||
    event.request.url.includes("index.html")
  ) {

    event.respondWith(

      fetch(event.request, {
        cache: "no-store"
      }).then(response => {

        return response;

      }).catch(() => {

        return caches.match("./index.html");

      })

    );

    return;

  }


  /*
     其他文件正常使用网络，
     网络失败才使用缓存
  */

  event.respondWith(

    fetch(event.request)

      .then(response => {

        if (
          response &&
          response.status === 200 &&
          response.type !== "opaque"
        ) {

          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {

            cache.put(
              event.request,
              copy
            );

          });

        }

        return response;

      })

      .catch(() => {

        return caches.match(event.request);

      })

  );

});
