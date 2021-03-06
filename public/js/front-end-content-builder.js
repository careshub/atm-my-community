(function ( $ ) {
		"use strict";

		// see complete object definition:
		// https://docs.google.com/document/d/1RJRDP-tZLFzAeMUvd72Eig9QyoI7pM1XLYB7WHQa5X0/edit?usp=sharing
		var MCC = {
			map: 'choose-my-community-map',
			cssGeog: '.ecpp-geog',
			selectcssGeogID: 'filters-container-regions',
			selectcssGeogName: 'geography_type',
			igeog: 0,
			geoid: [],
			// Geog will be updated via an AJAX call. These values are placeholders.
			geog:[
				{
					"geo_key": "050",
					"layer_ids": [ 4, 5 ],
					"layer_name": "County",
					"select_ids": [ 6, 7 ]
				},
				{
					"geo_key": "970",
					"layer_ids": [ 24, 25 ],
					"layer_name": "School District",
					"select_ids": [ 26, 27 ]
				},
				{
					"geo_key": "610",
					"layer_ids": [ 36, 37 ],
					"layer_name": "Senate District",
					"select_ids": [ 38, 39 ]
				},
				{
				 "geo_key": "620",
					"layer_ids": [ 32, 33 ],
					"layer_name": "House District",
					"select_ids": [ 34, 35 ]
				},
				{
				 "geo_key": "500",
					"layer_ids": [ 40, 41 ],
					"layer_name": "Congressional District",
					"select_ids": [ 42, 43 ]
				},
				{
				 "geo_key": "MUX",
					"layer_ids": [ 44, 45 ],
					"layer_name": "MU Extension Region",
					"select_ids": [ 46, 47 ]
				},
				{
				 "geo_key": "RPC",
					"layer_ids": [ 48, 49 ],
					"layer_name": "Regional Planning Commision",
					"select_ids": [ 50, 51 ]
				}
			],
		},
		geocoder,
		layerSelect,
		boundaryLayer,
		legendMCC,
		map,
		geoSelector,
		directoryList,
		shortGeoList;

		/**
		* START
		*/
		if ($('#' + MCC.map).length) {
			// Start by fetching the possible geographies.
			fetchResults( 'api-extension/v1/atm/district-types' )
			.done( function( response ) {
				if ( typeof response === 'object' && !! response ) {
					MCC.geog = response;
				}
				// Now we can load the map and Vue elements.
				initializeVueElements();
				initializeMap();
		});
		}

		function initializeMap() {
			// initialize the map
			map = L.map(MCC.map, {
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
			geocoder = L.esri.Geocoding.geocodeService();

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
		}

		//****************** LOCAL FUNCTIONS *******************//

		/**
		 * Activate a geography selection
		 * @param {string} activeGeog
		 */
		function loadDataActiveGeog(activeGeog) {
			if ( MCC.popup ) {
				MCC.popup.remove();
			}

			// zoom out to state extent
			map.flyToBounds(MCC.bounds);

			if ( MCC.selectionBounds ) {
				delete MCC.selectionBounds;
			}
			// now set up new geography layers
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
				layers: MCC.geog[geoSelector.selectedGeography].layer_ids,
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
				layers: MCC.geog[geoSelector.selectedGeography].select_ids,
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
				.layers("visible:" + MCC.geog[geoSelector.selectedGeography].select_ids.join(","))
				.run(function (error, featureCollection) {
						setSelectionDef(featureCollection, latLng);
				});
		}

		/**
		 * Set the geography selection definition
		 * @param {any} [featureCollection] - The list of features found at mouse click on the map
		 */
		function setSelectionDef(featureCollection, latlng) {
			var activeGeog = MCC.geog[geoSelector.selectedGeography];

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
			props: {
				'location': Object
			},
			// This is a data item instead of a prop so that the sibling instances can be independent.
			data: function () {
				return {
					expanded: false
				}
			},
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
				sectionID: function () {
					// Clean up string for use as attribute.
					return this.location.district_type.replace(/\s+/g,"-").replace(/[\(\)]/g,"");
				}
			},
			methods: {
				processExpand: function() {
					var vm = this;
					// If the list is currently expanded, scroll back up so we won't
					// be looking at the bottom of page when it shrinks.
					if ( vm.expanded ) {
						$('html').stop().animate({
							scrollTop: $( "#" + vm.$el.id ).offset().top - 100
						}, 500, function() {
							vm.expanded = !vm.expanded;
						});
					} else {
						vm.expanded = !vm.expanded;
					}
				}
			}
		});

		// A subcomponent that is used to output the contact list for a location.
		Vue.component('district-data-item', {
			template: '#district-data-item-template',
			props: {
				'entry': Object,
				'eindex': Number,
				'hasMultiple': Boolean,
				'totalEntries': Number,
				'listExpanded': Boolean // This is inherited from the directory-item component.
			}
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
						var text = this.contact.name || this.contact.title;
						return '<a href="' + eml + '" target="_blank"> Contact ' + text + '</a>';
					}
				},
				webLink: function () {
					var ws = this.contact.website,
							text = this.contact.name || this.contact.title;

					return '<a href="' + ws + '" target="_blank">Visit web site for ' + text + '</a>';
				}
			},
		});

	function initializeVueElements() {

		// The geography selector above the map.
		geoSelector = new Vue({
			el: '#filters-container-regions',
			data: {
				items: MCC.geog,
				selectedGeography: 0,
				toggledMore: false,
			},
			computed: {
				// a computed getter
				enableMore: function () {
					for (var i = 0; i < this.items.length; i++) {
						if ( undefined !== this.items[i].nav && "more" === this.items[i].nav ) {
							return true;
						}
					}
					return false;
				}
			},
			beforeMount: function() {
				// Add all items to the "primary" nav when loading.
				for ( var i = 0; i < this.items.length; i++ ) {
					Vue.set( this.items[i], "nav", "primary" );
				}
			},
			mounted: function () {
				this.$nextTick(function () {
					var vm = this;
					/*
					 * Add a "more" nav inspired by: https://css-tricks.com/container-adapting-tabs-with-more-button/
					 * On load and page resize, this will measure the items and move those that won't fit to a "more" menu.
					 */
					const container = $( ".geography-level-select" );
					$( ".more-geographies > button" ).on( 'click', function( e ) {
						e.preventDefault();
						geoSelector.toggledMore = ! geoSelector.toggledMore;
					} );

					this.doResize();
					window.addEventListener( "resize", debounce( geoSelector.doResize, 350 ) );

					// Listen for "off" clicks when the "more" nav is open
					document.addEventListener('click', function (event) {
						if ( ! geoSelector.toggledMore ) {
							return;
						}

						const moreGeosContainer = document.getElementById( 'more-geographies-container' );
						let el = event.target
						while( el ) {
							if ( el === moreGeosContainer ) {
								return;
							}
							el = el.parentNode
						}

						// Close the drop down menu.
						geoSelector.toggledMore = false;
					}, false);

					/*
					 * When built on page load, check to see
					 * if a selection area has been passed as a url parameter arg.
					 * If yes, show the right info.
					 */
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
								geoSelector.selectedGeography = index;
							}
						});

						// Next, we select the items on the map, which will start the cascade for showing the directory items.
						if ( layerSelect ) {
							layerSelect.query()
								.layer(MCC.geog[geoSelector.selectedGeography].select_ids[0])
								.where("GEOID IN ('" + passedIds.join("','") + "')")
								.run(function (error, featureCollection, response) {
										setSelectionDef(featureCollection, false);
							});
						}
					}
				});
			},
			watch: {
				// whenever the selectedGeography changes, this function will run
				selectedGeography: function ( geo ) {
						// Clear selected areas.
						shortGeoList.items = [];

						loadDataActiveGeog( geo );
				}
			},
			methods: {
				doResize: function (element, index) {
					// Unset flex-grow so we can get accurate measurements.
					$( ".geography-level-select" ).addClass( "calculating" );

					let stopWidth    = $( ".more-geographies > button" ).width();
					let primaryWidth = $( ".entry-content" ).width();

					for ( var i = 0; i < geoSelector.items.length; i++ ) {
						Vue.set( geoSelector.items[i], "nav", "primary" );
					}

					for (var i = 0; i < geoSelector.items.length; i++) {
						if ( primaryWidth >= stopWidth + $( "#geo_li_" + geoSelector.items[i].geo_key ).width() ) {
							stopWidth += $( "#geo_li_" + geoSelector.items[i].geo_key ).width();
						} else {
							Vue.set( geoSelector.items[i], "nav", "more" );
						}
					}

					// Reenable flex-grow because it looks nicer.
					$( ".geography-level-select" ).removeClass( "calculating" );
				}
			},
		});

		// Initialize the directory list
		directoryList = new Vue({
			el: '#atm-directory-list',
			data: {
				locations: [],
				loading: false
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
		shortGeoList = new Vue({
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
						var layerId = MCC.geog[geoSelector.selectedGeography].select_ids[1];
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
		});
	}

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

	/*
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing.
	 * http://davidwalsh.name/javascript-debounce-function
	 */
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

}(jQuery));
