//Create the IDB for the Restaurant App!
const dbPromise = idb.open('rr', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
    case 1:
      upgradeDB.createObjectStore('reviews');
  }
});

//Retrieve the restaurant data from the development server
DBHelper.fetchRestaurants((error, restaurants) => {
  if (error) { // Got an error
    console.error(error);
  } else {
    //Loop thru each restaurant and store it in the IDB
    dbPromise.then(db => {
      const tx = db.transaction(['restaurants']);
      const store = tx.objectStore('restaurants');
      return store.getAll();
    }).then(items => {
      if (JSON.stringify(items) == JSON.stringify(restaurants)) {return;}
      else {
        restaurants.forEach(restaurant => {
          dbPromise.then(db => {
            const tx = db.transaction(['restaurants'], 'readwrite').objectStore('restaurants').put(restaurant, restaurant.id);
            return tx.complete;
          }).then(() => {
            console.log('Added Restaurants to the Restaurant IDBStore');
          });
        });
      }
    });
  }
});

//Retrieve the restaurant data from the development server
DBHelper.fetchReviews((error, reviews) => {
  if (error) { // Got an error
    console.error(error);
  } else {
    //Retrieve all the items in the reviews IDB
    dbPromise.then(db => {
      const tx = db.transaction(['reviews']);
      const store = tx.objectStore('reviews');
      return store.getAll();
    }).then(items => {
      if (JSON.stringify(items) == JSON.stringify(reviews)) {return;}
      else {
        reviews.forEach(review => {
          dbPromise.then(db => {
            const tx = db.transaction(['reviews'], 'readwrite').objectStore('reviews').put(review, review.id);
            return tx.complete;
          }).then(() => {
            console.log('Added Reviews to the Reviews IDBStore');
          });
        });
      }
    });
  }
});
