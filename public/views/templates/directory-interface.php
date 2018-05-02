<div>
	<fieldset class="geography-level-select" id="filters-container-regions">
		<legend class="visuallyhidden">Choose what type of geography you wish to select an area by</legend>
		<input type="radio" id="ecpp_county" class="visuallyhidden" name="geography_type" value="county" checked="checked" autocomplete="off"><label for="ecpp_county">County</label>
		<input type="radio" id="ecpp_school" class="visuallyhidden" name="geography_type" value="school" autocomplete="off"><label for="ecpp_school">School District</label>
		<input type="radio" id="ecpp_senate" class="visuallyhidden" name="geography_type" value="senate" autocomplete="off"><label for="ecpp_senate">Senate District</label>
		<input type="radio" id="ecpp_house" class="visuallyhidden" name="geography_type" value="house" autocomplete="off"><label for="ecpp_house">House District</label>
		<input type="radio" id="ecpp_congressional" class="visuallyhidden" name="geography_type" value="congressional" autocomplete="off"><label for="ecpp_congressional">Congressional District</label>
		<input type="radio" id="ecpp_mu-extension" class="visuallyhidden" name="geography_type" value="mu-extension" autocomplete="off"><label for="ecpp_mu-extension">MU Extension Region</label>
	</fieldset>

	<?php // Location selector: map and address search box ?>
	<div class="atm-my-community-location-map">
		<div id="choose-my-community-map" class="leaflet-map"></div>
		<form id="address-search-form">
			<div class="input-group">
				<input id="address-input" type="text" value="" class="form-control" placeholder="Find a location..." />
				<label for="address-input" class="visuallyhidden">Search for a location by address</label>
				<button type="submit" class="search-submit-button visuallyhidden">Search</button>
			</div>
		</div>
		<?php // Geography item list output ?>
		<h4>Selected Areas</h4>
		<div id="geo-short-results" class="geo-short-results-list">
			<button v-for="(item, index) in items" type="button" aria-pressed="false" v-bind:id="'geoidShort-'+item.geoid" class="geo-short-results-item" @click="deleteItem(item,index)" v-bind:aria-label="'Deselect ' + item.label" v-bind:title="'Deselect ' + item.label">
			  {{item.label}} <span class="icon-cross"></span></label>
			</button>
			<span v-if="items.length == 0" id="geo-short-results-no-selection">Click the map or search for an address above to select areas.</span>
		</div>
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

