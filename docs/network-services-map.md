# Network services map of Tangerine

Tangerine consists of various network services running on their respective ports and some staticly mounted directories for things like single page apps. Nginx is in front and handles most of the mapping of routes to specific ports. The `robbert` codebase is an acception as it is given a wildcard route from Nginx to handle whatever routes it cares to handle. In the future, we would like to consolidate all route handling into robbert. But for now, the network map looks like this.

```
browser -- nginx on port 80 -\
                             |
                              \_`/*` -- wildcard route that is the `./robbert` codebase, a node app running on port xxx
                             |              |
                             |              \_ `/robbert/*` -- Routes for admin functionalities like creating new groups                                                                      
                             |              |
                             |              \_ `/app/:groupId/*` is a static content route that points to `./editor/app/*` codebase
                             |              |
                             |              \_ `/client/*` is a static content route that points to `./client/app/*` codebase
                             |                                                          
                              \_`/tree` is the `./tree` codebase, a node app running on port xxx      
                             |
                              \_`/_csv` is the `./brockman` codebase, a ruby app on port 3141
                             |
                              \_ `/_cors_bulk_docs` is the `./decompressor` codebase, a node app running on port 2989
                             |
                              \_ `/db/*` is couchdb on port 5984
```
