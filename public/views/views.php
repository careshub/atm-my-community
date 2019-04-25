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

	// Enqueue Script that runs this screen.
	wp_enqueue_script( 'atm-front-end-content-builder' );

	$templates = new MU_My_Community_Template_Loader;

	ob_start();

	$templates->get_template_part( 'directory-interface' );
	$templates->get_template_part( 'directory-item' );

	return ob_get_clean();
}
add_shortcode( 'cares-atm-my-community', __NAMESPACE__ . '\\my_community_shortcode' );
