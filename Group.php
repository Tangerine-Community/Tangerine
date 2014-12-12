<?php

include_once('./httpful.phar'); use \Httpful as h; // awesome http library

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
	 * @var Config configuration object
	 */
	private $config;


	/**
	 * Constructor, _soft-overloaded_
	 * if name set, will attempt to fetch.
	 *   if successful, will simply read.
	 */
	public function __construct( $options = array() )
	{

		$this->config = new ConfigHelper();
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
	 * @return \Group for chaining
	 */
	public function set_name ( $name )
	{

		$this->name = Helpers::safety_dance($name);

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
	 * Attempt to read the group.
	 * @return array Parsed json response from group's database.
	 */
	public function read()
	{

		$con = $this->config;

		$response = h\Request::get( $con->group_db_url( $this->name, "main" ) )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
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

		$con = $this->config;

		// Create a blank database
		$put_response = h\Request::put( $con->group_db_url( $this->name, "main" ) )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
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

		// Data for continuous backup replication
		#$rep_doc = json_encode(array(
		#	"_id" => $con->constants->SERVER_NICKNAME . "_" . $this->name . "_" . $con->constants->BACKUP_SUFFIX,
		#	"source" => $con->group_db_url($this->name, "main", true),
		#	"target" => $con->group_db_url($this->name, "backup", true),
		#	"continuous" => true,
		#	"create_target" => true
		#));

		// Create a new backup replication
		#$replication_response = h\Request::post( $con->db_url("_replicator", "backup") )
		#	->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
		#	->sendsJson()
		#	->body( $rep_doc )
		#	->send();

		return $response;

	} // END of create


	/**
	 * Replicates design docs from tangerine trunk to the current group db.
	 * Will create them if not there.
	 */
	public function upgrade()
	{

		$con = $this->config;

		$replicate_data = json_encode( array(
			"source" => $con->constants->TRUNK,
			"target" => $con->group_db_name( $this->name ),
			"doc_ids" => explode( "\n", $con->constants->APP_DOCS )
		));

		$replicate_response = h\Request::post( $con->db_url("_replicate", "main") )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->sendsJson()
			->body( $replicate_data )
			->send();

		$this->add_uploader();

		return json_decode( $replicate_response, true );

	} // END of update_design_docs


	/**
	 * Adds a special user prefixed with uploader that will remain a reader in
	 * this group for uploading purposes of mobile Tangerines.
	 */
	public function add_uploader()
	{

		$con = $this->config;

		// calc new username and password
		$uploader_name = "uploader-" . $this->get_name();
		$uploader_pass = Helpers::calc_password(16);

		$uploader_user = new User( array(
			"name" => $uploader_name,
			"pass" => $uploader_pass // in case we need to save later
		));

		// If read with no error, authenticated flag will be set.
		$uploader_user->read();

		// If authenticate, we're done, there's already a user.
		if ( $uploader_user->is_authenticated() )
		{
			return true;
		}

		// If not, then make a user, add them as a reader
		$test = $uploader_user->save();

		$this->add_reader( $uploader_user, false );

		$settings_doc_response = h\Request::get( $con->group_doc_url("settings", $this->name, "main") )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->sendsJson()
			->send();

		$settings = json_decode( $settings_doc_response, true );

		// @TODO break this out into a new method. Issue #4
		if ( ! isset( $settings['upPass'] ) || $settings['upPass'] == "pass" )
		{

			$settings['upPass']    = $uploader_pass;
			$settings['groupName'] = $this->name;
			$settings['groupDDoc'] = $con->constants->D_DOC;
			$settings['groupHost'] = $con->get_host('main');

			$settings_doc_response = h\Request::put( $con->group_doc_url("settings", $this->name, "main") )
				->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
				->sendsJson()
				->body( json_encode( $settings ) )
				->send();

		} else {
			throw new RuntimeException( "Group already has an uploader" );
		}

	} // END of add_uploader


	/**
	 * Completely deletes a database, on $user's word.
	 */
	public function destroy( User $user = null)
	{

		$con = $this->config;

		// assert non-null user
		if ( $user == null ) throw new InvalidArgumentException('Method requires an user.');

		// assert admin user
		$security_doc = $this->get_security_doc();
		if ( ! in_array( $user->get_name(), $security_doc['admins']['names'] ) && count($security_doc['admins']['names']) == 1)
			throw new InvalidArgumentException('User must be group admin.');

		/*
		 * Your papers check out sir, deleting database.
		 */
		$data =  array(
			"create_target" => true,
			"source" => $con->group_db_name( $this->name, "main" ),
			"target" => $con->deleted_db_name( $this->name )
		);

		// stash a copy
		$post_response = h\Request::post( $con->db_url("_replicate", "main") )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->sendsJson()
			->body( json_encode( $data ) )
			->send();

		$delete_response_raw = h\Request::delete( $con->group_db_url( $this->name, "main" ) )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->send();

		$delete_response = json_decode( $delete_response_raw, true );

		// If the database was deleted, remove user's references to it
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
					$notify_user = new User( array( "name" => $user, "admin" => true ));
					$notify_user->remove_group( $this );
				}

			// Remove the uploader user
			$uploader_user = new User( array( 
				"name" => "uploader-" . $this->get_name(),
				"admin" => true
			));
			$uploader_user->destroy();

			/*
			 * remove the backup entry in _replicator
			 */
			$backup_name = $con->constants->SERVER_NICKNAME . "_" . $this->name . "_" . $con->constants->BACKUP_SUFFIX;
			$replicator_response = json_decode(
				h\Request::get(
					$con->doc_url($backup_name, "_replicator", "backup", true)
				)->send()
			, true);

			$rev = "?rev=".$replicator_response['_rev'];

			$delete_response_raw = h\Request::delete( 
				$con->doc_url($backup_name, "_replicator", "backup", true) . $rev
			)
				->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
				->send();

		}

		return $delete_response;

	} // END of update_design_docs


	/**
	 * Adds an admin user to a group's database's security doc.
	 * Secretly also adds them to the reader/members list.
	 * @param $user User to be added to the group as an admin.
	 * @return the response 
	 */
	public function add_admin( User $user = null, $reflexive = true )
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

		// Send request
		$put_response = json_decode( $this->set_security_doc( $new_doc ), true);

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) && $reflexive ) $user->add_group( $this );

		return $put_response;

	} // END of add_admin


	/**
	 * Removes an admin user from a group's database's security doc.
	 */
	public function remove_admin( User $user = null, $reflexive = true )
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
		$put_response = json_decode( $this->set_security_doc( $new_doc ), true);

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) )
		{
			// only remove the group from the user's group list, if they're neither an admin nor reader.
			if ( ! ( in_array( $user_name, $new_doc['admins']['names'] ) || in_array( $user_name, $new_doc['members']['names'] ) ) && $reflexive )
				$user->remove_group( $this );
		}

		// return
		return $put_response;

	} // END of remove_admin_from_group


	/**
	 * Adds a reader to the group's security doc.
	 * @return associative array of the Httpful response
	 */
	public function add_reader( User $user = null, $reflexive = true )
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

		// Send request
		$put_response = json_decode( $this->set_security_doc( $new_doc ), true);

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) && $reflexive ) $user->add_group( $this );

		return $put_response;

	} // END of add_reader


	/**
	 * Removes reader from the group's security doc.
	 * Note: will not remove last reader. That would make it a reader party.
	 * One reader always remains, the uploader
	 * @return associative array of the Httpful response
	 */
	public function remove_reader( User $user = null, $reflexive = true )
	{

		// Assert specified user.
		if ( $user == null ) throw new InvalidArgumentException( "No user specified." );

		$user_name = $user->get_name();

		$old_doc = $this->get_security_doc();

		// Assertions: two or more readers, one of which is in the list.

		if ( ! in_array( $user_name, $old_doc['members']['names'] ) )
			throw new InvalidArgumentException($user_name . " is not a reader.");

		// old strategy: If the last reader is being removed, add the backup user as a reader.
		// if ( count($old_doc['members']['names']) <= 1) array_push( $old_doc['members']['names'], $backup_user->get_name() );

		// Update security doc
		$new_doc = $old_doc;
		if ( in_array( $user_name, $new_doc['members']['names'] ) )
			$new_doc['members']['names'] = Helpers::array_without( $user_name, $new_doc['members']['names'] );

		// Send request
		$put_response = json_decode( $this->set_security_doc( $new_doc ), true);

		// if there was no error, update the user as well
		if ( ! isset( $put_response['error'] ) )
		{
			// only remove the group from the user's group list, if they're neither an admin nor reader.
			if ( ! ( in_array( $user_name, $new_doc['admins']['names'] ) && in_array( $user_name, $new_doc['members']['names'] ) ) && $reflexive )
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

		$con = $this->config;

		$response_raw = h\Request::get( $con->group_doc_url("_security", $this->name, "main") )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
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


	/**
	 * This saves the supplied security doc to the group's database.
	 * @param new_doc Must be a complete CouchDB doc
	 * @return httpful/Response object.
	 */
	public function set_security_doc( $new_doc = null )
	{
		if ( $new_doc == null ) throw InvalidArgumentException("Cowardly refusing to save a blank security doc.");
		$con = $this->config;

		return h\Request::put( $con->group_doc_url("_security", $this->name, "main") )
			->authenticateWith( $con->constants->ADMIN_U, $con->constants->ADMIN_P )
			->sendsJson()
			->body( json_encode( $new_doc ) )
			->send();

	} // END of set_security_doc

	public function is_admin( User $user )
	{
		$security_doc = $this->get_security_doc();
		return in_array( $user->get_name(), $security_doc['admins']['names'] );
	}


	public function is_reader( User $user )
	{
		$security_doc = $this->get_security_doc();
		return in_array( $user->get_name(), $security_doc['members']['names'] );
	}


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
