<?php
/**
 * Gives easy methods to figure out what URLs to reference.
 */
class ConfigHelper
{

	public function __construct()
	{

		$this->constants = new Config();

		$c = $this->constants;

		if ( ! isset( $c->HTTP ) )          throw new LogicException('Config missing HTTP.');
		if ( ! isset( $c->ADMIN_U ) )       throw new LogicException('Config missing ADMIN_U.');
		if ( ! isset( $c->ADMIN_P ) )       throw new LogicException('Config missing ADMIN_P.');
		if ( ! isset( $c->SERVERS ) )       throw new LogicException('Config missing SERVERS.');
		if ( ! isset( $c->PORT ) )          throw new LogicException('Config missing PORT.');
		if ( ! isset( $c->TRUNK ) )         throw new LogicException('Config missing TRUNK.');
		if ( ! isset( $c->GROUP_PREFIX ) )  throw new LogicException('Config missing GROUP_PREFIX.');
		if ( ! isset( $c->BACKUP_PREFIX ) ) throw new LogicException('Config missing BACKUP_PREFIX.');
		if ( ! isset( $c->D_DOC ) )         throw new LogicException('Config missing D_DOC.');
		if ( ! isset( $c->APP_DOCS ) )      throw new LogicException('Config missing APP_DOCS.');

	}

	public function user_doc_name( $name = "")
	{
		return "org.couchdb.user:" . $name;
	}

	public function user_doc_url( $name = "", $server_handle = null)
	{
		return $this->doc_url( $this->user_doc_name( $name ), "_users", $server_handle );
	}

	public function deleted_db_name( $name = "" )
	{
		date_default_timezone_set( 'America/New_York' );
		return "deleted-" . $this->constants->GROUP_PREFIX . $name . "-" . date( "Ymd-Hi" );
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
		$prefix = ( strstr( $server_handle, "backup" ) ) ? $this->constants->BACKUP_PREFIX : $this->constants->GROUP_PREFIX;
		return $prefix . $group_name;
	}

	public function group_db_url( $group_name = "", $server_handle = null, $admin = false )
	{
		return $this->path_join( $this->get_host( $server_handle, $admin ), $this->group_db_name( $group_name, $server_handle ) );
	}

	public function get_host( $server_handle = "", $admin = false )
	{

		if ( ! isset( $this->constants->SERVERS[$server_handle] ) ) throw new InvalidArgumentException('Server handle does not exist.');

		$user_pass = "";
		if ( $admin ) $user_pass = $this->constants->ADMIN_U . ":" . $this->constants->ADMIN_P . "@";

		$host = $this->constants->HTTP . $user_pass . $this->constants->SERVERS[$server_handle];

		// @faultpoint, @setup, @todo, this works because iriscouch uses port 80
		if ( ! strstr( $this->constants->SERVERS[$server_handle], "iriscouch" ) )
			$host .= ":" . $this->constants->PORT;

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
