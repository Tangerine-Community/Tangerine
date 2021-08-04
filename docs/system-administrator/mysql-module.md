# MySQL Module

## Enabling MySQL module

Important! If __reenabling__ the mysql module, remove the mysql folder: `rm -r data/mysql`

### Step 1
Ensure the variables from the `MySQL` section in config.defaults.sh are in your customized `config.sh` file. 

### Step 2
Ensure the `T_MYSQL_PASSWORD` variable is set to a sufficiently secure string. Failure to properly secure this password will __without a doubt__ result in ransomware bots hacking your database.

### Step 3
Add the mysql module to `T_MODULES_ENABLED` in `config.sh`. 

For example:
```
T_MODULES="['csv','mysql']"
```

### Step 4
Run the start script to load in new configuration. Do this even if your server is already running. Note that restarting the container will not work, we have to run `./start.sh` to recreate the container with the new configuration.

```
./start.sh <version>
```

Note: Upgrading an older version of Tangerine may require running `docker exec tangerine push-all-groups-views` after to enable indexes used for mysql

### Step 5
Clear reporting cache to start generating a MySQL database for each group.

```
docker exec tangerine reporting-cache-clear
```

You can check in on the progress of generating the mysql database using the `mysql-report` command. (*Warning* The `mysql-report` command creates a heavy workload to an instance so do not use it when mysql is trying to process a lot of data from couchdb. See the "Troubleshooting" section below.) It will return for each kind of case data and form, how many records are in the source database vs. how many have made it over to mysql. Note that if your system is under heavy load during the processing of this, this command may stress it out even more so it may be best to wait until you see a load of less than one using a tool like `top` or `htop`. 

```
docker exec -it tangerine bash 
mysql-report <groupId> | json_pp
```

### Step 6
In the reboot instruction in crontab that to starts Tangerine on reboot, add mysql container to the containers that start before tangerine and increase the sleep command to 60 seconds. Failure to implement this will result in tangerine failing to start on reboot.

```
@reboot docker start couchdb mysql && sleep 60 && docker start tangerine
```

### Step 7
The most basic way to access MySQL would be to use the MySQL CLI. 

```
docker exec -it tangerine bash
mysql -u"$T_MYSQL_USER" -p"$T_MYSQL_PASSWORD" -hmysql
```

On the mysql command line, list the available databases using `show databases;`. Note how the database names are similar to the Group ID's these correspond with except with dashes removed. For example, if the group ID was `group-abc-123`, the corresponding MySQL database would be `groupabc123`. To select a database, type `use <database ID>;` then `show tables;` to list out the available tables.

### Step 8

To set up remote encrypted connections to mysql, three options:

1. __TLS__: In the `tangerine/data/mysql/databases` folder you will find files `ca.pem`, `client-cert.pem`, and `client-key.pem`. Distribute those files to your MySQL users so they may connnect to your server's IP addres port 3306 using these certificates. For example, `mysql  -u admin -p"you-mysql-password" --ssl-ca=ca.pem --ssl-cert=client-cert.pem --ssl-key=client-key.pem`.
2. __SSH__: For each person using MySQL, they will need SSH access to the server. When granted, they may use tunneling of mysql port 3306 over SSH to access mysql at `127.0.0.1:3306`.  For example, to set up an SSH port forwarding on Mac or Linux, run `ssh -L 3306:your-server:3306 your-server`.
3. __VPN__: If you connect to MySQL via the IP address of the server, using a VPN will ensure that communication with MySQL is encrypted. Note however that the traffic will be visible to those also on your VPN so make sure it's a trusted VPN only used by those who have permission to access the data.

## Troubleshooting

### Issue: Data on the Mysql db is far behind the Couchdb.

This scenario can happen when replicating data from a Production database on another server instance. Step to triage and resolve this issue:

1. run `docker ps -a` to see if the tangerine and couchdb instances are up
2. Bring back up those instance by using the `start.sh` script.
3. Confirm using `docker logs -f tangerine` that the docker containers are back up and processing data correctly.
4. If the server must catch up more than a day's worth of documents, use the [wedge](https://github.com/rjsteinert/CouchDB-Wedge) pre-warm-views at the end of the day to hit all views in the couchdb to pre-warm them (i.e. index those views). 
5. After the indexes have been built, use the `mysql-report groupID` command to see if the mysql and couchdb databases are caught up.
