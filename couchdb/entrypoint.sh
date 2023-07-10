#!/bin/bash

# Start CouchDB
/opt/couchdb/bin/couchdb &

# Wait for CouchDB to be available
#until curl -X PUT http://admin:password@localhost:5984/_users; do
#    echo "Waiting for CouchDB to start..."
#    sleep 1
#done

# Other initialization steps or commands can be added here

# Keep the container running
exec "$@"
