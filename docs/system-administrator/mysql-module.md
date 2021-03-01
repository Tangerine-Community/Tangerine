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

### Step 5
Clear reporting cache to start generating a MySQL database for each group.

```
docker exec tangerine reporting-cache-clear
```

You can check in on the progress of generating the mysql database using the `mysql-report` command. It will return for each kind of case data and form, how many records are in the source database vs. how many have made it over to mysql. Note that if your system is under heavy load during the processing of this, this command may stress it out even more so it may be best to wait until you see a load of less than one using a tool like `top` or `htop`. 

```
docker exec tangerine mysql-report <groupId>
```

### Step 6
The most basic way to access MySQL would be to use the MySQL CLI. 

```
docker exec -it tangerine bash
mysql -u"$T_MYSQL_USER" -p"$T_MYSQL_PASSWORD" -hmysql
```

On the mysql command line, list the available databases using `show databases;`. Note how the database names are similar to the Group ID's these correspond with except with dashes removed. For example, if the group ID was `group-abc-123`, the corresponding MySQL database would be `groupabc123`. To select a database, type `use <database ID>;` then `show tables;` to list out the available tables.
