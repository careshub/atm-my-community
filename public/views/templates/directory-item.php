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
							<li class="area district-data-detail district-data-level-1 icon-location" v-if="entry.area">{{entry.area}}</li>
							<li class="population district-data-detail district-data-level-1 icon-users" v-if="entry.population">Population: {{entry.population}}</li>
							<li class="students district-data-detail district-data-level-1 icon-bell" v-if="entry.students">Public School Enrollment: {{entry.students}}</li>
							<li class="pct-area district-data-detail district-data-level-1 icon-stats-bars2" v-if="entry.pct_area">Area of your community within {{entry.name}}: {{entry.pct_area}}%</li>
							<li class="pct-population district-data-detail district-data-level-1 icon-stats-bars2" v-if="entry.pct_population">Population of your community within {{entry.name}}: {{entry.pct_population}}%</li>
							<li class="contacts district-data-detail district-data-level-1" v-if="entry.contacts">
								<ul>
									<li class="contact-vcard" v-for="contact in entry.contacts">
										<ul class="icon-address-book">
											<li class="name district-data-detail" v-if="contact.name">{{contact.name}}<span class="party-affiliation" v-if="contact.party"> &ndash; {{contact.party}}</span></li>
											<li class="title district-data-detail" v-if="contact.title">{{contact.title}}</li>
											<li class="address district-data-detail" v-if="contact.address">{{contact.address}}</li>
											<li class="phone district-data-detail" v-if="contact.phone">{{contact.phone}}</li>
											<li class="email district-data-detail" v-if="contact.email"><a v-bind:href="'mailto:' + contact.email">{{contact.email}}</a></li>
											<li class="website district-data-detail" v-if="contact.website"><a v-bind:href="contact.website" target="_blank">{{contact.website}}</a></li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</section>
</script>
