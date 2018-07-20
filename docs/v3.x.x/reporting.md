

## Clearing cache (reporting databases)
```
docker stop tangerine
curl -XDELETE "http://$ADMIN:$PASS@localhost:5984/$GROUPNAME-reporting"
curl -XPUT "http://$ADMIN:$PASS@localhost:5984/$GROUPNAME-reporting"
docker start tangerine
```
Then replicate the `_design/tangy-reporting` doc from a reporting database that does have it to the database you just recreated.
