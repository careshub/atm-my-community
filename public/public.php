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
	// Common styles.
	wp_enqueue_style( \ATM_My_Community\get_plugin_slug() . '-plugin-style', plugins_url( 'css/public.css', __FILE__ ), array(), \ATM_My_Community\get_plugin_version(), 'all' );

	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		// Load development versions of scripts for easier debugging.
		wp_register_script( 'vue-js', 'https://cdn.jsdelivr.net/npm/vue/dist/vue.js', array(), '2.5.16', true );
		wp_register_script( 'leaflet', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet-src.js', array(), '1.3.1', true );
	} else {
		// Load production versions.
		wp_register_script( 'vue-js', 'https://cdn.jsdelivr.net/npm/vue', array(), '2.5.16', true );
		wp_register_script( 'leaflet', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js', array(), '1.3.1', true );
	}

	// Helper for setting and getting cookies using JS.
	wp_register_script( 'js-cookie', "https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js", array(), '2.2.0', true );

	// Leaflet styles
	wp_enqueue_style( 'leaflet-style', 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css', array(), '1.3.1', 'screen' );

	// ESRI add-ons for Leaflet.
	wp_register_script( 'esri-leaflet-script', 'https://unpkg.com/esri-leaflet@2.1.0/dist/esri-leaflet.js', array( 'jquery', 'leaflet' ), '2.1.0');
	wp_register_script( 'esri-leaflet-geocoder-script', 'https://unpkg.com/esri-leaflet-geocoder@2.2.8/dist/esri-leaflet-geocoder-debug.js', array( 'leaflet', 'esri-leaflet-script' ), '2.2.8');
	wp_enqueue_style( 'esri-leaflet-geocoder-style', 'https://unpkg.com/esri-leaflet-geocoder@2.2.8/dist/esri-leaflet-geocoder.css', array(), '2.2.8', 'all' );

	// This is the main script that builds the interface and handles user interaction.
	wp_register_script( 'atm-front-end-content-builder', plugins_url( 'js/front-end-content-builder.js', __FILE__ ) , array( 'jquery', 'vue-js', 'js-cookie', 'esri-leaflet-geocoder-script' ), \ATM_My_Community\get_plugin_version(), true );

	if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
		$api_endpoint = 'https://servicesdev.engagementnetwork.org/';
	} else {
		$api_endpoint = 'https://services.engagementnetwork.org/';
	}

	wp_localize_script(
		'atm-front-end-content-builder',
		'publicMccVars',
		array(
			'apiBase' => $api_endpoint,
			'crosswalkEndpoint' => 'api-extension/v1/atm/crosswalk',
		)
	);
}
