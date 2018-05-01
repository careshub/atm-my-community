<div>
	<nav class="geography-level-select" id="filters-container-regions">
		<input type="radio" id="ecpp_county" name="geography_type" value="county" checked="checked" autocomplete="off"> <label for="ecpp_county">County</label>
		<input type="radio" id="ecpp_school" name="geography_type" value="school" autocomplete="off"><label for="ecpp_school">School District</label>
		<input type="radio" id="ecpp_senate" name="geography_type" value="senate" autocomplete="off"><label for="ecpp_senate">Senate District</label>
		<input type="radio" id="ecpp_house" name="geography_type" value="house" autocomplete="off"><label for="ecpp_house">House District</label>
		<input type="radio" id="ecpp_congressional" name="geography_type" value="congressional" autocomplete="off"><label for="ecpp_congressional">Congressional District</label>
		<input type="radio" id="ecpp_mu-extension" name="geography_type" value="mu-extension" autocomplete="off"><label for="ecpp_mu-extension">MU Extension Region</label>
	</nav>

	<?php // Location selector: map and address search box ?>
	<div class="atm-my-community-location-map">
		<div id="choose-my-community-map" class="leaflet-map"></div>
		<form id="address-search-form">
			<div class="input-group">
				<input id="address-input" type="text" value="" class="form-control" placeholder="Find a location..." />
				<button type="submit" class="search-submit-button"></button>
			</div>
		</div>
		<?php // Geography item list output ?>
		<h4>Selected Areas</h4>
		<ul id="geo-short-results" class="geo-short-results-list">
			<li v-for="(item, index) in items"><input type="checkbox" v-bind:id="'geoidShort-'+item.geoid" checked="checked" name="geoShortResultsList" @click="deleteItem(item,index)"><label v-bind:for="'geoidShort-'+item.geoid">{{item.label}} <span class="icon-cross"></span></label></li>
			<li id="geo-short-results-no-selection">Click the map or search for an address above to select areas.</li>
		</ul>
	</div>

	<?php // Geography item list output ?>
	<div id="atm-directory-list" class="atm-directory-list-results">
		<directory-item
			v-for="location in locations"
			v-bind:location="location"
			v-bind:key="location.geoid"
			v-bind:id="location.geoid"
		></directory-item>
		<!-- Only show if loading is true -->
		<div id="atm-directory-list-loading" class="directory-list-load-indicator" v-if="loading" v-cloak>
			<span><span class="spinner8"></span>Loading...</span>
		</div>
	</div>


</div>

