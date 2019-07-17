function SearchLocationPicker(mapId, searchId) {

    // Map Variables
    this.gmap_vars_lp = null;
    this.gmap_vars_mapSearchInput = null,
    this.gmap_vars_currentMarker = null;
    this.gmap_vars_searchBox = null;
    this.gmap_vars_locationLatitude = null;
    this.gmap_vars_locationLongitude = null;
    this.gmap_vars_mapDivId = mapId;
    this.gmap_vars_searchDivId = searchId;
    this.gmap_vars_customOnclickCallback = null;

    const _this = this;

    /* PUBLIC FUNCTIONS */

    // Main Function
    _this.renderMap = function(){
        getLocationInit(initSearchMap);
    };

    // Adds Callback For Selected Location Change
    _this.setCustomOnclickCallback = function(callback){
        // Check type first
        if(typeof callback == 'function'){
            _this.gmap_vars_customOnclickCallback = callback;
        } else {
            console.error('setCustomOnclickCallback argument 1 expected type function');
        }
    };

    // Returns Latitude of Selected Location
    _this.getLat = function(){
        return _this.gmap_vars_locationLatitude;
    };

    // Returns Longitude of Selected Location
    _this.getLng = function(){
        return _this.gmap_vars_locationLongitude;
    };

    // Resets Current Location
    _this.resetLocation = function(){
        _this.gmap_vars_locationLatitude = null;
        _this.gmap_vars_locationLongitude = null;
        getLocationInit(function(){});
    };

    /* PRIVATE FUNCTIONS */

    // Initialization Function
    // Modified from getLocation() found @ https://www.w3schools.com/html/tryit.asp?filename=tryhtml5gmap_vars_geolocation
    function getLocationInit(callback){
        let currentPosition = {}
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                setPosition(position);
                callback();
            });
        } else { 
            // default to UH Manoa
            setPosition({
                coords: {
                    latitude: 21.296939,
                    longitude: -157.8193005
                }
            });
            callback();
        }
    };

    // Sets Current Position
    function setPosition(position){
        _this.gmap_vars_locationLatitude = position.coords.latitude;
        _this.gmap_vars_locationLongitude = position.coords.longitude;
        // custom callback
        customCallback();
    };

    // Initializes Google Map API
    // Modified from initAutocomplete() found @ https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
    function initSearchMap(){
        _this.gmap_vars_lp = new google.maps.Map(document.getElementById(_this.gmap_vars_mapDivId), {
            center: {lat: parseFloat(_this.gmap_vars_locationLatitude), lng: parseFloat(_this.gmap_vars_locationLongitude)},
            zoom: 13,
            mapTypeId: 'roadmap'
        });

        // Create the search box and link it to the UI element.
        _this.gmap_vars_mapSearchInput = document.getElementById(_this.gmap_vars_searchDivId);
        _this.gmap_vars_searchBox = new google.maps.places.SearchBox(_this.gmap_vars_mapSearchInput);

        // Bias the gmap_vars_searchBox results towards current map's viewport.
        _this.gmap_vars_lp.addListener('bounds_changed', function(){
            _this.gmap_vars_searchBox.setBounds(_this.gmap_vars_lp.getBounds());
        });

        // set current location on map with pin
        _this.gmap_vars_currentMarker = new google.maps.Marker({
            position: new google.maps.LatLng(_this.getLat(), _this.getLng()), 
            map: _this.gmap_vars_lp
        });

        let markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        _this.gmap_vars_searchBox.addListener('places_changed', function(){
            let places = _this.gmap_vars_searchBox.getPlaces();
            
            if (places && places.length == 0) {
            return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker){
                marker.setMap(null);
            });
            markers = [];
            
            // Clear out custom pin
            if(_this.gmap_vars_currentMarker){
                _this.gmap_vars_currentMarker.setMap(null);
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
            places.forEach(function(place){
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
                map: _this.gmap_vars_lp,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            markers.forEach(function(pin){
                pin.addListener('click', function(){
                    // Remove old pin
                    if(_this.gmap_vars_currentMarker){
                        _this.gmap_vars_currentMarker.setMap(null);
                    }
                    _this.gmap_vars_lp.setZoom(20);
                    _this.gmap_vars_lp.setCenter(pin.getPosition());
                    setPosition({
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
            _this.gmap_vars_lp.fitBounds(bounds);
        });

        google.maps.event.addListener(_this.gmap_vars_lp, "click", googleMapClickHandler);
    };

    // Handler For Map Clicks
    function googleMapClickHandler(event){
        // Remove old pin
        if(_this.gmap_vars_currentMarker){
            _this.gmap_vars_currentMarker.setMap(null);
        }
        // Set new pin
        _this.gmap_vars_currentMarker = new google.maps.Marker({
            position: event.latLng, 
            map: _this.gmap_vars_lp
        });
        // Set position variables
        setPosition({
            coords: {
                latitude: event.latLng.lat(),
                longitude: event.latLng.lng()
            }
        });
    };

    // Calls User Provided Callback Function If Exists
    function customCallback(){
        if(_this.gmap_vars_customOnclickCallback){
            _this.gmap_vars_customOnclickCallback();
        }
    };
}