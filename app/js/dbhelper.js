//Create the IDB for the Restaurant App!
const dbPromise = idb.open('rr', 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
    case 1:
      upgradeDB.createObjectStore('reviews');
    case 2:
      upgradeDB.createObjectStore('pending');
  }
});

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_REVIEWS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
  * Fetch all restaurants.
  */
  static fetchRestaurants(callback) {
   //Change this to the regular fetch & uncomment the IDBHelper's at the end
   if (self.indexedDB) {
     fetch(DBHelper.DATABASE_URL)
     .then(response => {response.json()
       .then(objects => {
         const store = 'restaurants';
         callback(null, objects);
         DBHelper.loadIDB(objects, store);
       });
     })
     .catch(error => {
       dbPromise.then(db => {
         return db.transaction(['restaurants']).objectStore('restaurants').getAll();
       })
       .then(items => {
         idb.open('rr').then(db => {
           return db.transaction(['restaurants'], 'readonly').objectStore('restaurants').getAll();
         })
         .then(restaurants => {
           callback(null, restaurants);
         });
       })
       .catch(error => {
         callback(error, null);
       });
     });
   } else {
     fetch(DBHelper.DATABASE_URL)
     .then(response => {response.json()
       .then(restaurants => {
         callback(null, restaurants);
       });
     })
     .catch(error => {
       callback(`Error retrieving restaurant details: ${error}`, null);
     });
   }
  }

  /**
  * Fetch all reviews.
  */
  static fetchReviews(callback) {
    if (self.indexedDB) {
      fetch(DBHelper.DATABASE_REVIEWS_URL)
      .then(response => {response.json()
        .then(objects => {
          const store = 'reviews';
          callback(null, objects);
          DBHelper.loadIDB(objects, store);
        });
      })
      .catch(error => {
        dbPromise.then(db => {
          return db.transaction(['reviews']).objectStore('reviews').getAll();
        })
        .then(items => {
          idb.open('rr').then(db => {
            return db.transaction(['reviews'], 'readonly').objectStore('reviews').getAll();
          })
          .then(reviews => {
            callback(null, reviews);
          });
        })
        .catch(error => {
          callback(error, null);
        });
      });
    } else {
      fetch(DBHelper.DATABASE_REVIEWS_URL)
      .then(response => {response.json()
        .then(restaurants => {
          callback(null, restaurants);
        });
      })
      .catch(error => {
        callback(`Error retrieving restaurant details: ${error}`, null);
      });
    }
  }

  /**
  * Fetch a restaurant by its ID.
  */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
  * Fetch a review by its ID.
  */
  static fetchReviewsById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchReviews((error, allreviews) => {
      if (error) {
        callback(error, null);
      } else {
        const reviews = allreviews.filter(r => r.restaurant_id == id);
        if (reviews) { // Got the Reviews
          callback(null, reviews);
        } else { // Reviews do not exist in the database
          callback('Reviews do not exist', null);
        }
      }
    });
  }

  /**
  * Fetch restaurants by a cuisine type with proper error handling.
  */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(null, error);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
  * Fetch restaurants by a neighborhood with proper error handling.
  */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
  * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
  */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
  * Fetch all neighborhoods with proper error handling.
  */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
  * Fetch all cuisines with proper error handling.
  */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
  * Restaurant page URL.
  */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
  * Restaurant image URL.
  */
  static imageUrlForRestaurant(restaurant, path) {
    return (`/img/${path}/${restaurant.id}.jpg`);
  }

  /**
  * Map marker for a restaurant.
  */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
    {title: restaurant.name,
    alt: restaurant.name,
    url: DBHelper.urlForRestaurant(restaurant)
    })
    marker.addTo(newMap);
    return marker;
  }

  static hoverHeart (object) {
    if (object.classList.contains('favorited') == false){
      object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(150,150,150);stroke-width:3;stroke:rgb(0,0,0)');
      object.onmouseout = () => {
        object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(150,150,150);fill-opacity:0.5;stroke-width:3;stroke:rgb(0,0,0)');
      };
    }
    else if (object.classList.contains('favorited') == true){
      object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(255,0,50);stroke-width:3;stroke:rgb(0,0,0)');
      object.onmouseout = () => {
        object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(255,0,50);stroke-width:3;stroke:rgb(0,0,0)');
      };
    }
  }

  static toggleHeart(object) {
    if (object.classList.contains('favorited') == false){
      object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(255,0,50);stroke-width:3;stroke:rgb(0,0,0)');
      object.classList.add('favorited');
      DBHelper.hoverHeart(object);
    }
    else if (object.classList.contains('favorited') == true){
      object.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(150,150,150);stroke-width:3;stroke:rgb(0,0,0)');
      object.classList.remove('favorited');
      DBHelper.hoverHeart(object);
    }
  }

  /**
  Pending, POST, PUT, & IDB backup
  */

  static clearPending() {
    dbPromise.then(db => {
      return db.transaction(['pending']).objectStore('pending').getAll();
    })
    .then(items => {
      items.forEach(item => {
        const dated = item[0];
        const type = item[1];
        const method = item[2];
        const headers = item[3];
        const body = item[4];
        if (item[1] == 'review') {
          fetch(DBHelper.DATABASE_REVIEWS_URL, {method:method, headers:headers, body:JSON.stringify(body)}).then(response => {
            dbPromise.then(db => {
              const tx = db.transaction(['pending'], 'readwrite').objectStore('pending').delete(dated);
              return tx.complete;
            }).then(() => {
              console.log('Removed Review from the Pending IDBStore');
            });
          })
          .catch(error => {
            callback(`Error clearing review from the Pending IDBStore: ${error}`, null);
          });
        }
        else if (item[1] == 'favorite') {
          fetch(body, {method:method, headers:headers}).then(response => {
            dbPromise.then(db => {
              const tx = db.transaction(['pending'], 'readwrite').objectStore('pending').delete(dated);
              return tx.complete;
            }).then(() => {
              console.log('Removed Favorite from the Pending IDBStore');
            });
          })
        }
      });
    });
    setTimeout(() => {
      initMap(); // added
     }, 50);
  }

  static addToPending(pending, dated) {
    dbPromise.then(db => {
      const tx = db.transaction(['pending'], 'readwrite').objectStore('pending').put(pending, dated);
      return tx.complete;
    }).then(() => {
      console.log('Added Review to the Pending IDBStore');
    });
  }

  static prepareReview(id, name, rating, comments, callback) {
    const review = 'review';
    const method = 'post';
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    };
    const body = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comments
    };
    const dated = Date.now();
    const pending = [dated, review, method, headers, body];
    DBHelper.addToPending(pending, dated, (error, response) => {
      if (error) {
        console.log(error);
      } else {
          callback(null, response);
      }
    });
    DBHelper.saveReview(method, headers, body, dated, (error, response) => {
      if (error) {
        console.log(error);
      } else {
          callback(null, response);
          location.reload();
      }
    });
  }

  static prepareFavorite(object, id) {
    if (object.classList.contains('favorited') == false){
      var status = true;
      console.log(`if false: ${status}`)
    }
    else if (object.classList.contains('favorited') == true){
      var status = false;
      console.log(`if true: ${status}`)
    }
    dbPromise.then(db => {
      const tx = db.transaction(['restaurants']);
      const store = tx.objectStore('restaurants');
      return store.get(id);
    }).then((response) => {
      response.is_favorite = status;
      console.log(`Updated Log: ${response.is_favorite}`);
      console.log(response);
      const review = 'favorite';
      const method = 'put';
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      };
      const url = DBHelper.DATABASE_URL + '/' + id + '/?is_favorite=' + status;
      const dated = Date.now();
      const favorite = response;
      const pending = [dated, review, method, headers, url];
      dbPromise.then(db => {
        const tx = db.transaction(['restaurants'], 'readwrite').objectStore('restaurants').put(favorite, id);
        return tx.complete;
      }).then((result) => {
        console.log(result);
        console.log('Updated Favorite Status in the Restaurants IDBStore');
      });
      DBHelper.addToPending(pending, dated);
      DBHelper.saveFavorite(method, headers, url, dated, favorite, id);
    });
  }

  static saveReview(method, headers, body, dated, callback) {
   fetch(DBHelper.DATABASE_REVIEWS_URL, {method:method, headers:headers, body:JSON.stringify(body)})
   .then(response => {
     callback(null, `Successfully added: ${response}`);
     dbPromise.then(db => {
       const tx = db.transaction(['pending'], 'readwrite').objectStore('pending').delete(dated);
       return tx.complete;
     }).then(() => {
       console.log('Removed Review from the Pending IDBStore');
     });
   })
   .catch(error => {
     callback(`Error saving new review: ${error}`, null);
   });
  }

  static saveFavorite(method, headers, url, dated, favorite, id) {
   fetch(url, {method:method, headers:headers})
   .then(response => {
     console.log(`Successfully added: ${response}`);
     dbPromise.then(db => {
       const tx = db.transaction(['pending'], 'readwrite').objectStore('pending').delete(dated);
       return tx.complete;
     }).then(() => {
       console.log('Removed Favorite from the Pending IDBStore');
     });
   })
   .catch(error => {
     console.log(`Error saving new favorite restaurant: ${error}`);
   });
  }

  static loadIDB(objects, store) {
    const saved = store;
    dbPromise.then(db => {
     const tx = db.transaction(saved);
     const store = tx.objectStore(saved);
     return store.getAll();
    })
    .then(items => {
     if (JSON.stringify(items) == JSON.stringify(objects)) {return;}
     else {
       objects.forEach(restaurant => {
         dbPromise.then(db => {
           const tx = db.transaction(saved, 'readwrite').objectStore(saved).put(restaurant, restaurant.id);
           return tx.complete;
         })
         .then(() => {
           console.log(`Added Restaurants to the ${saved} IDBStore`);
         });
       });
     }
    });
  }

}
