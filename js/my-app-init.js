// Initialize your app
var myApp = new Framework7({
    // Enable Material theme
    modalTitle: 'Mudgeeraba Show',
    material: true
});

// Export selectors engine
var $$ = Dom7;




// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

myApp.showPreloader('Loading...');

