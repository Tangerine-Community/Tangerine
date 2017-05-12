# Migrating Results and Content between groups and Servers

Prerequisite is the `wedge` command.
```
# Install the wedge command.
git clone git@github.com:rjsteinert/couchdb-wedge.git
cd couchdb-wedge
npm link
```


## Migrate Content
```
# Get content from source group.
wedge pull-json --url "<protocol>://<user name>:<password>@<server url>/db/group-<group name>/_design/ojai/_view/byDKey?include_docs=true" > /tmp/group-<group name>.content.json

# Push content to destination group.
wedge push-json --url "<protocol>://<user name>:<password>@<server url>/db/group-<group name>" --file /tmp/group-<group name>.content.json
```


## Migrate Results
```
# Get results from source group.
wedge pull-json --url "<protocol>://<user name>:<password>@<server url>/db/group-<group name>/_design/ojai/_view/byCollection?keys=[\"result\"]&include_docs=true" > /tmp/group-<group name>.content.json

# Push results to destination group.
wedge push-json --url "<protocol>://<user name>:<password>@<server url>/db/group-<group name>" --file /tmp/group-<group name>.content.json
```
