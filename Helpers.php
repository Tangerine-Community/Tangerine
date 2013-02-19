<?php

/**
 * Easymakers
 */
class Helpers
{


	/**
	 * Take an attempt report and respond in JSON
	 * @param Attempt the result of some action to communicate.
	 */
	public function respond_json( $attempt )
	{
		header( 'Access-Control-Allow-Origin: *' );
		header( 'Access-Control-Allow-Methods: HEAD, POST, GET, OPTIONS' );
		header( 'Access-Control-Max-Age: 10000' );
		header( 'Access-Control-Allow-Headers: *' );
		header( 'Content-type: application/json' );
		echo $attempt->toJson();
	}


	/*
	 * Get a post variable
	 */
	public function get_variable( $key = '' )
	{
		return isset( $_POST[$key] ) ? $_POST[$key] : null;
	}


	/**
	 * Helper function throws an 
	 */
	public function require_variable( $key = null, $human_name = null )
	{

		if ( $key        == null ) throw new InvalidArgumentException("You wanted _what_ variable now?");
		if ( $human_name == null ) throw new InvalidArgumentException("I give error messages, I need to know what the humans would call it if it was missing.");

		// success
		if ( isset( $_POST[$key] ) ) return $_POST[$key];

		// fail
		Helpers::respond_json( new Attempt( 'error', "Please provide $human_name." ) );
		die();
	}


	/**
	 * Returns only pure hay.
	 */
	public function array_without( $needle, array $haystack )
	{

		$needles = is_array( $needle ) ? $needle : array( $needle );

		$result = array();

		foreach ( $haystack as $straw )
			if ( ! in_array( $straw, $needles ) ) // worst self documenting code ever: in_array( $needle, $haystack )
				array_push( $result, $straw );

		return $result;
	}


	/*
	 * Returns a password based on a characterset
	 */
	public function calc_password( $length = 10 )
	{
		$result = "";
		while ($length--) { $result .= array_rand( array_flip( str_split( "abcdefghijklmnopqrstuvwxyz" ) ) ); }; 
		return $result;
	} // END of calcPassword


	/**
	 * Makes strings safe for most purposes.
	 *
	 * Removes non-alphanumerics, converts whitespace to underscores.
	 *
	 * @param string $value Potentially hazardous string.
	 * @return string Safe string.
	 */
	public function safety_dance( $value )
	{
		$result = $value;
		$result = preg_replace('/[^a-zA-Z0-9_]/', "", $result);
		$result = preg_replace('/\s/', "_", $result);
		return $result;
	}


}


?>