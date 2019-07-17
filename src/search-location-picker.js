var SearchLocationPicker = {
    // Map Variables
    gmap_vars_lp: null,
    gmap_vars_mapSearchInput: null,
    gmap_vars_currentMarker: null,
    gmap_vars_searchBox: null,
    gmap_vars_locationLatitude: null,
    gmap_vars_locationLongitude: null,
    gmap_vars_mapDivId: null,
    gmap_vars_searchDivId: null,
    gmap_vars_customOnclickCallback: null
}

// main method
SearchLocationPicker.renderMap = (mapId, searchId) => {
    SearchLocationPicker.gmap_vars_mapDivId = mapId;
    SearchLocationPicker.gmap_vars_searchDivId = searchId;
    SearchLocationPicker.getLocationInit(SearchLocationPicker.initSearchMap);
}

// Modified from getLocation() found @ https://www.w3schools.com/html/tryit.asp?filename=tryhtml5gmap_vars_geolocation
SearchLocationPicker.getLocationInit = (callback) => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            SearchLocationPicker.gmap_vars_locationLatitude = position.coords.latitude;
            SearchLocationPicker.gmap_vars_locationLongitude = position.coords.longitude;
            callback();
        });
    } else { 
        // default to UH Manoa
        SearchLocationPicker.setPosition({
            coords: {
                latitude: 21.296939,
                longitude: -157.8193005
            }
        });
        callback();
    }
}

SearchLocationPicker.setPosition = (position) => {
    SearchLocationPicker.gmap_vars_locationLatitude = position.coords.latitude;
    SearchLocationPicker.gmap_vars_locationLongitude = position.coords.longitude;
    // custom callback
    SearchLocationPicker.customCallback();
}

SearchLocationPicker.resetLocation = () => {
    SearchLocationPicker.gmap_vars_locationLatitude = null;
    SearchLocationPicker.gmap_vars_locationLongitude = null;
}

SearchLocationPicker.getLat = () => {
    return SearchLocationPicker.gmap_vars_locationLatitude;
}

SearchLocationPicker.getLng = () => {
    return SearchLocationPicker.gmap_vars_locationLongitude;
}

SearchLocationPicker.initSearchMap = () => {
    SearchLocationPicker.gmap_vars_lp = new google.maps.Map(document.getElementById(SearchLocationPicker.gmap_vars_mapDivId), {
        center: {lat: parseFloat(SearchLocationPicker.getLat()), lng: parseFloat(SearchLocationPicker.getLng())},
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    SearchLocationPicker.gmap_vars_mapSearchInput = document.getElementById(SearchLocationPicker.gmap_vars_searchDivId);
    SearchLocationPicker.gmap_vars_searchBox = new google.maps.places.SearchBox(SearchLocationPicker.gmap_vars_mapSearchInput);

    // Bias the gmap_vars_searchBox results towards current map's viewport.
    SearchLocationPicker.gmap_vars_lp.addListener('bounds_changed', () => {
        SearchLocationPicker.gmap_vars_searchBox.setBounds(SearchLocationPicker.gmap_vars_lp.getBounds());
    });

    let markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    SearchLocationPicker.gmap_vars_searchBox.addListener('places_changed', () => {
        let places = SearchLocationPicker.gmap_vars_searchBox.getPlaces();
        
        if (places && places.length == 0) {
        return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
        marker.setMap(null);
        });
        markers = [];
        
        // Clear out custom pin
        if(SearchLocationPicker.gmap_vars_currentMarker){
            SearchLocationPicker.gmap_vars_currentMarker.setMap(null);
        }

        // if there's only one place then set latlng
        if(places.length == 1){
        // Set position variables
        SearchLocationPicker.setPosition({
            coords: {
                latitude: places[0].geometry.location.lat(),
                longitude: places[0].geometry.location.lng()
            }
        });
        }

        // For each place, get the icon, name and location.
        let bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
        if(!place.geometry){
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
            map: SearchLocationPicker.gmap_vars_lp,
            icon: icon,
            title: place.name,
            position: place.geometry.location
        }));

        markers.forEach((pin) => {
            pin.addListener('click', () => {
                // Remove old pin
                if(SearchLocationPicker.gmap_vars_currentMarker){
                    SearchLocationPicker.gmap_vars_currentMarker.setMap(null);
                }
                SearchLocationPicker.gmap_vars_lp.setZoom(20);
                SearchLocationPicker.gmap_vars_lp.setCenter(pin.getPosition());
                SearchLocationPicker.setPosition({
                    coords: {
                        latitude: pin.getPosition().lat(),
                        longitude: pin.getPosition().lng()
                    }
                });
            });
        });

        if(place.geometry.viewport){
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
        });
        SearchLocationPicker.gmap_vars_lp.fitBounds(bounds);
    });

    google.maps.event.addListener(SearchLocationPicker.gmap_vars_lp, "click", SearchLocationPicker.googleMapClickHandler);
}

// Drop custom pin w/o search query
SearchLocationPicker.googleMapClickHandler = (event) => {
    // Remove old pin
    if(SearchLocationPicker.gmap_vars_currentMarker){
    SearchLocationPicker.gmap_vars_currentMarker.setMap(null);
    }
    // Set new pin
    SearchLocationPicker.gmap_vars_currentMarker = new google.maps.Marker({
        position: event.latLng, 
        map: SearchLocationPicker.gmap_vars_lp
    });
    // Set position variables
    SearchLocationPicker.setPosition({
        coords: {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
        }
    });
}

// Set extra callback after map click
SearchLocationPicker.setCustomOnclickCallback = (callback) => {
    // Check type first
    if(typeof callback == 'function'){
        SearchLocationPicker.gmap_vars_customOnclickCallback = callback;
    } else {
        console.error('setCustomOnclickCallback argument 1 expected type function');
    }
}

// custom callback
SearchLocationPicker.customCallback = () => {
    if(SearchLocationPicker.gmap_vars_customOnclickCallback){
        SearchLocationPicker.gmap_vars_customOnclickCallback();
    }
}
