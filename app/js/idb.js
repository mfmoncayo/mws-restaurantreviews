//Create the IDB for the Restaurant App!
const dbPromise = idb.open('u2', 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
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
