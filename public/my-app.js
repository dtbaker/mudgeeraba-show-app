
var currentHeight = 600;
function orientation_changed(){
    currentHeight = $$(window).height();
    currentHeight = currentHeight - 56 - 72;
    if(currentHeight > 300) {
        $$('#map').css('height', currentHeight + 'px');
    }
}
function isPhonegap(){
    return (typeof cordova != 'undefined' || typeof PhoneGap != 'undefined' || typeof phonegap != 'undefined');
}
function phonegap_is_loaded(){
    $$(window).on('orientationchange', orientation_changed);
    orientation_changed();
}

if(isPhonegap) {
// Handle Cordova Device Ready Event
    $$(document).on('deviceready', function () {
        phonegap_is_loaded();
    });
}


var currentEventData;
function eventScheduleLoaded(data){
    var $es = $$('#event-schedule');
    $es.html('');
    currentEventData = data;
    for(var i in data){
        if(data.hasOwnProperty(i)){
            if(typeof data[i].datelabel !== 'undefined'){
                $es.append('<div class="timeline-date-label">' + data[i].datelabel + '</div>');
            }else if(typeof data[i].eventid !== 'undefined'){
                $es.append('<div class="timeline-item"> <div class="timeline-item-date">' + data[i].label[0] + ' <small>' + data[i].label[1] + '</small></div> <div class="timeline-item-divider"></div> <div class="timeline-item-content"> <div class="timeline-item-inner"><a href="" class="item-link event-schedule" data-eventid="' + data[i].eventid + '">' + data[i].title + '</a></div> </div> </div>');
            }
        }
    }
    myApp.hidePreloader();
}
// todo: load from ajax
var eventData = [
    {
        "datelabel": "Saturday 4th"
    },
    {
        "eventid": 123,
        "starttime": "9am",
        "endtime": "9am",
        "label": ["9","am"],
        "title": "Something",
        "location": "Something",
        "description": "Long description here"
    },
    {
        "eventid": 123,
        "starttime": "9am",
        "endtime": "9am",
        "label": ["9","am"],
        "title": "Something",
        "location": "Something",
        "description": "Long description here"
    },
    {
        "datelabel": "Sunday 5th"
    },
    {
        "eventid": 123,
        "starttime": "9am",
        "endtime": "9am",
        "label": ["9","am"],
        "title": "Something",
        "location": "Something",
        "description": "Long description here"
    },
    {
        "eventid": 123,
        "starttime": "9am",
        "endtime": "9am",
        "label": ["9","am"],
        "title": "Something",
        "location": "Something",
        "description": "Long description here"
    }
];
eventScheduleLoaded(eventData);

$$(document).on('click', '#map-tab-clicker', loadMapPage);
$$(document).on('click', '.event-schedule', createEventPage);

function loadMapPage(){
    // myApp.showPreloader('Loading map...');
    initMap();
    orientation_changed();
}

/* ===== Generate Content Dynamically ===== */
function createEventPage() {
    var eventid = parseInt( $$(this).data('eventid') );
    // find this event id in the list
    var thisevent;
    for(var i in currentEventData) {
        if (currentEventData.hasOwnProperty(i)) {
            if (typeof currentEventData[i].eventid !== 'undefined' && parseInt(currentEventData[i].eventid) === eventid) {
                thisevent = currentEventData[i];
                break;
            }
        }
    }
    if(thisevent) {
        mainView.router.loadContent(
            '  <!-- Page, data-page contains page name-->' +
            '  <div data-page="dynamic-content" class="page">' +
            '    <!-- Top Navbar-->' +
            '    <div class="navbar">' +
            '      <div class="navbar-inner">' +
            '        <div class="left"><a href="#" class="back link icon-only"><i class="icon icon-back"></i></a></div>' +
            '        <div class="center">Event: ' + (thisevent.title) + '</div>' +
            '      </div>' +
            '    </div>' +
            '    <!-- Scrollable page content-->' +
            '    <div class="page-content">' +
        '           <div class="content-block-title">Description:</div>' +
            '      <div class="content-block">' +
            '        <p>' + thisevent.description + ' </p>' +
            '      </div>' +
        '           <div class="content-block-title">Location:</div>' +
            '      <div class="content-block">' +
            '        <p>' + thisevent.location + ' </p>' +
            '      </div>' +
        '           <div class="content-block-title">Time:</div>' +
            '      <div class="content-block">' +
            '        <p>Starts: ' + thisevent.starttime + ', Ends: ' + thisevent.endtime + ' </p>' +
            '      </div>' +
            '      <div class="content-block">' +
            '        <p>Go <a href="#" class="back">back</a> to the schedule.</p>' +
            '      </div>' +
            '    </div>' +
            '  </div>'
        );
    }
    return false;
}



var overlay;
var USGSOverlay;

var map, GeoMarker, mapinitdone;
function initMap() {

    if(mapinitdone)return;
    mapinitdone = true;
    // myApp.hidePreloader();

    USGSOverlay = function(bounds, image, map) {

        // Initialize all properties.
        this.bounds_ = bounds;
        this.image_ = image;
        this.map_ = map;

        // Define a property to hold the image's div. We'll
        // actually create this div upon receipt of the onAdd()
        // method so we'll leave it null for now.
        this.div_ = null;

        // Explicitly call setMap on this overlay.
        this.setMap(map);
    };
    USGSOverlay.prototype = new google.maps.OverlayView();

    /**
     * onAdd is called when the map's panes are ready and the overlay has been
     * added to the map.
     */
    USGSOverlay.prototype.onAdd = function() {

        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';

        // Create the img element and attach it to the div.
        var img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.position = 'absolute';
        img.style.opacity = '.5';
        div.appendChild(img);

        this.div_ = div;

        // Add the element to the "overlayLayer" pane.
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    };

    USGSOverlay.prototype.draw = function() {

        // We use the south-west and north-east
        // coordinates of the overlay to peg it to the correct position and size.
        // To do this, we need to retrieve the projection from the overlay.
        var overlayProjection = this.getProjection();

        // Retrieve the south-west and north-east coordinates of this overlay
        // in LatLngs and convert them to pixel coordinates.
        // We'll use these coordinates to resize the div.
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

        // Resize the image's div to fit the indicated dimensions.
        var div = this.div_;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (sw.y - ne.y) + 'px';
    };

    // The onRemove() method will be called automatically from the API if
    // we ever set the overlay's map property to 'null'.
    USGSOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: {lat:-28.0604468, lng: 153.3533519},
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: [{
            elementType: 'labels',
            stylers: [{visibility: 'off'}]
        }]
    });


    if(navigator.geolocation) {

        GeoMarker = new GeolocationMarker();
        GeoMarker.setCircleOptions({fillColor: '#808080',fillOpacity:0.1,strokeOpacity:0});


        google.maps.event.addListenerOnce(GeoMarker, 'position_changed', function () {
            // map.setCenter(this.getPosition());
            // map.fitBounds(this.getBounds());
        });

        google.maps.event.addListener(GeoMarker, 'geolocation_error', function (e) {
            alert('There was an error obtaining your position. Message: ' + e.message);
        });

        GeoMarker.setMap(map);
    }

    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-28.063209, 153.351054), // bottom left
        new google.maps.LatLng(-28.058832, 153.357900)); // top right

    var srcImage = 'img/map-overlay.png';

    overlay = new USGSOverlay(bounds, srcImage, map);
}
