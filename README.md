# Location Picker using Google Maps API

The following is a location picker that can be added to any web page. The picker utilizes the Google Maps and Places API and will require a valid API key with billing information set up (otherwise search queries will not work).

# Features

* Custom pin dropping
* Google Places search queries
* Latitude and Longitude of selected pin

# Getting started

* Obtain a Google Maps API key and set up billing (more info <a href="https://developers.google.com/maps/documentation/embed/get-api-key">HERE</a>)
* Include Maps API script and location picker script <br>
` <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=places"></script> ` <br>
` <script type="text/javascript" src="./search-location-picker.js"></script> ` <br>
* Alternatively use the CDN from this repo <br>
` <script type="text/javascript" src="https://matthewlamdotjs.github.io/maps-gps-location-picker-search/search-location-picker.min.js"></script> ` <br>
* You're ready to start using the location picker!

# Rendering the map

* To render the map, you must have a div element with id (where the map will go) as well as an input element (for the search bar). <br>
Example: <br>
` <input id="pac-input" class="controls" type="text" placeholder="Enter a location"> `
` <div id="the-map" style="height: 500px; width: 500px;"></div> `
* Then call renderMap(MAP_ID, SEARCH_ID) like this: <br>
<pre> SearchLocationPicker.renderMap('the-map','pac-input'); </pre>
* To get current Lat/Lng use getLat() and getLng() <br>
<pre>
document.getElementById('pin-latitude').innerHTML = SearchLocationPicker.getLat();
document.getElementById('pin-longitude').innerHTML = SearchLocationPicker.getLng();
</pre>

# Custom Callback

You can set a custom callback for when the current location's coordinates change like this. <br>
<br>
<pre>
SearchLocationPicker.setCustomOnclickCallback(confirmLocation);

function confirmLocation(){
    document.getElementById('pin-latitude').innerHTML = SearchLocationPicker.getLat();
    document.getElementById('pin-longitude').innerHTML = SearchLocationPicker.getLng();
}
</pre><br>

# Examples

You can see a working example in example/index.html (requires you to provide your own API key).

