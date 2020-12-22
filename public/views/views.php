<?php
/**
 * All Things Missouri My Community Component
 *
 * @package   ATM_My_Community_Component
 * @author    dcavins
 * @license   GPL-2.0+
 * @link      https://engagementnetwork.org
 * @copyright 2018 CARES Network
 */

namespace ATM_My_Community\Public_Facing\Views;

/**
 * Output html for the geography chooser/list interface.
 *
 * @since   1.0.0
 *
 * @param   ... Add description of possible params here.
 *
 * @return  html The pane.
 */
function my_community_shortcode( $atts, $content ) {
	$a = shortcode_atts( array(
		'style' => '',
		), $atts );

	/**
	 * We're rendering the shortcode, so update the option that tracks
	 * which page this shortcode appears on.
	 * Note that this only makes sense if the shortcode is used in page content,
	 * not posts or BuddyPress group pages or widgets.
	 */
	$enqueue_on_pages = get_option( 'atm-my-community-report-pages' );
	$current_page_id  = get_the_ID(); // This assumes that the loop hasn't been polluted.
	if ( $current_page_id
		&& ( false === $enqueue_on_pages || ! in_array( $current_page_id, (array) $enqueue_on_pages ) ) ) {
		if ( ! is_array( $enqueue_on_pages ) ) {
			$enqueue_on_pages = array( $current_page_id );
		} else {
			$enqueue_on_pages[] = $current_page_id;
		}
		update_option( 'atm-my-community-report-pages', $enqueue_on_pages );
	}

	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		// Load development versions of scripts for easier debugging.
		wp_register_script( 'vue-js', 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.js', array(), null, true );
		wp_register_script( 'leaflet', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet-src.js', array(), '1.3.1', true );
	} else {
		// Load production versions.
		wp_register_script( 'vue-js', 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.min.js', array(), null, true );
		wp_register_script( 'leaflet', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js', array(), '1.3.1', true );
	}

	// ESRI add-ons for Leaflet.
	wp_register_script( 'esri-leaflet-script', 'https://unpkg.com/esri-leaflet@2.1.0/dist/esri-leaflet.js', array( 'jquery', 'leaflet' ), null, true );
	wp_register_script( 'esri-leaflet-geocoder-script', 'https://unpkg.com/esri-leaflet-geocoder@2.2.8/dist/esri-leaflet-geocoder-debug.js', array( 'leaflet', 'esri-leaflet-script' ), null, true);

	// This is the main script that builds the interface and handles user interaction.
	$base_dir = \ATM_My_Community\get_plugin_base_path();
	$base_uri = \ATM_My_Community\get_plugin_base_uri();
	wp_enqueue_script(
		'atm-front-end-content-builder',
		$base_uri . 'public/js/front-end-content-builder.js',
		array( 'jquery', 'vue-js', 'esri-leaflet-geocoder-script' ),
		filemtime( $base_dir . 'public/js/front-end-content-builder.js' ),
		true
	);

	if ( false && defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		$api_endpoint = 'https://servicesdev.engagementnetwork.org/';
	} else {
		$api_endpoint = 'https://services.engagementnetwork.org/';
	}

	wp_localize_script(
		'atm-front-end-content-builder',
		'publicMccVars',
		array(
			'apiBaseUrl' => $api_endpoint,
			'crosswalkEndpoint' => 'api-extension/v1/atm/crosswalk',
		)
	);

	$templates = new MU_My_Community_Template_Loader;

	ob_start();

	$templates->get_template_part( 'directory-interface' );
	$templates->get_template_part( 'directory-item' );

	return ob_get_clean();
}
add_shortcode( 'cares-atm-my-community', __NAMESPACE__ . '\\my_community_shortcode' );
