//Check to see if serviceWorker param is available in the navigator
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {scope:'./'}).then(reg => {
    //Log out message that it worked!
    console.log('SW Registered: ' + reg.scope);
  })
  //if .then() doesn't return a response, .catch() will respond with the error
  .catch(error => {
    console.log('SW Failed to Register: ' + error);
  });
}
