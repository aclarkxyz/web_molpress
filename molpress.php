<?php
/**
 * @package MolPress
 * @version 0.1
 */
/*
Plugin Name: MolPress
Plugin URI: http://molmatinf.com
Description: Adds chemical structure datatypes to WordPress, starting with molecules.
Author: Alex M. Clark
Version: 0.1
Author URI: http://cheminf20.org
*/

$watermark = 0;

function molpress_shortcode_molecule($atts = [], $content = null, $tag = '')
{
    global $watermark;
    $watermark++;

    $o = '';
    $id = 'molecule' . $watermark;
    $o .= '<span id="' . $id . '" style="display: none;">';
 
    if (!is_null($content)) $o .= '<pre>' . $content . '</pre>';

    $o .= '</span>';
    $o .= '<script>var $; if (!$) $ = jQuery; $(document).ready(function($) {molpress_RenderMolecule("' . $id . '",' . json_encode($atts) . ');});</script>';
 
    return $o;
}

function molpress_shortcode_reaction($atts = [], $content = null, $tag = '')
{
    global $watermark;
    $watermark++;

    $o = '';
    $id = 'reaction' . $watermark;
    $o .= '<span id="' . $id . '" style="display: none;">';
 
    if (!is_null($content)) $o .= '<pre>' . $content . '</pre>';

    $o .= '</span>';
    $o .= '<script>var $; if (!$) $ = jQuery; $(document).ready(function($) {molpress_RenderReaction("' . $id . '",' . json_encode($atts) . ');});</script>';
 
    return $o;
}

function molpress_shortcode_collection($atts = [], $content = null, $tag = '')
{
    global $watermark;
    $watermark++;

    $o = '';
    $id = 'collection' . $watermark;
    $o .= '<span id="' . $id . '" style="display: none;">';
 
    if (!is_null($content)) $o .= '<script type="text/xml">' . $content . '</script>';

    $o .= '</span>';
    $o .= '<script>var $; if (!$) $ = jQuery; $(document).ready(function($) {molpress_RenderCollection("' . $id . '",' . json_encode($atts) . ');});</script>';
 
    return $o;
}

function molpress_init()
{
    wp_enqueue_script('webmolkit1', plugin_dir_url(__FILE__) . 'bin/webmolkit-build.js');
    wp_enqueue_script('webmolkit2', plugin_dir_url(__FILE__) . 'molpress.js');

    wp_enqueue_style('molpress_widgets',  plugin_dir_url(__FILE__) . 'res/widgets.css', false, '1.0.0', 'all');

    add_shortcode('molecule', 'molpress_shortcode_molecule');
    add_shortcode('reaction', 'molpress_shortcode_reaction');
    add_shortcode('collection', 'molpress_shortcode_collection');

    if ((current_user_can('edit_posts') || current_user_can('edit_pages')) /*&& get_user_option('rich_editing') == 'true'*/)
    {
        add_filter('mce_external_plugins', 'molpress_add_plugin');
        add_filter('mce_buttons', 'molpress_register_button');
    }
}

function molpress_add_plugin($plugin_array) 
{
    $plugin_array['molpress_plugin'] = plugin_dir_url(__FILE__) . '/molpress.js';
    return $plugin_array;
}

function molpress_register_button($buttons ) 
{
    array_push($buttons, 'molpress_molecule_button');
    array_push($buttons, 'molpress_reaction_button');
    return $buttons;
}

function molpress_mime_types($mime_types)
{
    $mime_types['svg'] = 'image/svg+xml';
    $mime_types['el'] = 'chemical/x-sketchel'; 
    $mime_types['mol'] = 'chemical/x-mdl-molfile'; 
    $mime_types['ds'] = 'chemical/x-datasheet'; 
    $mime_types['sdf'] = 'chemical/x-mdl-sdfile'; 
    return $mime_types;
}

add_action('init', 'molpress_init');

add_filter('upload_mimes', 'molpress_mime_types', 1, 1);

?>
