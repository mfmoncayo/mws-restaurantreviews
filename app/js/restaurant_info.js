let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  DBHelper.clearPending();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibWZtb25jYXlvIiwiYSI6ImNqa3I0Yzg1bzAxYmozanBqYTZ5bmFmdGoifQ.4gJ9Omh-Pf44x3l14nzXvg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
    DBHelper.fetchReviewsById(id, (error, reviews) => {
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const btn = document.getElementById('restaurant-button');
  btn.setAttribute('style', 'padding:0px;border:0px;background-color:transparent;')
  btn.setAttribute('title', 'Add ' + restaurant.name + ' as a favorite restaurant');
  const svg = document.getElementById('restaurant-favorite');
  svg.setAttribute('style', 'width:35px;height:33px;display:inline-block');

  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute('d', 'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z');
  if (restaurant.is_favorite == true || restaurant.is_favorite == 'true') {
    path.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(255,0,50);stroke-width:3;stroke:rgb(0,0,0)');
    path.setAttribute('class', 'favorited');
  }
  else {
    path.setAttribute('style', 'transform:scale(.05);-webkit-transform:scale(.05);fill:rgb(150,150,150);fill-opacity:0.5;stroke-width:3;stroke:rgb(0,0,0)');
  }
  path.onmouseover = function(){
    DBHelper.hoverHeart(this);
  };
  path.onclick = function(){
    DBHelper.toggleHeart(this);
  };
  svg.append(path);
  btn.append(svg);


  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  const imgJSURL = DBHelper.imageUrlForRestaurant(restaurant, "banners");
  const imgSplit = imgJSURL.split(".");
  const img1x = imgSplit[0] + "_1x." + imgSplit[1];
  const img2x = imgSplit[0] + "_2x." + imgSplit[1];
  image.src = img1x;
  image.srcset = `${img1x} 1x, ${img2x} 2x`;
  image.alt = "Preview of " + restaurant.name + " restaurant or entree";

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.className = 'restaurant-description';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  const btnContainer = document.createElement('div');
  btnContainer.className = 'btn-container';
  const btn = document.createElement('button');
  btn.innerHTML = "Add Review";
  btn.className = "add-review"
  btn.onclick = () => {
    btn.setAttribute('style', 'cursor:not-allowed; opacity:.7;');
    btn.disabled = true;
    addReviewHTML();
  }
  btnContainer.appendChild(btn);
  container.appendChild(btnContainer);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const updated = review.updatedAt;
  date.innerHTML = new Date(updated).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

addReviewHTML = () => {
  const ul = document.getElementById('reviews-list');
  const li = document.createElement('li');

  const nameLabel = document.createElement('label');
  const name = document.createElement('input');
  const ratingLabel = document.createElement('label');
  const rating = document.createElement('input');
  const commentsLabel = document.createElement('label');
  const comments = document.createElement('textarea');

  li.id = 'newReview';

  nameLabel.htmlFor = 'review-name';
  nameLabel.innerHTML = 'Name';
  name.name = 'review-name';
  name.id = 'review-name';
  name.className = 'review-input';
  li.appendChild(nameLabel);
  li.appendChild(name);

  ratingLabel.htmlFor = 'review-rating';
  ratingLabel.innerHTML = 'Rating: 3';
  rating.type = 'range';
  rating.value = 3;
  rating.min = 1;
  rating.max = 5;
  rating.name = 'review-rating';
  rating.id = 'review-rating';
  rating.className = 'review-input';
  rating.onchange = () => {
    ratingLabel.innerHTML = 'Rating: ' + rating.value;
  }
  li.appendChild(ratingLabel);
  li.appendChild(rating);

  commentsLabel.htmlFor = 'review-comments';
  commentsLabel.innerHTML = 'Comments';
  comments.name = 'review-comments';
  comments.id = 'review-comments';
  comments.className = 'review-input';
  li.appendChild(commentsLabel);
  li.appendChild(comments);

  const submit = document.createElement('button');
  submit.innerHTML = "Submit";
  submit.className = 'submit-review';
  submit.onclick = function(){
    const id = self.restaurant.id;
    const reviewName = document.querySelector('[name=review-name]').value;
    const reviewRating = document.querySelector('[name=review-rating]').value;
    const reviewComments = document.querySelector('[name=review-comments]').value;
    DBHelper.prepareReview(id, reviewName, reviewRating, reviewComments, (error, response) => {
      if (error) {
        console.log(`${error}`);
      }
      else {
        console.log(`${response}`);
      }
    });
  };
  li.appendChild(submit);

  ul.appendChild(li);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement("a");
  a.href = window.location;
  a.innerHTML = restaurant.name;
  a.setAttribute("aria-current", "page");
  li.appendChild(a);
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
const svg = document.getElementById('restaurant-favorite');
svg.setAttribute('class', 'fas fa-heart fa-2x');
svg.setAttribute('style', 'color:grey;opacity:.5');

svg.onmouseover = function(){
  DBHelper.hoverHeart(this);
};
svg.onclick = function(){
  DBHelper.toggleHeart(this);
};**/
