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
     fetch(DBHelper.DATABASE_URL)
     .then(response => {response.json()
       .then(restaurants => {
         callback(null, restaurants);
       });
     })
     .catch(error => {callback(`Error retrieving restaurant details: ${error}`, null);});
   }

   /**
    * Save review
    */
    static fetchReviews(callback) {
      fetch(DBHelper.DATABASE_REVIEWS_URL)
      .then(response => {response.json()
        .then(reviews => {
          callback(null, reviews);
        });
      })
      .catch(error => {callback(`Error retrieving reviews details: ${error}`, null);});
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
  API POST & IDB backup
  */

  static prepareReview(id, name, rating, comments, callback) {
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
    DBHelper.saveReview(method, headers, body, (error, response) => {
      if (error) {
        console.log(error);
      } else {
          callback(null, response);
      }
    });
  }

  /**
   * Save review
   */
   static saveReview(method, headers, body, callback) {
     fetch(DBHelper.DATABASE_REVIEWS_URL, {method:method, headers:headers, body:JSON.stringify(body)})
     .then(response => {
       callback(null, `Successfully added: ${response}`);
     })
     .catch(error => {
       callback(`Error adding new review: ${error}`, null);
     });
   }
}
