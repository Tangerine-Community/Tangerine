# MySQL-JS module

## Javascript import script for MySql.

crontab examples:

```shell
0 21 * * * docker exec tangerine rebuild-mysql-db > /home/ubuntu/logs/mysql-rebuild_$(date +\%Y\%m\%d\%H\%M\%S).log 2>&1
0 20 * * * logrotate /home/ubuntu/logrotate.conf --state /home/ubuntu/logrotate-state
```



