(function ( $ ) {
    "use strict";
/*** From MCC **/

    // see complete object definition:
    // https://docs.google.com/document/d/1RJRDP-tZLFzAeMUvd72Eig9QyoI7pM1XLYB7WHQa5X0/edit?usp=sharing
    var MCC = {
        map: 'choose-my-community-map',
        cssGeog: '.ecpp-geog',
        selectcssGeogID: 'filters-container-regions',
        selectcssGeogName: 'geography_type',
        igeog: 0,
        currentGeog: "county",
        geoid: [],
        geog: {
          "county": {
              geo_key: "050",
              layer_ids: [4, 5],
              layer_name: "county",
              select_ids: [6, 7]
          },
          "school": {
              geo_key: "970",
              layer_ids: [24, 25],
              layer_name: "school",
              select_ids: [26, 27]
          },
          "senate": {
              geo_key: "610",
              layer_ids: [36, 37],
              layer_name: "senate",
              select_ids: [38, 39]
          },
          "house": {
              geo_key: "620",
              layer_ids: [32, 33],
              layer_name: "house",
              select_ids: [34, 35]
          },
          "congressional": {
              geo_key: "500",
              layer_ids: [40, 41],
              layer_name: "congressional",
              select_ids: [42, 43]
          },
          "mu-extension": {
              geo_key: "MUX",
              layer_ids: [44, 45],
              layer_name: "mu-extension",
              select_ids: [46, 47]
          }
        }
    };

    /**
    * START
    */
    if ($('#' + MCC.map).length) {
        var layerSelect, boundaryLayer, legendMCC;

        // initialize the map
        var map = L.map(MCC.map, {
            attributionControl: false,
            minZoom: 7,
            maxZoom: 13,
            loadingControl: true,
            scrollWheelZoom: false
        }).setView([38.333, -92.34], 7);

        // add ESRI's World Terrace Base basemap
        L.esri.tiledMapLayer({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer"
        }).addTo(map);

        // get the statewide map extent
        MCC.bounds = map.getBounds();
        map.setMaxBounds(MCC.bounds.pad(0.02));       // add 2% padding for popup
        var aTagId = "leaflet-control-zoom-to-mo";

        // add a custom 'zoom to Missouri' control on the map
        var moZoomControl = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                var aTag = L.DomUtil.create('a', 'leaflet-control-custom', container);
                aTag.href = "#";
                aTag.id = aTagId;
                container.onclick = function (e) {
                    map.flyToBounds(MCC.bounds);
                    e.stopPropagation();
                }
                return container;
            },
        });
        map.addControl(new moZoomControl());

        // Now add some accessibility attributes to our custom control.
        $( "#" + aTagId ).attr("aria-label", "Zoom to Missouri");
        $( "#" + aTagId ).attr("title", "Zoom to Missouri");
        $( "#" + aTagId ).attr("role", "button");

        // add MCC density, boundary and reference map layers
        addMapLayers();

        // geocode service
        var geocoder = L.esri.Geocoding.geocodeService();

        //********************* EVENT HANDLERS ******************//


        // attach top geography bar button click event handler
        $('input[name="' + MCC.selectcssGeogName + '"]').change(function(e) { // Select the radio input group
            // Clear selected areas.
            shortGeoList.items = [];

            // $(this).val() returns the value of the checked radio button
            // which triggered the event.
            loadDataActiveGeog( $(this).val() );
        });

        // attach map click event handler
        map.on('click', function (e) {
            if (MCC.popup) MCC.popup.remove();
            selectFeature(e.latlng);
        });

        // Listen for address searches.
        $( "#address-search-form" ).on( "submit", function( event ) {
          event.preventDefault();
          searchLocation();
        });

        //****************** LOCAL FUNCTIONS *******************//

        /**
         * Activate a geography selection
         * @param {string} activeGeog
         */
        function loadDataActiveGeog(activeGeog) {
            if (MCC.popup) MCC.popup.remove();

            // Is this a change? If not, do nothing.
            if ( activeGeog === MCC.currentGeog ) {
              return;
            }

            // zoom out to state extent
            map.flyToBounds(MCC.bounds);

            if (MCC.selectionBounds) {
                delete MCC.selectionBounds;
            }
            // now set up new geography layers
            MCC.currentGeog = activeGeog;
            MCC.geoid = [];

            // Add the select layer again to fetch the new boundaries.
            updateGeoSpecificLayers();

            // remove all selections
            layerSelect.setLayerDefs(resetSelection());
        }

        // Adds or updates the layer used to show the boundaries for the currently selected geography.
        function addBoundaryLayer() {
            var service = "https://gis3.cares.missouri.edu/arcgis/rest/services/Boundary/Current_MO/MapServer";

            if (boundaryLayer) {
              boundaryLayer.remove();
            }

            // add the boundary's selection layer
            boundaryLayer = L.esri.dynamicMapLayer({
              url: service,
              layers: MCC.geog[MCC.currentGeog].layer_ids,
              layerDefs: resetSelection(),
              format: "png32",
              opacity: 1,
              position: 'back' // No idea if this is a valid parameter. Poor documentation on this.
            }).addTo(map);
        }

        // Adds or updates the layer used to show the outline of the currently selected geography.
        function updateSelectLayer() {
            var service = "https://gis3.cares.missouri.edu/arcgis/rest/services/Boundary/Current_MO/MapServer";

            if (layerSelect) {
              layerSelect.remove();
            }

            // add the boundary's selection layer
            layerSelect = L.esri.dynamicMapLayer({
              url: service,
              layers: MCC.geog[MCC.currentGeog].select_ids,
              layerDefs: resetSelection(),
              format: "png32",
              opacity: 1,
              position: 'front'
            }).addTo(map);
        }

        /*
         * Load geography-specific boundary and selection-identifier layers.
         */
        function updateGeoSpecificLayers() {
          addBoundaryLayer();
          updateSelectLayer();
        }

        /**
         * Add map layers as a base layer and selection layer to the map
         */
        function addMapLayers() {

            updateGeoSpecificLayers();

            // add a reference layer, only available 0-13 zoom levels. Move to shadowPane so it's on the top
            var refLayer = L.esri.tiledMapLayer({
                url: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer',
                maxZoom: 13
            }).addTo(map);
            map.getPanes().shadowPane.appendChild(refLayer.getContainer());

        }

        /**
         * Set all selection layers to no selection
         */
        function resetSelection() {
            var def = {};
            $.each(MCC.geog, function (i, v) {
                if (v.select_ids) {
                    for (var k = 0; k < v.select_ids.length; k++) {
                        def[v.select_ids[k]] = "GEOID IN ('')";
                    }
                }
            });
            return def;
        }

        /**
         * Select a feature on map
         * @param {any} latLng - The point location on map to select geography for.
         */
        function selectFeature(latLng) {
            // get census tract number
            layerSelect.identify()
                .at(latLng)
                .on(map)
                .layers("visible:" + MCC.geog[MCC.currentGeog].select_ids.join(","))
                .run(function (error, featureCollection) {
                    setSelectionDef(featureCollection, latLng);
                });
        }

        /**
         * Set the geography selection definition
         * @param {any} [featureCollection] - The list of features found at mouse click on the map
         */
        function setSelectionDef(featureCollection, latlng) {
            var activeGeog = MCC.geog[MCC.currentGeog];

            // get selected GEOID
            if (featureCollection && featureCollection.features.length > 0) {
                var inMissouri = false;

                $.each(featureCollection.features, function (idx, feature) {
                    var dataId = feature.properties["GEOID"] || feature.properties["GeoID"];

                    // check if in Missouri and we have not already selected it
                    if ($.inArray(dataId, MCC.geoid) === -1) {
                        MCC.geoid.push(dataId);

                        // add to filter panel
                        var name = feature.properties["Name"] || feature.properties["NAMELSAD"];

                        shortGeoList.items.push({ "geoid": dataId, "label": name });

                        // show a popup
                        if (latlng) {
                          var center = L.geoJSON(featureCollection).getBounds().getCenter();

                          MCC.popup = L.popup({
                              minWidth: 200,
                              autoPan: false,
                              className: 'popup'
                          })
                            .setLatLng(center)
                            .setContent('<h2>' + name + '</h2><p><a href="#atm-directory-list" class="more-link">View data</a></p>' )
                            .openOn(map);
                        }
                        inMissouri = true;
                    }
                });

                if (!inMissouri) return;

            }

            // set layer definition
            var query = "GEOID IN ('" + MCC.geoid.join("','") + "')";
            var def = {};
            $.each(activeGeog.select_ids, function (i, v) {
                def[v] = query;
            });

            // if selection layer has been added to map, show selection
            if (layerSelect) {
                layerSelect.setLayerDefs(def);

                // expand bounds to include the selection, and zoom to new bounds
                if (featureCollection) {
                    var geojson = L.geoJSON(featureCollection);
                    var featureBounds = geojson.getBounds();
                    if (MCC.selectionBounds) {
                        MCC.selectionBounds.extend(featureBounds);
                    } else {
                        MCC.selectionBounds = featureBounds;
                    }

                    map.flyToBounds(MCC.selectionBounds);
                }
            }

            return def;
        }

        /**
         * Query the boundary layer of selected GEOID to get a collection of features.
         * @param {string} layerId - The ID of the layer to query
         * @param {callbackRequest} callback - The function to execute after query has returned fetureCollection
         */
        function queryFeatures(layerId, idList, callback) {
            var queryOption = {
                url: "https://gis3.cares.missouri.edu/arcgis/rest/services/Boundary/Current_MO/MapServer",
                useCors: true
            };

            var q = (idList) ? "GEOID IN ('" + idList.join("','") + "')" : "";
            L.esri.query(queryOption)
                .layer(layerId)
                .within(MCC.bounds)
                .where(q)
                .run(function (error, featureCollection) {
                    callback = callback || $.noop;
                    callback(featureCollection);
                });
        }

        /**
         * Search location with geocoding service
         */
        function searchLocation() {
            var address = $("#address-input").val();
            if (address !== "") {
                // if state is not specified, we add state
                if (!/(mo$|mo |missouri$|missouri )/i.test(address)) {
                    address += ", mo";
                }

                geocoder.geocode().text(address).run(function (error, response) {
                    if (response && response.results) {
                        selectFeature(response.results[0].latlng);
                    }
                });
            }
        }

    // Templating
    // Add a new Vue component for directory items.
    Vue.component('directory-item', {
      template: '#directory-item-template',
      props: ['location'],
      computed: {
        // a computed getter
        selectedArea: function () {
          if ( ! shortGeoList.items ) {
            return '';
          }
          var rendered = [];
          $( shortGeoList.items ).each( function( index, item ) {
            rendered.push( item.label );
          });
          return rendered.join(', ');
        },
      },
    });

    // A subcomponent that is used to output the contact list for a location.
    Vue.component('contact-vcard', {
      template: '#directory-item-vcard',
      props: ['contact'],
      computed: {
        emailLink: function () {
          var eml = this.contact.email;
          if ( /@/.test( eml ) ) {
            return '<a href="mailto:' + eml + '">' + eml + '</a>';
          } else {
            return '<a href="' + eml + '" target="_blank">' + eml + '</a>';
          }
        }
      },
    });

    // Initialize the directory list
    var directoryList = new Vue({
      el: '#atm-directory-list',
      data: {
        locations: [],
        loading: false,
      },
      methods: {
        refresh: function ( geoids ) {
          this.loading = true;

          if ( ! Array.isArray( geoids ) ) {
            geoids = [];
          }

          // If there are no chosen areas, no need to query.
          if ( ! geoids.length ) {
            this.locations = [];
            this.loading = false;
            return;
          }

          var vm = this;
          fetchResults( publicMccVars.crosswalkEndpoint, { "id": geoids.join(',') } )
            .then( function(result) {
                vm.locations = result;
                vm.loading = false;
            });
        }
      }
    });

    // The short results box
    var shortGeoList = new Vue({
      el: '#geo-short-results',
      data: {
        items: []
      },
      watch: {
        // whenever the items list changes, this function will run
        items: function ( items ) {
          // Extract and pass geoids to the directory list.
          var geoids = [];
          $( items ).each( function( index, item ) {
            geoids.push( item.geoid );
          });

          // Refresh the directory results.
          directoryList.refresh( geoids );

          // Modify URL to reflect the current selection.
          var urlParam;
          if ( geoids.length ) {
            urlParam = "?geoid=" + geoids.join(",");
          } else {
            // Remove the query args altogether.
            urlParam = window.location.pathname;
          }
          window.history.pushState({}, document.title, urlParam);
        }
      },
      methods: {
        deleteItem: function (element, index) {
          // Remove the item from the map, too.
          var gindex = MCC.geoid.indexOf( element.geoid );
          MCC.geoid.splice( gindex, 1 );

          // we've removed a geography - now need to update the bounds
          if (MCC.geoid.length === 0) {
            delete MCC.selectionBounds;
            map.flyToBounds(MCC.bounds);
          } else {
            var layerId = MCC.geog[MCC.currentGeog].select_ids[1];
            queryFeatures(layerId, MCC.geoid, function (featureCollection) {
              var geojson = L.geoJSON(featureCollection);
              MCC.selectionBounds = geojson.getBounds();
              map.flyToBounds(MCC.selectionBounds);
            });
          }
          setSelectionDef();

           // Remove popup/
          if (MCC.popup) MCC.popup.remove();

          // Remove the item from the short list.
          this.items.splice(index, 1);
        }
      },
      mounted: function () {
        /*
         * When the short list is built on page load, check to see
         * if a selection area has been passed as a url parameter arg.
         * If yes, show the right info.
         */
        this.$nextTick(function () {
          var geoidParam = getUrlParameter( "geoid" );
          if ( geoidParam ) {
            var passedIds = geoidParam.split(',');
            /*
             * First, set map to the correct geography type.
             * This is done by checking to see what geography type the passed geoIDs are.
             */
            var prefix = passedIds[0].substr( 0, 3 );
            $.each( MCC.geog, function(index, el){
              if ( el.geo_key == prefix ) {
                $("input[name='geography_type']").filter('[value='+index+']').prop('checked', true);
                loadDataActiveGeog( index );
                return false;
              }
            });

            // Next, we select the items on the map, which will start the cascade for showing the directory items.
            if ( layerSelect ) {
              layerSelect.query()
                .layer(MCC.geog[MCC.currentGeog].select_ids[0])
                .where("GEOID IN ('" + passedIds.join("','") + "')")
                .run(function (error, featureCollection, response) {
                    setSelectionDef(featureCollection, false);
              });
            }
          }
        });
      }
    });

    // Generic API request router.
    function fetchResults( endpoint, params ) {
      var cleanParams;
      if ( params !== null && typeof params === 'object' ) {
        cleanParams = jQuery.param( params );
      } else {
        cleanParams = encodeURIComponent( params );
      }
      var apiUrl = publicMccVars.apiBaseUrl + endpoint + "?" + cleanParams;
      return $.ajax({
          type: "get",
          url: apiUrl,
          dataType: "json",
          crossDomain: true,
          error: function ( err ) {
              console.log( 'API error', err );
          }
      }).then(function(result) {
        return result;
      });
    }

    /*
     * Get the value for a url parameter key.
     * E.g. for ?key=value, return value
     */
    function getUrlParameter( name ) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

  }
}(jQuery));
