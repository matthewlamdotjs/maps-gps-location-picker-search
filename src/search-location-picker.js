// Map Variables
var gmap_vars_lp;
var gmap_vars_mapSearchInput;
var gmap_vars_currentMarker;
var gmap_vars_searchBox;
var gmap_vars_locationLatitude;
var gmap_vars_locationLongitude;
var gmap_vars_mapDivId;
var gmap_vars_searchDivId;

function renderMap(mapId, searchId){
    gmap_vars_mapDivId = mapId;
    gmap_vars_searchDivId = searchId
    getLocationInit(initSearchMap);
}

// Modified from https://www.w3schools.com/html/tryit.asp?filename=tryhtml5gmap_vars_geolocation
function getLocationInit(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            gmap_vars_locationLatitude = position.coords.latitude
            gmap_vars_locationLongitude = position.coords.longitude;
            callback();
        });
    } else { 
        // default to UH Manoa
        gmap_vars_locationLatitude = 21.296939;
        gmap_vars_locationLongitude = -157.8193005;
        callback();
    }
}

function setPosition(position) {
    gmap_vars_locationLatitude = position.coords.latitude
    gmap_vars_locationLongitude = position.coords.longitude;
}

function resetLocation(){
    gmap_vars_locationLatitude = null;
    gmap_vars_locationLongitude = null;
}

function getLat(){
    return gmap_vars_locationLatitude;
}

function getLng(){
    return gmap_vars_locationLongitude;
}

function initSearchMap() {
    gmap_vars_lp = new google.maps.Map(document.getElementById(gmap_vars_mapDivId), {
      center: {lat: parseFloat(gmap_vars_locationLatitude), lng: parseFloat(gmap_vars_locationLongitude)},
      zoom: 13,
      mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    gmap_vars_mapSearchInput = document.getElementById(gmap_vars_searchDivId);
    gmap_vars_searchBox = new google.maps.places.SearchBox(gmap_vars_mapSearchInput);

    // Bias the gmap_vars_searchBox results towards current map's viewport.
    gmap_vars_lp.addListener('boundsgmap_vars_changed', function() {
      gmap_vars_searchBox.setBounds(gmap_vars_lp.getBounds());
    });

    let markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    gmap_vars_searchBox.addListener('placesgmap_vars_changed', function() {
      let places = gmap_vars_searchBox.getPlaces();

      if (places && places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];
      
      // Clear out custom pin
      if(gmap_vars_currentMarker){
        gmap_vars_currentMarker.setMap(null);
      }

      // if there's only one place then set latlng
      if(places.length == 1){
        // Set position variables
        setPosition({
            coords: {
                latitude: places[0].geometry.location.lat(),
                longitude: places[0].geometry.location.lng()
            }
        });
      }

      // For each place, get the icon, name and location.
      let bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        let icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
          map: gmap_vars_lp,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        markers.forEach((pin) => {
            pin.addListener('click', function() {
                // Remove old pin
                if(gmap_vars_currentMarker){
                    gmap_vars_currentMarker.setMap(null);
                }
                gmap_vars_lp.setZoom(20);
                gmap_vars_lp.setCenter(pin.getPosition());
                setPosition({
                    coords: {
                        latitude: pin.getPosition().lat(),
                        longitude: pin.getPosition().lng()
                    }
                });
            });
        })

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      gmap_vars_lp.fitBounds(bounds);
    });

    google.maps.event.addListener(gmap_vars_lp, "click", googleMapClickHandler);
  }

// Drop custom pin w/o search query
function googleMapClickHandler(event) {
    // Remove old pin
    if(gmap_vars_currentMarker){
        gmap_vars_currentMarker.setMap(null);
    }
    // Set new pin
    gmap_vars_currentMarker = new google.maps.Marker({
        position: event.latLng, 
        map: gmap_vars_lp
    });
    // Set position variables
    setPosition({
        coords: {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
        }
    });
}