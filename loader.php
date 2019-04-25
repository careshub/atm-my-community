<?php
/**
 * @package ATM_My_Community_Component
 * @wordpress-plugin
 * Plugin Name:       All Things Missouri My Community Component
 * Version:           1.0.0
 * Description:       Fetches geographic entities for user-selected point.
 * Author:            dcavins
 * Text Domain:       cares-atm-my-community
 * Domain Path:       /languages
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: https://github.com/careshub/atm-my-community
 * @copyright 2018 CARES, University of Missouri
 */

namespace ATM_My_Community;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/*----------------------------------------------------------------------------*
 * Public-Facing Functionality
 *----------------------------------------------------------------------------*/

$basepath = plugin_dir_path( __FILE__ );

// The main class
require_once( $basepath . 'public/public.php' );

// The shortcode handlers and template loaders.
require_once( $basepath . 'public/views/class-gamajo-template-loader.php' );
require_once( $basepath . 'public/views/class-my-community-template-loader.php' );
require_once( $basepath . 'public/views/views.php' );

/**
 * Helper function.
 * @return Fully-qualified URI to the root of the plugin.
 */
function get_plugin_base_uri() {
	return plugin_dir_url( __FILE__ );
}

/**
 * Helper function.
 * @return Fully-qualified URI to the root of the plugin.
 */
function get_plugin_base_path() {
	return trailingslashit( dirname( __FILE__ ) );
}

/**
 * Helper function.
 * @return string Slug for the plugin.
 */
function get_plugin_slug() {
	return 'atm-my-community';
}

/**
 * Helper function.
 * @TODO: Update this when you update the plugin's version above.
 *
 * @return string Current version of plugin.
 */
function get_plugin_version() {
	return '1.0.2';
}
