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

/*
function spam_lyric() 
{
	$lyrics = "In the ning nang nong
where the cows go bong.";

	// Here we split it into lines
	$lyrics = explode( "\n", $lyrics );

	// And then randomly choose a line
	return wptexturize( $lyrics[ mt_rand( 0, count( $lyrics ) - 1 ) ] );
}

// This just echoes the chosen line, we'll position it later
function molpress() 
{
	$chosen = spam_lyric();
	echo "<p id='molpress'>$chosen</p>";
}

// Now we set that function up to execute when the admin_notices action is called
add_action( 'admin_notices', 'molpress' );
*/

// We need some CSS to position the paragraph
function molpress_css() 
{
	## !! update this...

	// This makes sure that the positioning is also good for right-to-left languages
	$x = is_rtl() ? 'left' : 'right';

	/*echo "
	<style type='text/css'>
	#dolly {
		float: $x;
		padding-$x: 15px;
		padding-top: 5px;		
		margin: 0;
		font-size: 11px;
	}
	</style>
	";*/
}

$watermark = 0;

function molpress_shortcode_molecule($atts = [], $content = null, $tag = '')
{
    global $watermark;

    // normalize attribute keys, lowercase
    // nah
    //$atts = array_change_key_case((array)$atts, CASE_LOWER);
 
    // override default attributes with user attributes
    #$wporg_atts = shortcode_atts([
    #                                 'title' => 'WordPress.org',
    #                             ], $atts, $tag);
 
    // start output
    $o = '';
 
    // start box
    $watermark++;
    $id = 'molecule' . $watermark;
    $o .= '<span id="' . $id . '" style="display: none;">';
 
    if (!is_null($content))
    {
    	$o .= '<pre>' . $content . '</pre>';
    }
 
    // end box
    $o .= '</span>';
    $o .= '<script>var $; if (!$) $ = jQuery; $(document).ready(function($) {molpress_RenderMolecule("' . $id . '",' . json_encode($atts) . ');});</script>';
 
    // return output
    return $o;
}

function molpress_shortcode_init()
{
    add_shortcode('molecule', 'molpress_shortcode_molecule');
}

wp_enqueue_script('webmolkit1', plugin_dir_url(__FILE__) . 'webmolkit-build.js');
wp_enqueue_script('webmolkit2', plugin_dir_url(__FILE__) . 'molpress.js');

add_action( 'admin_head', 'molpress_css' );
add_action( 'init', 'molpress_shortcode_init' );

?>
