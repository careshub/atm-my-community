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
        // filterGeog: '#filter-geography',
        // filters: ["theme", "type", "affiliation"],
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
        }}
    };

    /**
    * START
    */
    if ($('#' + MCC.map).length) {
        var layerSelect, layerMCC, legendMCC;

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
        map.setMaxBounds(MCC.bounds);

        // add a custom 'zoom to Missouri' control on the map
        var moZoomControl = L.Control.extend({
            options: {
                position: 'topleft'
            },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                var aTag = L.DomUtil.create('a', 'leaflet-control-custom', container);
                aTag.href = "#";
                container.onclick = function (e) {
                    map.flyToBounds(MCC.bounds);
                    e.stopPropagation();
                }
                return container;
            },
        });
        map.addControl(new moZoomControl());

        // add MCC density, boundary and reference map layers
        addMapLayers();

        // geocode service
        var geocoder = L.esri.Geocoding.geocodeService();

        // set filters collapsible
        // collapsible();

        //********************* EVENT HANDLERS ******************//

        // select change of the dropdown list in 'My Community' filter
        // $("#" + MCC.selectcssGeogID).find("li").on('click', function (e) {
        //     $("#" + MCC.selectcssGeogID).find("li").removeClass("active");
        //     $(this).addClass("active");
        //     var i = parseInt($(this).attr("data-id"));
        //     loadDataActiveGeog(MCC.geog[i].layer_name);

        //     // update button css class
        //     $(MCC.cssGeog).removeClass('active');
        //     $(MCC.cssGeog + ":eq(" + i + ")").addClass('active');
        // });

        // attach top geography bar button click event handler
        $('input[name="' + MCC.selectcssGeogName + '"]').change(function(e) { // Select the radio input group
            // This returns the value of the checked radio button
            // which triggered the event.
            console.log( $(this).val() );
            loadDataActiveGeog( $(this).val() );
        });

        // $(MCC.cssGeog).on('click', function (e) {
        //     $(MCC.cssGeog).removeClass('active');
        //     $(this).addClass('active');

        //     // get current active geography
        //     var activeGeog = $(this).html();
        //     activeGeog = $.trim(activeGeog);

        //     loadDataActiveGeog(activeGeog);

        //     // update 'My Community' geog list item selection
        //     // $("#" + MCC.selectcssGeogID).find("li").removeClass("active");
        //     // $("#" + MCC.selectcssGeogID).find("li[data-id='" + MCC.igeog + "']").addClass("active");
        // });

        // attach map click event handler
        map.on('click', function (e) {
            if (MCC.popup) MCC.popup.remove();
            console.log( "click", e );
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

            // zoom out to state extent
            map.flyToBounds(MCC.bounds);

            // Is this a change? If not, do nothing.
            if ( activeGeog === MCC.currentGeog ) {
              return;
            }

            if (MCC.selectionBounds) {
                delete MCC.selectionBounds;
            }
            // now set up new geography layers
            MCC.currentGeog = activeGeog;
            // MCC.igeog = i;
            MCC.geoid = [];
console.log( MCC.geog[activeGeog].select_ids );
            // remove all selections
            layerSelect.setLayerDefs(resetSelection());
            console.log( 'update layer select', layerSelect.setLayers( MCC.geog[activeGeog].select_ids ) );

            // set map layer to the selection
            // $.each(MCC.geog, function (i, v) {
            //   console.log( v );
            //     if (v.layer_name === activeGeog) {
            //         // if it's different from the current geography
            //         if (MCC.igeog !== i) {
            //             // reset existing geography layer definition and selection bounds
            //             if (MCC.selectionBounds) {
            //                 delete MCC.selectionBounds;
            //             }
            //             // $("#impact-list").empty();

            //             // now set up new geography layers
            //             MCC.igeog = i;
            //             MCC.geoid = [];

            //             // change data layers to display
            //             // showDensityMap();

            //             // show summary data in filters and charts
            //             // getEngagements();

            //             // remove all selections
            //             layerSelect.setLayerDefs(resetSelection());
            //             layerSelect.setLayers(v.select_ids);

            //             // remove existing selection listing
            //             // populateGeographyList();
            //             // $(MCC.filterGeog).empty();
            //         }
            //         return false;
            //     }
            // });
        }

        /**
         * Add map layers as a base layer and selection layer to the map
         */
        function addMapLayers() {

            // get all geography button texts
            $(MCC.cssGeog).each(function (i, v) {
                // MCC.geog[i].layer_name = $.trim($(v).html());

                // populate geography pull-down list
                // $("#" + MCC.selectcssGeogID).append(
                //     //$("<option />", { text: MCC.geog[i].layer_name, value: i})
                //     $("<li />", {"class": "list-group-item", "data-id": i}).append(MCC.geog[i].layer_name)
                // );
            });
            //$("#" + MCC.selectcssGeogID).val(MCC.igeog);
            $("#" + MCC.selectcssGeogID).find("li[data-id='" + MCC.igeog + "']").addClass("active");

            // add MCC density map
            // showDensityMap();

            // show statewide summary
            // getEngagements();

            // add the boundary's selection layer
            var service = "https://gis3.cares.missouri.edu/arcgis/rest/services/Dynamic/Boundary2016_ECI/MapServer";
            layerSelect = L.esri.dynamicMapLayer({
                url: service,
                layers: MCC.geog[MCC.currentGeog].select_ids,
                layerDefs: resetSelection(),
                format: "png32",
                opacity: 1,
                position: 'front'
            }).addTo(map);

            console.log( layerSelect );

            // add a reference layer, only available 0-13 zoom levels. Move to shadowPane so it's on the top
            var refLayer = L.esri.tiledMapLayer({
                url: 'https://server.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer',
                maxZoom: 13
            }).addTo(map);
            map.getPanes().shadowPane.appendChild(refLayer.getContainer());

            // populate geography list
            // populateGeographyList();
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
         * Populate geography list in 'MY COMMUNITY' filter
         */
        // function populateGeographyList() {
        //     var name = MCC.geog[MCC.igeog].layer_name;
        //     var key = MCC.geog[MCC.igeog].geo_key;
        //     api("get", "api-location/v1/geoid-list/" + key, { state: "Missouri" }, function (data) {
        //         if (data) {
        //             name = (key === "500") ? "Cong. District" : name;
        //             $("#list-geography")
        //                 .empty()
        //                 .append($("<option />", { text: "- Select " + name + " -", value: "" }));

        //             $.each(data, function (i, v) {
        //                 $("#list-geography").append(
        //                     $("<option />", { value: v.geoid, text: v.name })
        //                 );
        //             });
        //         }
        //     });
        // }

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
                  console.log( "error", error );
                  console.log( "featureCollection", featureCollection );
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
                    if (/(^29|US29)/.test(dataId) && $.inArray(dataId, MCC.geoid) === -1) {
                        MCC.geoid.push(dataId);

                        // add to filter panel
                        var name = feature.properties["Name"] || feature.properties["NAMELSAD"];

                        // list UM impact card for the GEOID
                        // showImpactCard(name, dataId);

                        // include the count value in the geography list
                        // if (MCC.count && MCC.count[dataId]) {
                        //     name += " (" + MCC.count[dataId] + ")";
                        // }
                        // var liGeog = $("<li />", { "data-id": dataId })
                        //     .append($("<i />", { "class": "fa fa-times-circle fa-2x" }))
                        //     .append($("<span />").append(name));
                        // $(MCC.filterGeog).append(liGeog);

                        shortGeoList.items.push({ "geoid": dataId, "label": name });

                        // show a popup
                        if (latlng) {
                            MCC.popup = L.popup({
                                minWidth: 200,
                                className: 'popup'
                            })
                                .setLatLng(latlng)
                                .setContent('<h5>' + name + '</h5><p><a href=#atm-directory-list>View data.</a></p>' )
                                .openOn(map);
                        }

                        // update msg
                        // changeListPrompt();

                        // filter icon 'delete' click - remove the geography
                        // liGeog.find("i").on("click", function (e) {
                        //     var li = $(this).parent("li");
                        //     var id = li.attr("data-id");
                        //     li.remove();

                        //     for (var i = 0; i < MCC.geoid.length; i++) {
                        //         if (MCC.geoid[i] === id) {
                        //             MCC.geoid.splice(i, 1);

                        //             // we've removed a geography - now need to update the bounds
                        //             if (MCC.geoid.length === 0) {
                        //                 delete MCC.selectionBounds;
                        //                 map.flyToBounds(MCC.bounds);

                        //                 // show summary again
                        //                 getEngagements();
                        //             } else {
                        //                 var layerId = MCC.geog[MCC.igeog].select_ids[1];
                        //                 queryFeatures(layerId, MCC.geoid, function (featureCollection) {
                        //                     var geojson = L.geoJSON(featureCollection);
                        //                     MCC.selectionBounds = geojson.getBounds();
                        //                     map.flyToBounds(MCC.selectionBounds);
                        //                 });
                        //             }

                        //             // remove UM Impact card
                        //             if (MCC.igeog !== 1) {
                        //                 $("#impact-list").find(".single-engagement[data-id='" + id + "']").parent().remove();
                        //             }

                        //             // update the selection on the map
                        //             setSelectionDef();

                        //             // update list prompt
                        //             changeListPrompt();
                        //             break;
                        //         }
                        //     }

                        //     // remove popup
                        //     if (MCC.popup) MCC.popup.remove();
                        // });

                        // found geography in Missouri
                        inMissouri = true;
                    }
                });

                if (!inMissouri) return;

                //getGeoidTaxonomyKey();
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

            // update the theme/type/affiliation/engagement listings and chart
            // getEngagements();

            return def;
        }

        /**
         * list UM impact card for the GEOID
         * @param {string} name - The name of geography selection
         */
        // function showImpactCard(name, dataId) {
        //     if (MCC.geoid.length === 1 || !dataId) {
        //         $("#impact-list").empty();
        //     }
        //     dataId = dataId || "04000US29";

        //     // list UM impact card for the GEOID
        //     var stockImg = getPluginPath("images");
        //     var pdfPath = getPluginPath("pdf");
        //     if (MCC.geoid.length > 0) {
        //         pdfPath += MCC.geog[MCC.igeog].layer_name.toLowerCase();
        //     }
        //     var style = $("#list-view").hasClass("active") ? " list-group-item" : "";

        //     var $item = addItem({
        //         title: name,
        //         link: pdfPath + "/" + name + ".pdf",
        //         image: stockImg + "um_impact.png"
        //     }, dataId, style, true);
        //     $("#impact-list").append($item);
        // }

        /**
         * Change geography list prompt text
         */
        function changeListPrompt() {
            var $list = $("#list-geography")
            var $option1 = $("#list-geography option:first");
            $list.val($option1.val());
            var msg = $option1.text();

            var texts = ['Select', 'Add'];
            if (MCC.geoid.length > 0) {
                msg = msg.replace(texts[0], texts[1]);
            } else {
                msg = msg.replace(texts[1], texts[0]);
            }
            $option1.text(msg);
        }

        /**
         * Query the boundary layer of selected GEOID to get a collection of features.
        * @param {string} layerId - The ID of the layer to query
        * @param {callbackRequest} callback - The function to execute after query has returned fetureCollection
         */
        function queryFeatures(layerId, idList, callback) {
            var queryOption = {
                url: "https://gis3.cares.missouri.edu/arcgis/rest/services/Dynamic/Boundary2016_ECI/MapServer",
                useCors: true
            };

            var q = (idList) ? "GEOID IN ('" + idList.join("','") + "')" : "";
            L.esri.query(queryOption)
                .layer(layerId)
                .within(MCC.bounds)
                .where(q)
                .run(function (error, featureCollection) {
                  console.log( "error", error );
                  console.log( "featureCollection", featureCollection );
                    callback = callback || $.noop;
                    callback(featureCollection);
                });
        }

        /**
         * Classify the counts using 'Jenks' natural breaks
         */
        function getClassification() {
            var series = [];
            for (var g in MCC.count) {
                series.push(MCC.count[g]);
            }
            var brew = new classyBrew();
            brew.setSeries(series);
            brew.setNumClasses(4);
            var breaks = brew.classify();

            MCC.colors.grades = [0];
            for (var i = 0; i < breaks.length - 1; i++) {
                MCC.colors.grades.push(breaks[i]);
            }

            //MCC.colors.grades = brew.classify();
            //MCC.colors.grades.splice(0, 0, 0);      // add 0 as the first element
            //MCC.colors.grades.splice(MCC.colors.grades.length - 1, 1);  // remove the last one
        }

        /**
         * Get the color to shade a GeoJSON feature
         * @param {any} d - The value of property 'count'
         */
        function getColor(d) {
            var upper = MCC.colors.ramp.length - 1;
            for (var i = upper; i >= 0; i--) {
                if (d > MCC.colors.grades[i]) {
                    return MCC.colors.ramp[upper - i];
                }
            }

            return MCC.colors.ramp[upper];
        }

        /**
         * Highlight a selected geographic feature on map
         * @param {any} e - Map click event
         */
        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 2,
                color: '#ff0000',
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        /**
         * Zoom map to the extent of a clicked geographic feature
         * @param {any} e - Map click event
         */
        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        /**
         * Event handler for map click on a GeoJSON feature --- delete???
         * @param {any} feature
         * @param {any} layer
         */
        function onEachFeature(feature, layer) {
            if (feature.properties) {
                var content = feature.properties["NAMELSAD"] || feature.properties["Name"];
                var count = feature.properties["count"];
                content = "<b>" + content + "</b>: " + count;
                layer.bindPopup(content);
            }
        }

        /**
         * Generate an element ID from the theme name by removing non-alpha-numeric values
         * @param {string} t - Theme name
         */
        function getThemeId(t) {
            return t.replace(/ /g, '_').toLowerCase();
        }

        /**
         * Get the filter object
         * @param {any} geoids - array of geoids
         * @param {any} ipage -  page number
         */
        function getPostFilter(geoids, ipage) {
            var filter = {
                page: ipage
            };

            if (geoids.length > 0) {
                filter["filter[muext_geoid]"] = geoids.join(",");
            }

            var term = searchTerm();
            if (term !== "") {
                filter.search = term;
            }

            return filter;
        }

        /**
         * Find common elements in two arrays
         * @param {any} a
         * @param {any} b
         */
        function hasCommonItems(a, b) {
            var newArr = [];
            newArr = a.filter(function (v) {
                return b.indexOf(v) >= 0;
            }).concat(b.filter(function (v) {
                return a.indexOf(v) >= 0;
            }));

            return newArr.length > 0;
        }

        function searchTerm() {
            return $("#eci-search").val().trim();
        }

        /**
         * Get the URL path of a directory in current plugin
         * @param {any} dir - The name of the directory
         */
        function getPluginPath(dir) {
            return $("#plugin-file-path").val() + dir + "/";
        }

        /**
         * Set display state of filter, engagement, chart containers.
         */
        function setContainerState() {
            var postObj = getPostObject();
            var hasGeog = (MCC.geoid.length > 0);
            var hasPosts = hasGeog && !$.isEmptyObject(postObj.theme) || !hasGeog;
            $("#style-container").toggle(hasPosts);
            //$("#engage-list").toggle(hasPosts);
            $("#impact-container").toggle(!hasGeog || MCC.igeog !== 1);

            var hasChart = !hasGeog || hasPosts;
            $("#chart-container").toggle(hasChart);
            $("#engage-container").toggle(hasChart);
        }

        /**
         * Check if we need to skip affiliation filters
         */
        // function skipAffiliation() {
        //     return ($("#filter-" + MCC.filters[2]).length === 0);
        // }

        /**
         * Scroll page to an element
         * @param {any} id - The id of the element
         */
        // function scrollTo(id) {
        //     var target = $("#" + id);
        //     if (target.length) {
        //         $('html,body').animate({
        //             scrollTop: target.offset().top - 160
        //         }, 1000);
        //         return false;
        //     }
        // }

        /**
         * Initialize all collapsible fieldsets.
         */

        function collapsible() {
            var settings = {
                collapsed: false,
                animation: true,
                speed: "medium"
            };

            $("div.collapsible-section").each(function () {
                var $section = $(this);
                var $title = $section.find(".collapsible-section-title");
                var isCollapsed = $section.hasClass("collapsed");

                $title.click(function () {
                    collapse($section, settings, !isCollapsed);
                    isCollapsed = !isCollapsed;

                    // update icon in legend
                    $(this).find("i")
                        .toggleClass("fa-chevron-down", isCollapsed)
                        .toggleClass("fa-chevron-up", !isCollapsed);
                });

                // Perform initial collapse. Don't use animation to close for initial collapse.
                if (isCollapsed) {
                    collapse($section, { animation: false }, isCollapsed);
                } else {
                    collapse($section, settings, isCollapsed);
                }
            });
        };

        /**
         * Collapse/uncollapse the specified section.
         * @param {object} $section
         * @param {object} options
         * @param {boolean} collapse
         */
        function collapse($section, options, doCollapse) {
            $container = $section.find("div.expand-view");
            if (doCollapse) {
                if (options.animation) {
                    $container.slideUp(options.speed);
                } else {
                    $container.hide();
                }
                $section.removeClass("expanded").addClass("collapsed");
            } else {
                if (options.animation) {
                    $container.slideDown(options.speed);
                } else {
                    $container.show();
                }
                $section.removeClass("collapsed").addClass("expanded");
            }
        };

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

        /**
        * Send a request to an API service to get data.
        * @param {string} service - API endpoint.
        * @param {object} data - The data posted to API.
        * @param {requestCallback} callback - The callback function to execute after the API request is succefully completed.
        * @param {requestCallback} [fallback] - The callback function to execute when the API request returns an error.
        */
        function api(type, service, data, callback, fallback) {
            service = (/^http/i.test(service)) ? service : "https://services.engagementnetwork.org/" + service;

            var param = {
                type: type,
                url: service,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                crossDomain: true,
                success: callback,
                error: fallback || $.noop
            };
            if (data && typeof data !== "undefined") {
                if (type === "post") {
                    param.data = JSON.stringify(data);
                } else {
                    param.url += "?" + $.param(data);
                }
            }
            $.ajax(param);
        }
    }

/* From the first run */

    // Initialize a Leaflet map.
    // var map = L.map('choose-my-community-map', {
    //     attributionControl: false,
    //     minZoom: 7,
    //     maxZoom: 13,
    //     loadingControl: true,
    //     scrollWheelZoom: false
    // }).setView([38.333, -92.34], 7);

    // Add the street map as the base map.
    // L.esri.tiledMapLayer({
    //     url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
    // }).addTo(map);

    // User interaction: clicking on map or searching by string.
    // map.on('click', function( e ){
    //   updatePin( e.latlng );
    //   refreshGeographyResults( e.latlng );
    // });

    // $( "#address-search-form" ).on( "submit", function( event ) {
    //   event.preventDefault();
    //   searchLocation();
    // });

    // Search location with geocoding service
    // function searchLocation() {
    //   var address = $("#address-input").val();
    //   if (address !== "") {
    //     // if state is not specified, we add state
    //     if (!/(mo$|mo |missouri$|missouri )/i.test(address)) {
    //         address += ", mo";
    //     }

    //   // Use ESRI geocoding service
    //   L.esri.Geocoding.geocodeService().geocode().text(address).run(function (error, response) {
    //     if (response && response.results) {
    //       updatePin( response.results[0].latlng );
    //       refreshGeographyResults( response.results[0].latlng );
    //     } else {
    //       // @TODO: Check for results that are outside of the limited scope of this map
    //       alert( "No results found for search." );
    //     }
    //   });
    //   }
    // }

    // Convert lat/lng into a geoid and fetches the intersecting/overlapping geoIDs then lists them.
    // function refreshGeographyResults( latlng ) {
    //   fetchResults( 'api-location/v1/geoid/050', { lat: latlng.lat, lon: latlng.lng } ).done( function ( geoid ){
    //     updateGeographiesList( geoid );
    //     // Set a cookie to store the selected geoid.
    //     Cookies.set( 'atm-geoid', geoid );
    //   });
    // }

    // Indicate selected location with a marker.
    // var droppedPin = {};
    // function updatePin( latlng ) {
    //   if ( droppedPin != undefined ) {
    //     map.removeLayer( droppedPin );
    //   };
    //   droppedPin = new L.marker(latlng).addTo(map);
    // }

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
      },
      methods: {
        refresh: function ( geoids ) {
          if ( ! Array.isArray( geoids ) ) {
            geoids = [];
          }

          console.log( "refreshList fired", geoids.join(',') );
          var vm = this
          fetchResults( publicMccVars.crosswalkEndpoint, { "id": geoids.join(',') } )
          .then( function(result) {
              console.log( "" );
              var new_locations = [];
              $( result ).each( function( index, item ) {
                console.log( item );
              //   new_locations.push({
              //     geoid: item,
              //     title: 'GEOID ' + item,
              //     contactInfo: "Another place here " + item,
              //   });
              });
              vm.locations = result;
            });

        }
      }
    });

    // Finds the related geoIDs, fetches their info and updates the list.
    function updateGeographiesList( geoid ) {
      var params  = { 'geoid': geoid };

      // Reformat the results to be used to build the Vue list.
      fetchResults( endpoint, params ).done( function(result) {
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
          // console.log( "watch fired with this", this.items);
          // refreshGeographyDirectory();
          directoryList.refresh( geoids );
        }
      },
      methods: {
        deleteItem: function (index) {
          this.items.splice(index, 1);
        }
      }
    });

    // function addSelectionToGeoResults( geoid, label ) {
    //   shortGeoList.items.push({ "geoid": geoid, "label": label });
    // }

    // // Watch the selection list for changes.
    // $( "#geo-short-results" ).on( "change", "input[name='geoShortResultsList']",function(e){
    //   console.log( $(this).val() );
    // });

    // Generic API request router.
    function fetchResults( endpoint, params ) {
      console.log( "fetchresults fired", endpoint, params );
      var cleanParams;
      if ( params !== null && typeof params === 'object' ) {
        cleanParams = jQuery.param( params );
      } else {
        cleanParams = encodeURIComponent( params );
      }
      var apiUrl = publicMccVars.apiBase + endpoint + "?" + cleanParams;

      return $.ajax({
          type: "get",
          url: apiUrl,
          dataType: "json",
          // dataType: "jsonp",
          // contentType: "application/json; charset=utf-8",
          crossDomain: true,
          // jsonp: true,
          error: function ( err ) {
              console.log( 'API error', err );
          }
      }).then(function(result) {
        console.log( "fetch results result", result );
        return result;
      });
    }
}(jQuery));

/**
* Generate Jenks Natural Breaks, modified from 'classybrew' github repository
* https://github.com/tannerjt/classybrew
*/
// (function () {
//   var classyBrew = (function () {
//     return function () {
//         this.series = undefined;
//         this.numClasses = null;
//         this.breaks = undefined;
//         this.range = undefined;
//         this.statMethod = undefined;

//         // define array of values
//         this.setSeries = function (seriesArr) {
//             this.series = Array();
//             this.series = seriesArr;
//             this.series = this.series.sort(function (a, b) { return a - b });
//         };

//         // set number of classes
//         this.setNumClasses = function (n) {
//             this.numClasses = n;
//         };

//         /**** Classification Methods ****/
//         this._classifyJenks = function () {
//             var mat1 = [];
//             for (var x = 0, xl = this.series.length + 1; x < xl; x++) {
//                 var temp = []
//                 for (var j = 0, jl = this.numClasses + 1; j < jl; j++) {
//                     temp.push(0)
//                 }
//                 mat1.push(temp)
//             }

//             var mat2 = []
//             for (var i = 0, il = this.series.length + 1; i < il; i++) {
//                 var temp2 = []
//                 for (var c = 0, cl = this.numClasses + 1; c < cl; c++) {
//                     temp2.push(0)
//                 }
//                 mat2.push(temp2)
//             }

//             for (var y = 1, yl = this.numClasses + 1; y < yl; y++) {
//                 mat1[0][y] = 1
//                 mat2[0][y] = 0
//                 for (var t = 1, tl = this.series.length + 1; t < tl; t++) {
//                     mat2[t][y] = Infinity
//                 }
//                 var v = 0.0
//             }

//             for (var l = 2, ll = this.series.length + 1; l < ll; l++) {
//                 var s1 = 0.0
//                 var s2 = 0.0
//                 var w = 0.0
//                 for (var m = 1, ml = l + 1; m < ml; m++) {
//                     var i3 = l - m + 1
//                     var val = parseFloat(this.series[i3 - 1])
//                     s2 += val * val
//                     s1 += val
//                     w += 1
//                     v = s2 - (s1 * s1) / w
//                     var i4 = i3 - 1
//                     if (i4 != 0) {
//                         for (var p = 2, pl = this.numClasses + 1; p < pl; p++) {
//                             if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
//                                 mat1[l][p] = i3
//                                 mat2[l][p] = v + mat2[i4][p - 1]
//                             }
//                         }
//                     }
//                 }
//                 mat1[l][1] = 1
//                 mat2[l][1] = v
//             }

//             var k = this.series.length
//             var kclass = []

//             for (i = 0, il = this.numClasses + 1; i < il; i++) {
//                 kclass.push(0)
//             }

//             kclass[this.numClasses] = parseFloat(this.series[this.series.length - 1])

//             kclass[0] = parseFloat(this.series[0])
//             var countNum = this.numClasses
//             while (countNum >= 2) {
//                 var id = parseInt((mat1[k][countNum]) - 2)
//                 kclass[countNum - 1] = this.series[id]
//                 k = parseInt((mat1[k][countNum] - 1))

//                 countNum -= 1
//             }

//             if (kclass[0] == kclass[1]) {
//                 kclass[0] = 0
//             }

//             this.range = kclass;
//             this.range.sort(function (a, b) { return a - b })

//             return this.range; //array of breaks
//         };

//         /**** End classification methods ****/

//         // return array of natural breaks
//         this.classify = function (method, classes) {
//             this.statMethod = (method !== undefined) ? method : this.statMethod;
//             this.numClasses = (classes !== undefined) ? classes : this.numClasses;
//             var breaks = this._classifyJenks();
//             this.breaks = breaks;
//             return breaks;
//         };

//         this.getBreaks = function () {
//             // always re-classify to account for new data
//             return this.breaks ? this.breaks : this.classify();
//         };

//         /*** Simple Math Functions ***/
//         this._mean = function (arr) {
//             return parseFloat(this._sum(arr) / arr.length);
//         };

//         this._sum = function (arr) {
//             var sum = 0;
//             var i;
//             for (i = 0; i < arr.length; i++) {
//                 sum += arr[i];
//             }
//             return sum;
//         };

//         this._variance = function (arr) {
//             var tmp = 0;
//             for (var i = 0; i < arr.length; i++) {
//                 tmp += Math.pow((arr[i] - this._mean(arr)), 2);
//             }

//             return (tmp / arr.length);
//         };

//         this._stdDev = function (arr) {
//             return Math.sqrt(this._variance(arr));
//         };

//         /*** END Simple math Functions ***/
//     }
//   });
//   // support node module and browser
//   if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
//       module.exports = classyBrew;
//   } else {
//       window.classyBrew = classyBrew;
//   }
// })();


