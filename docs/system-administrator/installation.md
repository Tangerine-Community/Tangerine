# Installation steps overview

Installation instructions are available in the README file on the GitHub repository. Here we summarize those instructions.

- Prerequisites - docker
- Create a local copy of the code
- Checks out a particular version of the code
- Customizes the installation
- Start both containers and push the configuration to them with the automated script

# Prerequisites 

Install docker - follow the recommended instruction at https://docs.docker.com/engine/install/ubuntu/ 

```
sudo apt update

sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu noble stable"

apt-cache policy docker-ce

sudo apt install docker-ce -y

sudo systemctl status docker

```

Create or modify the file **/etc/docker/daemon.json**
```
vi /etc/docker/daemon.json
```

Paste the following content to limit the log size to 100Mb
```
{ "log-driver": "json-file", "log-opts": 
    { "max-size": "100m", 
    "max-file": "3", 
    "labels": 
    "production_status", 
    "env": "os,customer" } 
}
```
Restart the docker daemon by running:
```
sudo service docker restart
```

# Installation

Get the software.  
```
git clone https://github.com/tangerine-community/tangerine.git
cd tangerine
```
See releases tab on github for versions. Checkout the correct versions that you need. 

```
   git checkout v3.31.1-rc-17 
```
Create config.sh and change all required settings. 
```
cp config.defaults.sh config.sh 
```

Configure the platform - look at the next section for configuraion options. Once conifgured execute the start command.
```
vi config.sh 
```
Start the platform. 
```
   sudo ./start.sh v3.31.1-rc-17
```

# Config.sh options

### Hostname

**T_HOST_NAME='DOMAIN'**

This makes the site available under this URL. In the AWS Route 53 configuration of Amazons (or in your DNS provider), we  point an A record DNS entry to the server's current IP. Tangerine requires a fully qualified domain name to function properly. This is due to a forced HTTS connection for updates and app sync. 

### Protocol
We always use a secure connection to ensure that data is encrypted during transmission. For local development we can stick with the http protocol on localhost, but for production environments this must be updated to 

**T_PROTOCOL="https"**

This configuration allows us to ensure secure connections, but it also allows us to use and force an SSL certificate. 

### Usernames and passwords

There are two mandatory usernames and passwords that we must establish. Those are the **T_USER1** and **T_USER1_PASSWORD** which is the primary admin user whose password cannot be updated from the interface. The other user is the database user **T_COUCHDB_USER_ADMIN_NAME** and their password **T_COUCHDB_USER_ADMIN_PASS**. Use strong passwords for both users. 

To update the CouchDB password after your site has been setup, you have to follow these steps: - [CouchDB Password Update](./couchdb-password.md)

If we want to change the T_USER1_PASSWORD we can update it directly in the config.sh file and then rebuild the container using the start.sh script. The database administrator password cannot be changed directly. Follow the procedure described in CouchDB-> Change Password in the technical documentation to update the sofa password. 

**T_USER1="user1"** - do not change and leave as user1
**T_USER1_PASSWORD="STRONG_PASS"**
**T_COUCHDB_USER_ADMIN_NAME="admin"** – do not change and leave as admin
**T_COUCHDB_USER_ADMIN_PASS="STRONG_PASS"**

If you are using the MySQL module, you must also set the username and password for this user. 
**T_MYSQL_USER="admin"** - make no changes 
**T_MYSQL_PASSWORD="STRONG_PASS"**

### Upload Token
The upload token used in the default sync method is the authentication token that your app uses to send data during sync. 
**T_UPLOAD_TOKEN="RANDOM_STRONG_TOKEN"**

If you update this token after a site has been started, you must also update it in each app-config.json file for each pool that already exists on the server. The app-config configuration is 'uploadToken'

### Default Modules
Enable desired modules. By degault we only have csv, Insert 'class' for Teach or 'mysql-js' for a MySQL module.

**T_MODULES="['csv' ]"**

### Container names
Tangerine allows you to name your containers with custom names. We use the default names 
    **T_CONTAINER_NAME="tangerine"**
    **T_COUCHDB_CONTAINER_NAME="couchdb"**

For MySQL we also have
**T_MYSQL_CONTAINER_NAME="mysql"**
**T_MYSQL_USER="admin"**
**T_MYSQL_PASSWORD="STRONG_PASS"**
**T_MYSQL_PHPMYADMIN="FALSE"** – can be TRUE if we want to enable the admin tool

### Port Configuration
There are two configurations for the listening ports. One is for the couch database on port 5984 and the other is for web requests on port 80. If no connections to the couch database are expected, we can leave the port configuration empty. The NGINX configuration forces the Tangerine container to listen on port 8080, otherwise leave as 80 and handled https on the ELB. Port 8080 is not exposed to the outside world.  

**T_COUCHDB_PORT_MAPPING=" -p 5984:5984"**
**T_PORT_MAPPING="-p 8080:80"** - if using NGINX 
**T_PORT_MAPPING="-p 80:80"** - not using NGINX

### CSV Generation Settings
We use the default settings for CSV generation, where the delay in csv database creationis a maximum of 300000 milliseconds (5 min). The other option available to us is batch size for csv processing. This setting allows us to modify the number of records that will be fragmented during csv generation. If the data volumes number in the thousands, you may want to increase them from 50 to 500.
**T_REPORTING_DELAY="300000"**
**T_CSV_BATCH_SIZE=50**

Below are other settings related to CSV generation. We can hide hidden values from forms and show them as a default value in the csv. The default setting for this is 999. We have changed it to ORIGINAL_VALUE which means that hidden entries in the form will be included in the csv files
**T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH="ORIGINAL_VALUE"**

All skipped entries can be mapped to a certain value. The default settings here are maintained. 
**T_REPORTING_MARK_SKIPPED_WITH="SKIPPED"**
In some cases when a form has been changed while it was in production, we will have certain variables that do not exist in all rows of the form. The default setting here is UNDEFINED. To keep the csv file simpler, we changed it to an empty string. 
**T_REPORTING_MARK_UNDEFINED_WITH=""**

If you are modifying any of the above settings on a live site, your changes will be reflected only if you run start.sh after modifying the configuration file and clearing the report cache by running 
```
docker exec tangerine reporting-cache-clear
```

### Hide the Skip-if
The default setting is true, and we've changed it to false. This option displays the Skip If setting for each entry in the Editor's backend interface. If set to true, we hide the skip if entry and only show the show-if.
**T_HIDE_SKIP_IF="false"**

### Historical APK and browser versions. 
Tangerine allows you to keep a historical list and links of APK files with build notes and tags. This can be very useful in an environment where forms are updated frequently. The default setting for both options is true. APK files can fill up disk space very quickly, therefore, we have set both below to false. If set to false, the historical list and links from the Version tab of the backend editor interface are also removed. 
    **T_ARCHIVE_APKS_TO_DISK="false"**
    **T_ARCHIVE_PWAS_TO_DISK="false"**

### Automatic historical form versions
Every time you update a form; Tangerine uses git to store this change in the file system. The first setting tells Tangerine to commit form changes automatically, and the second option indicates how often a commit is made (in milliseconds). When you create a release, we also create a git tag in the form repository. Note that we don't show this on the interace butyou can use the command line to find older verions of the forms

**T_AUTO_COMMIT="true"**
**T_AUTO_COMMIT_FREQUENCY="6000000"**


**All other settings remain unchanged on a generic site setup**

All settings are documented within the file and placed here for consistency. 

Control whether the report output limit is per group or sideways. The other option is "group," which will make sure that the assignment is applied at the group level.
**T_PAID_MODE="site"**

The number of uploaded form responses that will be marked as paid, therefore ending up in the report outputs.
**T_PAID_ALLOWANCE="unlimited"**
**T_USER1_MANAGED_SERVER_USERS="false"**

In the client, prevent users from editing their own profile.
**T_HIDE_PROFILE="false"**

Sync Protocol 1 Only: On device registration, after the user creates the account, it will force the user to enter a 6-character code that references the online account. We set this on per group bases so that other groups not requiring this setting can be created.
**T_REGISTRATION_REQUIRES_SERVER_USER="false"**

Synchronization Protocol 1 Only: In client synchronization, it will result in any changes made to a user profile on the server being downloaded and reflected on the client.
This setting only works with new groups that are being created.
**T_CENTRALLY_MANAGED_USER_PROFILE="false"**

Add replication entries in this array to boot the server into format of '{"from":"localDbName", "to":"remoteDbUrl", "continuous": true}'
**T_REPLICATE="[]"**

To fill in categories in Teach:
T_CATEGORIES="['one','two','three','four']"
Whether or not to use legacy parts of the system marked for obsolescence. At the moment, this is important for older customers loading on an older route.
**T_LEGACY="false"**

Override the Tangerine docker image version to use. Note that you should also check that version in git.
**T_TAG=""**

Apply Android tablet orientation. The options for T_ORIENTATION are in https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation
**T_ORIENTATION="anybody"**
**T_CUSTOM_LOGIN_MARKUP=''** – we can include some mark up to show branding or some message to the user when they go to login to the site.

The value that will be used for the issuer parameter when signing JWT.
**T_JWT_ISSUER="Tangerine"**

The validity period of a signed JWT token: Determines how long before a token is considered invalid. Expressed in seconds or in a string that describes a time interval as defined in https://github.com/zeit/ms
**T_JWT_EXPIRES_IN="1h"**

Password Policy
**T_PASSWORD_POLICY="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{ 8,})"**
T_PASSWORD_RECIPE="The password must contain at least 1 lowercase alphabetic character, at least 1 uppercase alphabetic character,
at least 1 numeric character, at least one special character, and must be eight characters or more"

Array of sources that can make requests to this server. Useful if you have an external browser-based application on a different origin that needs to make calls to this server. See the Express CORs options source settings for possible values. https://expressjs.com/en/resources/middleware/cors.html#configuration-options
Example of use. Note that forward slashes are required before double quotes, otherwise bash filters them out and it won't be a valid JSON. T_CORS_ALLOWED_ORIGINS='[\"http://localhost:8080\"]'
**T_CORS_ALLOWED_ORIGINS=''**


# Cron setup

To make sure that Tangerine and the server it is installed on operate correctly add the below lines to cron (crontab -e) to restart the the containers once a day but also to keep the server up to date.
```
# Clear CSV download folder. Only remove files older then 30 days. 
0 5 * * * find /home/ubuntu/tangerine/data/csv/* -type f -name '*' -mtime +30 -exec rm {} \;
0 1 * * SAT sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get autoremove -y && sudo reboot 
0 4 * * * docker restart couchdb && docker restart tangerine
@reboot docker start couchdb && sleep 10 && docker start tangerine
```

If you are using nginx you have to use the below version of the cron setup
```
# Clear CSV download folder. Only remove files older then 30 days. 
0 5 * * * find /home/ubuntu/tangerine/data/csv/* -type f -name '*' -mtime +30 -exec rm {} \;
0 1 * * SAT sudo apt-get update && sudo apt-get upgrade -y && sudo apt-get autoremove -y && sudo reboot
0 4 * * * docker restart couchdb && docker restart tangerine && docker restart nginx
@reboot docker start couchdb && sleep 10 && docker start tangerine && docker start nginx
# update nginx cert
0 3 * * * docker exec nginx certbot renew --post-hook "service nginx reload"
```


# Instllation folder
The installation folder is the one where you checkout the code and executed ./start.sh script. Generally, this is /home/ubuntu/tangerine

In this folder you have:
- The config.sh file
- All the Tangerine source code
- The data folder – where all data used by Tangerine is saved
   - Archives
    - Client
    - Couchdb - were the database is
     - Groups - where all groups are
- The default content sets in content-sets


# NGINX setup

NGINX is a proxy that can be used to intercept all traffic and also to serve the security certificates for Tangerine and other applications. 
What we have to do:
- Ask to listen on ports 80 and 443
- to redirect traffic for our site from port 80 to port 8080 on the tangerine container.
- to redirect all insecure traffic to 443
- Serve our lets encrypt certificate
- Other configurations

For detailed NGINX setup to to [Configuring Nginx as SSL proxy server for Tangerine](./tangerine-nginx-ssl.md) 


# Tangeirne upgrades

For specific upgrade instrucitons follow each release documentation. Generic instrcutions are available here: [Server Upgrade Instrcutions](./upgrade-instructions.md) 

# Maintenance and helper scripts

Take a moment to explore the info command inside your tangerine container. Some useful scripts are:

**create-group** – creates a test group with some content set

**reporting-cache-clear** – used to reset and restart the reporting service. This service builds the csv and logstash databases

**release-apk** and **release-pwa** – releases a group’s apk or pwa version

**import-archives** – imports all archives from the archive folder. Files exported from a tablet can be placed in this folder to be imported into a particular group. 

Other scripts used for maintenance testing and update are available from the info command.

# Bakcup Strategies

What needs to be backed up?
- The database folder
- the groups folder - The digitized/rendered tools.
- Config.sh file
- 
No need to backup the containers (Why?)
- Physical copies
- Setup an automated backup job to copy all file changes in the above data folders.
- Setup database replication
Setup couchdb replication from the couchdb interface
Open http://localhost:5984/_utils/index.html on the server and find the replication link. Setup the replication as described here
- Server image copies – create server image copies that can be restored on demand.

Use a combination of folder sync and replication to backup your site or create hot swap copies

# Recovery

There are two things you need to recover
- The groups folder - the rendered tools
- The database
  
If you kept a copy of the data folder, just restore this folder on your new server

Steps to follow in data recovery
- Checkout the desired version of the Tangerine code
- Configure the config.sh file or copy if from backup
- Copy and paste the data folder if you are restoring from a physical backup
- Execute the start.sh script 
- Generate any apk or pwa for groups that are currently in data collection.
