<?php

/**
 * Simple helper class to make Attempt reports
 */
class Attempt
{

	private $status;
	private $message;

	public function __construct( $status = "", $message = "" )
	{
		$this->status  = $status;
		$this->message = $message;
	}

	/**
	 * Returns this object as JSON.
	 */
	public function toJson()
	{
		return json_encode( array(
			"status"  => $this->status,
			"message" => $this->message
		));
	}

}

?>