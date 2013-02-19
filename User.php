<?php

require_once( "./bootstrap.php" ); use \Httpful as h; // awesome http library

class User
{

	/**
	 * @var boolean True once user has been authenticated, false if failed and null if not checked.
	 */
	public $is_auth;

	/**
	 * @var string User name in plain text, Immutable.
	 */
	private $name;

	/**
	 * @var string password in plain text. Immutable.
	 */
	private $pass;

	/**
	 * @var Config A configuration object.
	 */
	private $config;

	/**
	 * @var array CouchDB _user doc.
	 */
	private $doc;

	/**
	 * @var boolean Allows this object to be manipulated without authentication.
	 */
	private $admin_mode;

	/**
	 * @var array List of groups
	 */
	private $groups;

	public function __construct( array $options = array() )
	{

		$this->config = new ConfigHelper();

		if (! isset( $options['admin'] ) )
		{
			$this->admin_mode = false;
			if ( ! isset( $options['name'] ) ) throw new InvalidArgumentException("Please supply a user name.");
			if ( ! isset( $options['pass'] ) ) throw new InvalidArgumentException("Please supply a password.");
		} else
		{
			$this->admin_mode = true;
			$options['pass']  = "";
		}

		$this->set_name( $options['name'] );
		$this->pass = $options['pass'];
		$this->groups = array();

		return $this;

	} // END of construct


	/**
	 * Sets the user's name, updates url and doc member variables.
	 * @param string $name user's name
	 * @return \User Returns User for chaining.
	 */
	private function set_name( $name )
	{

		$this->name = $name;

		return $this;

	} // END of set_name


	/**
	 * Simple accessor.
	 * @return string The name of the user. Null if not set.
	 */
	public function get_name()
	{
		if ( ! isset( $this->name ) ) throw new LogicException("User object has no name yet.");
		return $this->name;
	} // END of get_name

	/**
	 * Adds the group's name to the user's doc. If the user's doc has not been fetched, will attempt to read first.
	 */
	public function add_group( Group $group = null )
	{

		if ( $group == null ) throw new UnexpectedValueException("Please supply a group.");

		$group_name = $group->get_name();

		// If the doc is not there, add group.
		if ( ! isset( $this->doc ) )
		{
			try
			{
				$this->read();
			} catch ( Exception $e )
			{
				throw new Exception("Attempted to read user doc: " . $e);
			}
		}

		// Did the doc come through?
		if ( ! isset( $this->doc ) ) throw new Exception("Could not read user doc.");

		// Add it if it doesn't already in there
		if ( ! in_array( $group_name, $this->groups ) ) array_push( $this->groups, $group_name );

		$this->save();

		return $this->groups;

	} // END of add_group


	/**
	 * Adds the group's name to the user's doc. If the user's doc has not been fetched, will attempt to read first.
	 */
	public function remove_group( Group $group = null )
	{

		if ( $group == null ) throw new UnexpectedValueException("Please supply a group.");

		$group_name = $group->get_name();

		// If the doc is not there, add group.
		if ( ! isset( $this->doc ) )
		{
			try
			{
				$this->read();
			} catch ( Exception $e )
			{
				throw new Exception("Attempted to read user doc: " . $e);
			}
		}

		if ( ! isset( $this->doc ) ) throw new Exception("Could not read user doc.");

		$this->groups = Helpers::array_without( $group_name, $this->groups );

		$this->save();

		return $this->doc['groups'];

	} // END of remove_group

	public function is_authenticated()
	{
		return $this->is_auth;
	}

	/**
	 * Authenticates user's creds against Tangerine's user database.
	 *
	 * Persists success or fail in $this->is_auth
	 */
	public function authenticate()
	{

		$response_raw = h\Request::get( $this->config->user_doc_url( $this->name, "main" ) )
			->authenticateWith( $this->name, $this->pass )
			->sendsJson()
			->send();

		$response = json_decode( $response_raw, true );

		$this->is_auth = isset( $response['_id'] ) ? true : false;

		return $this->is_auth;

	} // END of authenticate


	/**
	 * Reads the User's doc from the Tangerine database.
	 */
	public function read()
	{

		$con = $this->config;

		$response_raw = h\Request::get( $con->user_doc_url( $this->name, "main" ) )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->sendsJson()
			->send();

		$response = json_decode( $response_raw, true );

		// blank out member variables
		$this->doc     = null;
		$this->is_auth = false;
		$this->groups  = array();

		// fill member variables on success
		if ( ! isset( $response['error'] ) )
		{
			$this->groups  = isset( $response['groups'] ) ? $response['groups'] : array();
			$this->doc     = $response;
			$this->is_auth = true;
		}

		return $response;

	} // END of read



	/**
	 * Creates a user in the _user database.
	 */
	public function save()
	{

		$con = $this->config;

		// Prepare doc
		$new_fields = array(
			"_id"      => $con->user_doc_name( $this->name ),
			"name"     => $this->name,
			"groups"   => $this->groups,
			"type"     => "user",
			"roles"    => array()
		);

		if ( $this->admin_mode == false ) $new_fields['password'] = $this->pass;

		// If we've already loaded a doc, then update it.
		if ( isset( $this->doc['_rev'] ) )
		{

			$old_doc = $this->doc;

			foreach ( $new_fields as $field_key => $field_value )
				$old_doc[$field_key] = $field_value;

			$new_doc = $old_doc;

			$response = h\Request::put( $con->user_doc_url( $this->name, "main" ) )
				->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
				->sendsJson()
				->body( json_encode( $new_doc ) )
				->send();

		} else
		{ // otherwise, make a new doc

			$new_doc = $new_fields;

			$response = h\Request::put( $con->user_doc_url( $this->name, "main" ) )
				->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
				->sendsJson()
				->body( json_encode( $new_doc ) )
				->send();

		}

		return json_decode( $response, true );

	} // END of save


	/**
	 * Removes user from _users database 
	 * @return associative array of the Httpful response
	 */	
	public function destroy ()
	{

		$con = $this->config;

		$this->read();

		$rev = "?rev=" . $this->doc["_rev"];

		$delete_response = h\Request::delete( $con->user_doc_url( $$this->name, "main" ) . $rev )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->send();

		return json_decode( $delete_response, true);

	} // END of destroy_user

}

?>