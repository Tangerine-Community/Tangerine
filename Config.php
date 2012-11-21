<?php

class Config
{

	public $HTTP;

	public $ADMIN_U;
	public $ADMIN_P;

	public $SERVER;
	public $PORT;
	public $TRUNK;

	public $GROUP_PREFIX;

	// special dbs and docs
	public $SECURITY;
	public $USERS;
	public $SESSION;
	public $REPLICATE;

	public $APP_DOCS;

	// composits, only URLs
	public $SERVER_URL;
	public $USER_DB_URL;
	public $SESSION_URL;
	public $GROUP_PREFIX_URL;

	public function __construct()
	{

		$this->HTTP    = "http://";

		$this->ADMIN_U = "admin";
		$this->ADMIN_P = "password";

		$this->SERVER  = "localhost";
		$this->PORT    = "5984";
		$this->TRUNK   = "tangerine";

		$this->GROUP_PREFIX = "group-";

		// special dbs and docs
		$this->SECURITY   = "_security";
		$this->USERS      = "_users";
		$this->SESSION    = "_session";
		$this->REPLICATE  = "_replicate";
		$this->APP_DOCS   = "_design/tangerine\nTangerineSettings\nConfig\nTemplates";

		$this->SERVER_URL       = $this->HTTP . $this->SERVER . ":" . $this->PORT . "/";
		$this->USER_DB_URL      = $this->SERVER_URL . $this->USERS;
		$this->SESSION_URL      = $this->SERVER_URL . $this->SESSION;
		$this->REPLICATE_URL    = $this->SERVER_URL . $this->REPLICATE;
		$this->GROUP_PREFIX_URL = $this->SERVER_URL . $this->GROUP_PREFIX;
	}

}

?>