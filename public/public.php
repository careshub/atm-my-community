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

namespace ATM_My_Community\Public_Facing;

// Load plugin text domain
add_action( 'init', __NAMESPACE__ . '\\load_plugin_textdomain' );

// Load public-facing style sheet and JavaScript.
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_styles_scripts' );

/**
 * Load the plugin text domain for translation.
 *
 * @since    1.0.0
 */
function load_plugin_textdomain() {
	$domain = 'cares-atm-my-community';
	$locale = apply_filters( 'plugin_locale', get_locale(), $domain );

	load_textdomain( $domain, trailingslashit( WP_LANG_DIR ) . $domain . '/' . $domain . '-' . $locale . '.mo' );
}

/**
 * Register and enqueue public-facing style sheet.
 *
 * @since    1.0.0
 */
function enqueue_styles_scripts() {

	// Is the shortcode used on this page?
	$enqueue_on_pages = get_option( 'atm-my-community-report-pages' );
	$current_page_id  = get_the_ID(); // This should work for any post type.
	if ( ! $enqueue_on_pages || ! in_array( $current_page_id, (array) $enqueue_on_pages ) ) {
		return;
	}

	// Common styles.
	$base_dir = \ATM_My_Community\get_plugin_base_path();
	$base_uri = \ATM_My_Community\get_plugin_base_uri();
	$pub_css = 'public/css/public.css';
	wp_enqueue_style(
		\ATM_My_Community\get_plugin_slug() . '-plugin-style',
		$base_uri . $pub_css,
		array(),
		filemtime( $base_dir . $pub_css ),
		'all' );

	// Leaflet styles
	wp_enqueue_style( 'leaflet-style', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css', array(), null, 'screen' );

	wp_enqueue_style( 'esri-leaflet-geocoder-style', 'https://unpkg.com/esri-leaflet-geocoder@2.2.8/dist/esri-leaflet-geocoder.css', array(), null, 'all' );
}
