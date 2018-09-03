//Cache Storage for Restaurant App!!
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
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/register.js',
  '/data/restaurants.json'
];

//Response to Install Event
self.addEventListener('install', event => {
  //Wait until it's finished installing
  event.waitUntil(
    //Check all Caches and either an open existing or create new Cache Storage where name of storage equals var version
    caches.open(cacheVersion).then(cache => {
      //Add items into Cache Storage where name of storage equals var version
      return cache.addAll(cacheVariables);
    }).catch(err => {
      console.log('Couldn\'t open cache: ', err);
    })
  )
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
  //If no URL Identifier, then respond to the fetch request as normal
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
});
