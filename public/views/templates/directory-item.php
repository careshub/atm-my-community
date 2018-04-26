<script type="text/x-template" id="directory-item-template">
<section>
	<h3 class="district-type">{{location.district_type}}</h3>
	<div class="Grid Grid--guttersXl Grid--full med-Grid--fit">
		<div class="Grid-cell u-1of3">
			<div class="cell-liner district_map_container">
				<img v-for="layer in location.map_url" v-bind:src="layer">
			</div>
		</div>
		<div class="Grid-cell">
			<div class="cell-liner">
			    <ul class="district-data-items">
					<li v-for="entry in location.district_data">
						<h4 class="district-name">{{entry.name}}</h4>
						<ul>
							<li class="area" v-if="entry.area"><span class="icon-location"></span>{{entry.area}}</li>
							<li class="population district-data-detail" v-if="entry.population"><span class="icon-users"></span>Population: {{entry.population}}</li>
							<li class="students district-data-detail" v-if="entry.students"><span class="icon-rocket"></span>Students: {{entry.students}}</li>
							<li class="representative-details" v-if="entry.representative">
								<ul>
									<li class="representative district-data-detail" ><span class="icon-address-book"></span>{{entry.representative}}<span class="party-affiliation" v-if="entry.party"> &ndash; {{entry.party}}</span></li>
									<li class="address district-data-detail" v-if="entry.address">{{entry.address}}</li>
									<li class="phone district-data-detail" v-if="entry.phone">{{entry.phone}}</li>
									<li class="website district-data-detail" v-if="entry.website">{{entry.website}}</li>
								</ul>
							</li>
							<li class="percentage-charts">
								<div class="Grid Grid--guttersXl Grid--full med-Grid--fit">
									<div class="Grid-cell" v-if="entry.pct_area">
										<div class="cell-liner pie-chart-container pct_area_container" v-bind:id="'pie-chart-area-' + entry.geoid" v-bind:data-chart-series="entry.name + ':' + entry.pct_area + ',Area not in ' + entry.name +  ':' + ( 100 - entry.pct_area )" v-bind:data-chart-title="'Percent of Area in ' + entry.name + ' Within Selected Area'"></div>
									</div>
									<div class="Grid-cell" v-if="entry.pct_population">
										<div class="cell-liner pie-chart-container pct_pop_container" v-bind:id="'pie-chart-pop-' + entry.geoid" v-bind:data-chart-series="entry.name + ':' + entry.pct_population + ',Area not in ' + entry.name +  ':' + ( 100 - entry.pct_population )" v-bind:data-chart-title="'Percent of Population in ' + entry.name + ' Within Selected Area'"></div>
									</div>
								</div>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</section>
</script>
