(function ( $ ) {
    "use strict";

    // Initialize a Leaflet map.
    var map = L.map('choose-my-community-map', {
        attributionControl: false,
        minZoom: 7,
        maxZoom: 13,
        loadingControl: true,
        scrollWheelZoom: false
    }).setView([38.333, -92.34], 7);

    // Add the street map as the base map.
    L.esri.tiledMapLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    }).addTo(map);

    // User interaction: clicking on map or searching by string.
    map.on('click', function( e ){
      updatePin( e.latlng );
      refreshGeographyResults( e.latlng );
    });

    $( "#address-search-form" ).on( "submit", function( event ) {
      event.preventDefault();
      searchLocation();
    });

    // Search location with geocoding service
    function searchLocation() {
      var address = $("#address-input").val();
      if (address !== "") {
        // if state is not specified, we add state
        if (!/(mo$|mo |missouri$|missouri )/i.test(address)) {
            address += ", mo";
        }

      // Use ESRI geocoding service
      L.esri.Geocoding.geocodeService().geocode().text(address).run(function (error, response) {
        if (response && response.results) {
          updatePin( response.results[0].latlng );
          refreshGeographyResults( response.results[0].latlng );
        } else {
          // @TODO: Check for results that are outside of the limited scope of this map
          alert( "No results found for search." );
        }
      });
      }
    }

    // Convert lat/lng into a geoid and fetches the intersecting/overlapping geoIDs then lists them.
    function refreshGeographyResults( latlng ) {
      fetchResults( 'api-location/v1/geoid/050', { lat: latlng.lat, lon: latlng.lng } ).done( function ( geoid ){
        updateGeographiesList( geoid );
        // Set a cookie to store the selected geoid.
        Cookies.set( 'atm-geoid', geoid );
      });
    }

    // Indicate selected location with a marker.
    var droppedPin = {};
    function updatePin( latlng ) {
      if ( droppedPin != undefined ) {
        map.removeLayer( droppedPin );
      };
      droppedPin = new L.marker(latlng).addTo(map);
    }

    // Templating
    // Add a new Vue component for directory items.
    Vue.component('directory-item', {
      template: '#directory-item-template',
      props: ['location']
    });

    // Initialize the directory list
    var directoryList = new Vue({
      el: '#atm-directory-list',
      data: {
        locations: []
      }
    });

    // Finds the related geoIDs, fetches their info and updates the list.
    function updateGeographiesList( geoid ) {
      var params  = { 'geoid': geoid };

      // Reformat the results to be used to build the Vue list.
      fetchResults( 'api-extension/v1/eci-geoid-list', params ).done( function(result) {
        var new_locations = [];
        $( result ).each( function( index, item ) {
          new_locations.push({
            geoid: item,
            title: 'GEOID ' + item,
            contactInfo: "Another place here " + item,
          });
        });
        directoryList.locations = new_locations;
      });

    }

    // Generic API request router.
    function fetchResults( endpoint, params ) {
      var host = "https://services.engagementnetwork.org/";

      // for my local dev use - remember to remove this someday.
      if (document.location.href.indexOf("dev.engagementnetwork.org") !== -1
        || document.location.href.indexOf("local.communitycommons.org") !== -1
        || document.location.href.indexOf("local.allthingsmissouri.org") !== -1) {
          host = "https://servicesdev.engagementnetwork.org/";
      }

      var apiUrl = host + endpoint + "?" + jQuery.param( params );
      return $.ajax({
          type: "get",
          url: apiUrl,
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          crossDomain: true,
          error: function ( err ) {
              console.log( 'API error', err );
          }
      }).done(function(result) {
        return result;
      });
    }
}(jQuery));
