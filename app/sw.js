importScripts('js/idb.js');
//Cache Storage for the Restaurant App!!
const cacheVersion = 'restaurantApp1.0';
//Items we'd like to storage
const cacheVariables = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/sw.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  '/css/styles.css',
  '/js/',
  '/js/idb.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/register.js'
];

//Response to Install Event
self.addEventListener('install', event => {
  //Wait until it's finished installing
  event.waitUntil(
    //Check all Caches and either open an existing or create a new Cache Storage
    caches.open(cacheVersion).then(cache => {
      //Add items into Cache Storage
      return cache.addAll(cacheVariables);
    }).catch(err => {
      console.log('Couldn\'t open cache: ', err);
    })
  );
});

//Response to the Install Event being Activated
self.addEventListener('activate', event => {
  //Wait until the activation is complete
  event.waitUntil(
    //Return all Cache Storages
    caches.keys().then(cacheNames => {
      //Response to keys() is the Promise.all()
      return Promise.all(
        //Take initial response cacheNames array & map thru ea item
        cacheNames.map(cacheName => {
          //Map function takes the filtered item and here we're deleting it from the Cache
          if (cacheName.startsWith("restaurantApp") && cacheName !== cacheVersion){
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  //Capture the original request
  let originalRequest = event.request;
  //Check if Restaurant request
  if (originalRequest.url.startsWith("http://localhost:1337/restaurants")) {
    if (originalRequest.method == 'GET') {
      event.respondWith(
        fetch(originalRequest.url)
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        })
      );
    }
    if (originalRequest.method == 'PUT') {
      event.respondWith(
        fetch(originalRequest.url, {method:originalRequest.method, headers:originalRequest.headers})
        .then(response => {
          return new Response(JSON.stringify(response));
        })
        .catch(error => {
          return error;
        })
      );
    }
  }
  //Check if Restaurant request
  else if (originalRequest.url.startsWith("http://localhost:1337/reviews")) {
    if (originalRequest.method == 'GET') {
      event.respondWith(
        fetch(originalRequest.url)
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        })
      );
    }
    if (originalRequest.method == 'POST') {
      event.respondWith(
        fetch(originalRequest.url, {method:originalRequest.method, headers:originalRequest.headers, body:originalRequest.body})
        .then(response => {
          return new Response(JSON.stringify(response));
        })
        .catch(error => {
          return error;
        })
      );
    }
  }
  //Otherwise respond to fetch request
  else {
    event.respondWith(
      caches.open(cacheVersion).then(cache => {
        //Check all Caches to see if there's a match for what the browser is trying to fetch
        return cache.match(originalRequest, {ignoreSearch: true}).then(response => {
          //If there's a match to the promise, then return the response!
          if (response) {
            return response;
          }
          //Otherwise reach out to the server w/ the event.request params & return response
          return fetch(originalRequest).then(response => {
            //Nothing on the Server
            if (response.status === 404) {
              return new Response('Whoops, not found');
            }
            //Found what we're looking for!
            cache.put(event.request, response.clone());
            return response;
          }).catch(response => {
              //Didn't even connect to the Server after checking the cache
              return new Response('Uh oh, that totally failed?');
          });
        });
      })
    );
  }
});
