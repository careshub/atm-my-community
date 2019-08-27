<div>
	<div id="geography-select">
		<fieldset class="geography-level-select" id="filters-container-regions">
			<legend class="visuallyhidden">Choose what type of geography you wish to select an area by</legend>
			<ul id="mc-main-geogs" class="main-geogs">
				<li v-for="(item, index) in items" v-if="'primary' == item.nav" v-bind:id="'geo_li_'+item.geo_key">
						<input type="radio" v-bind:id="'ecpp_'+item.geo_key" class="visuallyhidden" name="geography_type" v-bind:checked="0 === index" v-bind:value="index" autocomplete="off" v-model="selectedGeography"><label v-bind:for="'ecpp_'+item.geo_key">{{item.layer_name}}</label>
				</li>
				<li v-bind:style="{visibility: enableMore ? 'visible' : 'hidden'}" class="more-geographies" id="more-geographies-container">
					<button type="button" aria-haspopup="true" v-bind:aria-expanded="toggledMore ? 'true' : 'false'">More &vellip;</button>
					<ul v-bind:style="{visibility: toggledMore ? 'visible' : 'hidden'}" id="mc-more-geogs" class="more-geographies-list">
						<li v-for="(item, index) in items" v-if="'more' === item.nav" v-bind:id="'geo_li_'+item.geo_key">
							<input type="radio" v-bind:id="'ecpp_'+item.geo_key" class="visuallyhidden" name="geography_type" v-bind:checked="0 === index" v-bind:value="index" autocomplete="off" v-model="selectedGeography"><label v-bind:for="'ecpp_'+item.geo_key">{{item.layer_name}}</label>
						</li>
					</ul>
				</li>
			</ul>
		</fieldset>
	</div>

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
			  {{item.label}} <span class="icon-cross"></span>
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

