<?php

require_once( "./httpful-0.2.0.phar" ); use \Httpful as h; // awesome http library

/**
 * Handles all Tangerine-group level interactions.
 *
 * Interfaces with Users.
 *
 *
 */
class Group
{

	/**
	 * @var string The name of this group, without any prefixes or url information.
	 */
	private $name;

	/**
	 * @var array List of all user names who are admins as gleaned from the security doc.
	 *
	 * This variable is not a verified list, nor is it an array of User objects.
	 */
	private $admins;

	/**
	 * @var array List of all user names who are readers as gleaned from the security doc.
	 *
	 * This variable is not a verified list, nor is it an array of User objects.
	 */
	private $readers;

	/**
	 * @var boolean True if group exists, false if not, null if unknown.
	 */
	private $isExtant;


	/**
	 * @var string Name of group database.
	 */
	private $group_db;


	/**
	 * @var $name
	 */
	private $group_db_url;


	/**
	 * @var string URL for group's security doc. Updated by Group::set_name()
	 */
	private $security_doc_url;


	/**
	 * @var Config configuration object
	 */
	private $config;


	/**
	 * Constructor, _soft-overloaded._
	 * if name set, will attempt to fetch.
	 *   if successful, will simply read.
	 */
	public function __construct( $options = array() )
	{

		$this->config = new Config();
		$this->isExtant = null;

		if ( isset( $options['name'] ) )
		{
			$this->set_name( $options['name'] );
			try
			{
				$this->read();
			} catch ( Exception $e )
			{
				$this->isExtant = false;
			}
		}


	} // END of __construct


	/**
	 * Mildly sanitizes name's characters and updates the member variables for url and doc.
	 * @param string $name
	 * @return \Group for quick chaining
	 */
	public function set_name ( $name )
	{

		$this->name = Helpers::safety_dance($name);

		$this->group_db         = $this->config->GROUP_PREFIX     . $this->name;
		$this->group_db_url     = $this->config->GROUP_PREFIX_URL . $this->name;
		$this->security_doc_url = $this->group_db_url . "/" . $this->config->SECURITY;

		return $this;

	} // END of set_name

	/**
	 * Simple accessor.
	 * @return string The name of the group.
	 */
	public function get_name()
	{
		return $this->name;
	}
	

	/**
	 * Attempt to create the group.
	 * @return array Parsed json response from group's database.
	 */
	public function read()
	{

		$response = h\Request::get( $this->group_db_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();

		if ($response->code == 200)
		{
			$this->isExtant = true;
		} else
		{
			throw new RuntimeException( $this->name . " group does not exist." );
		}
		
		return json_decode( $response, true );

	}


	/**
	 * Creates a group by adding an array element to the _user's doc and
	 * by creating another database with replicated tangerine docs.
	 * @throws RuntimeException for couchdb errors
	 * @return 
	 */
	public function create()
	{

		$put_response = h\Request::put( $this->group_db_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();

		$response = json_decode( $put_response , true );

		// If any error comes back from 
		if ( isset( $response['error'] ) ) 
		{ // Specific errors
			if ( $response['error'] == 'file_exists')
			{
				throw new RuntimeException( "Group already exists." );
			} else
			{
				throw new RuntimeException( "CouchDB said: ". $response['error'] );
			}
		}

		return $response;

	} // END of create


	/**
	 * Replicates design docs from tangerine trunk to the current group db.
	 * Will create them if not there.
	 */
	public function upgrade()
	{

		$data = json_encode( array(
			"source" => $this->config->TRUNK,
			"target" => $this->group_db,
			"doc_ids" => explode( "\n", $this->config->APP_DOCS )
		));

		$post_response = h\Request::post( $this->config->REPLICATE_URL )
			->sendsJson()
			->body( $data )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();

		return json_decode( $post_response, true );

	} // END of update_design_docs


	/**
	 * Completely deletes a database, on $user's word.
	 */
	public function destroy( User $user = null)
	{

		// assert non-null user
		if ( $user == null ) throw new InvalidArgumentException('Method requires an user.');

		// assert admin user
		$security_doc = $this->get_security_doc();
		if ( ! in_array( $user->get_name(), $security_doc['admins']['names'] ) )
			throw new InvalidArgumentException('User must be group admin.');

		/*
		 * Your papers check out sir, deleting database.
		 */

		// stash a copy
		$post_response = h\Request::post( $this->config->REPLICATE_URL )
			->sendsJson()
			->body( json_encode( array(
				"source" => $this->group_db,
				"target" => $this->config->SERVER_URL . "deleted-" . $this->config->GROUP_PREFIX . $this->name,
				"create_target" => true )))
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();

		$delete_response_raw = h\Request::delete( $this->group_db_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();

		$delete_response = json_decode( $delete_response_raw, true );

		if ( ! isset( $delete_response['error'] ) )
		{
			$this->isExtant = false;
			$user_categories = array(
				$security_doc['admins']['names'],
				$security_doc['members']['names']
			);

			foreach ( $user_categories as $category )
				foreach ( $category as $user )
				{
					$user = new User( array( "name" => $admin, "admin" => true ));
					$user->remove_group( $this );
				}

		}

		return $delete_response;

	} // END of update_design_docs


	/**
	 * Adds an admin user to a group's database's security doc.
	 * Secretly also adds them to the reader/members list.
	 * @param $user User to be added to the group as an admin.
	 * @return the response 
	 */
	public function add_admin( User $user = null )
	{

		if ( $user == null ) throw new UnexpectedValueException("User must be provided.");

		$user_name = $user->get_name();

		// Get original security doc
		$old_doc = $this->get_security_doc();

		// If they're already there, throw an exception
		if ( in_array( $user_name, $old_doc['admins']['names'] ) ) throw new Exception( $user_name . " is already an admin in " . $this->name . "." );

		// add them
		array_push( $old_doc['admins']['names'], $user_name );


		$new_doc = $old_doc;

		// Send
		$put_response_raw = h\Request::put( $this->security_doc_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->body( json_encode( $new_doc ) )
			->send();

		$put_response = json_decode( $put_response_raw, true );

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) ) $user->add_group( $this );

		return $put_response;

	} // END of add_admin


	/**
	 * Removes an admin user from a group's database's security doc.
	 */
	public function remove_admin( User $user = null )
	{

		// Assert specified user.
		if ( $user == null ) throw new InvalidArgumentException( "No user specified." );

		$user_name = $user->get_name();

		$old_doc = $this->get_security_doc();

		// Assertions: two or more admins, one of which is specified.

		if ( ! in_array( $user_name, $old_doc['admins']['names'] ) )
			throw new InvalidArgumentException("User is not an administrator.");

		if ( count($old_doc['admins']['names']) <= 1)
			throw new UnderflowException("Group must have at least one admin.");

		// Update security doc
		$new_doc = $old_doc;
		if ( in_array( $user_name, $new_doc['admins']['names'] ) )
			$new_doc['admins']['names'] = Helpers::array_without( $user_name, $new_doc['admins']['names'] );


		// Send request
		$put_response_raw = h\Request::put( $this->security_doc_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->body( json_encode( $new_doc ) )
			->send();

		$put_response = json_decode( $put_response_raw, true );

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) )
		{
			// only remove the group from the user's group list, if they're neither an admin nor reader.
			if ( ! ( in_array( $user_name, $new_doc['admins']['names'] ) || in_array( $user_name, $new_doc['members']['names'] ) ) )
				$user->remove_group( $this );
		}

		// return
		return $put_response;

	} // END of remove_admin_from_group


	/**
	 * Adds a reader to the group's security doc.
	 * @return associative array of the Httpful response
	 */
	public function add_reader( User $user = null )
	{

		if ($user == null)  throw new UnexpectedValueException( "No user required." );

		$user_name = $user->get_name();

		// Get original security doc
		$old_doc = $this->get_security_doc();

		// If they're already there, throw an exception
		if ( in_array( $user_name, $old_doc['members']['names'] ) ) throw new Exception( $user_name . " is already a reader in " . $this->name . "." );

		// add them
		array_push( $old_doc['members']['names'], $user_name );

		$new_doc = $old_doc;

		// Send
		$put_response_raw = h\Request::put( $this->security_doc_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->body( json_encode( $new_doc ) )
			->send();

		$put_response = json_decode( $put_response_raw, true );

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) ) $user->add_group( $this );

		return $put_response;

	} // END of add_reader


	/**
	 * Removes reader from the group's security doc.
	 * Note: will not remove last reader. That would make it a reader party.
	 * @return associative array of the Httpful response
	 */
	public function remove_reader( User $user = null, $backup_user = null )
	{

		// Assert specified user.
		if ( $user == null ) throw new InvalidArgumentException( "No user specified." );

		$user_name = $user->get_name();

		$old_doc = $this->get_security_doc();

		// Assertions: two or more readers, one of which is in the list.

		if ( ! in_array( $user_name, $old_doc['members']['names'] ) )
			throw new InvalidArgumentException($user_name . " is not a reader.");

		// If the last reader is being removed, add the backup user as a reader.
		if ( count($old_doc['members']['names']) <= 1) array_push( $old_doc['members']['names'], $backup_user->get_name() );

		// Update security doc
		$new_doc = $old_doc;
		if ( in_array( $user_name, $new_doc['members']['names'] ) )
			$new_doc['members']['names'] = Helpers::array_without( $user_name, $new_doc['members']['names'] );


		// Send request
		$put_response_raw = h\Request::put( $this->security_doc_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->body( json_encode( $new_doc ) )
			->send();

		$put_response = json_decode( $put_response_raw, true );

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) )
		{
			// only remove the group from the user's group list, if they're neither an admin nor reader.
			if ( ! ( in_array( $user_name, $new_doc['admins']['names'] ) && in_array( $user_name, $new_doc['members']['names'] ) ) )
				$user->remove_group( $this );
		}

		return $put_response;

	} // END of remove_reader



	/**
	 * Returns the security doc from the current group.
	 * Note: If no doc set, will return blank structure of standard doc.
	 * @return Associative array of security doc body
	 */
	public function get_security_doc()
	{

		if ( ! isset( $this->name ) ) throw new LogicException( "Group name has not been set yet." );

		$response_raw = h\Request::get( $this->security_doc_url )
			->authenticateWith( $this->config->ADMIN_U, $this->config->ADMIN_P )
			->send();
		$response = json_decode( $response_raw, true );

		// If no doc set or if database doesn't exist, return blank structure of security doc
		if ( empty($response) || ( isset( $response['error'] ) && $response['error'] == 'not_found' ) )
		{
			return array(
				"admins"  => array( "names" => array(), "roles" => array() ),
				"members" => array( "names" => array(), "roles" => array() )
			);
		}

		return $response;

	} // END of get_security_doc


	public function is_admin( User $user )
	{
		$security_doc = $this->get_security_doc();
		return in_array( $user->get_name(), $security_doc['admins']['names'] );
	} // END of is_admin


	public function is_reader( User $user )
	{
		$security_doc = $this->get_security_doc();
		return in_array( $user->get_name(), $security_doc['members']['names'] );
	} // END of is_admin


	/**
	 * Returns extant flag.
	 * If flag not set, attempt to Group::read().
	 * @return boolean True if object is aware of group's existance, false otherwise.
	 * @see Group::read()
	 */
	public function isExtant()
	{
		if ( ! isset($this->isExant) ) { $this->read(); }
		return $this->isExtant;
	} // END of isExtant

}

?>