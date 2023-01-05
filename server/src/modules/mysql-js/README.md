# MySQL-JS module

## Javascript import script for MySql.

This module populates a -mysql and -mysql-sanitised Couchdb per group. 
To generate the mysql database, you must run the `rebuild-mysql-db` script.

You must add 'mysql-js' in order to enable this module: `T_MODULES="['sync-protocol-2','case','mysql-js']"`

## crontab examples:

```shell
0 21 * * * docker exec tangerine rebuild-mysql-db > /home/ubuntu/logs/mysql-rebuild_$(date +\%Y\%m\%d\%H\%M\%S).log 2>&1
0 20 * * * logrotate /home/ubuntu/logrotate.conf --state /home/ubuntu/logrotate-state
```

## byType view

Make sure the -mysql db's have the byType view.

One way to populate them is to use `docker exec tangerine reporting-cache-clear` however that will clear the -mysql db as well.

## T_ONLY_PROCESS_THESE_GROUPS

If you want only certain db's to be populated, use T_ONLY_PROCESS_THESE_GROUPS.


