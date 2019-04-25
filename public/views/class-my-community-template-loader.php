<?php
/**
 * Template Loader for Plugins.
 *
 * @package   Gamajo_Template_Loader
 * @author    Gary Jones
 * @link      http://github.com/GaryJones/Gamajo-Template-Loader
 * @copyright 2013 Gary Jones
 * @license   GPL-2.0+
 * @version   1.3.0
 */
namespace ATM_My_Community\Public_Facing\Views;

/**
 * Template loader.
 *
 * Originally based on functions in Easy Digital Downloads (thanks Pippin!).
 *
 * When using in a plugin, create a new class that extends this one and just overrides the properties.
 *
 * @package Gamajo_Template_Loader
 * @author  Gary Jones
 */
class MU_My_Community_Template_Loader extends \Gamajo_Template_Loader {
	/**
	 * Prefix for filter names.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $filter_prefix = 'atm_my_community';

	/**
	 * Directory name where custom templates for this plugin should be found in the theme.
	 *
	 * For example: 'your-plugin-templates'.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $theme_template_directory = 'atm-my-community-templates';

	/**
	 * Reference to the root directory path of this plugin.
	 *
	 * Can either be a defined constant, or a relative reference from where the subclass lives.
	 *
	 * e.g. YOUR_PLUGIN_TEMPLATE or plugin_dir_path( dirname( __FILE__ ) ); etc.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	protected $plugin_directory = '';

	/**
	 * Clean up template data.
	 *
	 * @since 1.2.0
	 */
	public function __construct() {
		$this->plugin_directory = \ATM_My_Community\get_plugin_base_path() . 'public/views/';
	}

}
