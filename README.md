robbert
=======

Tangerine's security robot, Robbert, helps enforce database-level security. robbert is responsible for the odds and ends of security that are otherwise difficult or impossible to attain with a simple couchapp.

Installation
============

Simply clone and point your http server to the directory.

Requirements
============

PHP and an http server.

Configuration
=============

First 

    $ cp Config.sample.php Config.php

and fill in the server names. 

If your ports are at all confusing or non-standard please have a look at ConfigHelper.php and see if it will give you the addresses you expect.

Usage
=====

robbert has a simple api that uses `POST` requests.

### varaibles

   action
   group
   user

