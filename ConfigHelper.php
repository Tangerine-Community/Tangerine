<?php
/**
 * Gives easy methods to figure out what URLs to reference.
 */
class ConfigHelper
{

	public function __construct()
	{

		$this->config = new Config();

	}

	public function user_doc_name( $name = "")
	{
		return "org.couchdb.user:" . $name;
	}

	public function user_doc_url( $name = "", $server_handle = null)
	{
		return doc_url( $this->user_doc_name( $name ), "_users", $server_handle );
	}

	public function deleted_db_name( $name = "" )
	{
		date_default_timezone_set( 'America/New_York' );
		return "deleted-" . $this->config->GROUP_PREFIX . $name . "-" . date( "Ymd-Hi" );
	}

	public function doc_url( $doc_name = "", $db_name = "", $server_handle = null, $admin = false )
	{
		return $this->path_join( $this->db_url( $db_name, $server_handle, $admin ), $doc_name );
	}

	public function group_doc_url( $doc_name = "", $db_name = "", $server_handle = null, $admin = false )
	{
		return $this->path_join( $this->group_db_url( $db_name, $server_handle, $admin ), $doc_name );
	}

	public function db_url( $db_name = "", $server_handle = null, $admin = false )
	{
		return $this->path_join( $this->get_host( $server_handle, $admin ), $db_name );
	}

	public function group_db_name( $group_name = "", $server_handle = null )
	{
		$prefix = ( strstr( $server_handle, "backup" ) ) ? $this->config->BACKUP_PREFIX : $this->config->GROUP_PREFIX;
		return $prefix . $group_name;
	}

	public function group_db_url( $group_name = "", $server_handle = null, $admin = false )
	{
		return $this->path_join( $this->get_host( $server_handle, $admin ), $this->group_db_name( $group_name, $server_handle ) );
	}

	public function get_host( $server_handle = "", $admin = false )
	{

		if ( ! isset( $this->config->SERVERS[$server_handle] ) ) throw new InvalidArgumentException('Server handle does not exist.');

		$user_pass = "";
		if ( $admin ) $user_pass = $this->config->ADMIN_U . ":" . $this->config->ADMIN_P . "@";

		$host = $this->HTTP . $user_pass . $this->config->SERVERS[$server_handle];

		// @faultpoint, this works because iriscouch uses port 80
		if ( $server_handle == "local" )
			$host .= ":" . $this->config->PORT;

		return $host;

	} // END of get_host

	/**
	 * Joins directories 
	 * @param arguments Takes all arguments and joins them.
	 * @return a string
	 * @author http://stackoverflow.com/questions/1091107/how-to-join-filesystem-path-strings-in-php
	 */
	private function path_join()
	{

		$args  = func_get_args();

		if ( count($args) == 0 ) return "";
		if ( count($args) == 1 ) return trim( $arg[0], '/' );

		$paths = array();

		foreach( $args  as $arg )
		{
			if ( ! is_string($arg) ) throw new InvalidArgumentException("Path must consist of strings.");
			$paths = array_merge( $paths, (array) $arg );
		}

		foreach( $paths as &$path ) $path = trim( $path, '/' );

		$paths = array_filter( $paths ); // remove empty elements from the array

		// make sure if the path was originally an absolute path that it is kept that way
		if ( substr( $args[0], 0, 1 ) == '/' ) $paths[0] = '/' . $paths[0];

		return join( '/', $paths );

	} // END of path_join

}

?>
