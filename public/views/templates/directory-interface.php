<div>
	<?php // Location selector: map and address search box ?>
	<div class="atm-my-community-location-select">
		<div id="choose-my-community-map" class="leaflet-map"></div>
		<form id="address-search-form">
			<div class="input-group">
				<input id="address-input" type="text" value="" class="form-control" placeholder="Find a location..." />
				<input type="submit" name="submit-address">
			</div>
		</div>
	</div>
	<?php // Geography item list output ?>
	<div id="atm-directory-list">
		<directory-item
			v-for="location in locations"
			v-bind:location="location"
			v-bind:key="location.geoid"
			v-bind:id="location.geoid"
		></directory-item>
	</div>
</div>
