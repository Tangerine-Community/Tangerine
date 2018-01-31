# Configuration

## App Configuration

`app-config.json` should have the following properties defined:
*   `homeUrl:string`  The default route to load when no route is specified. Think of this as the root url
* `securityPolicy:string[]`. This is an array of all the combinations of the security policies to be enforced in the app. These are:
    * `password`
    * `noPassword`

*NOTE:* `noPassword` and `password` are mutually exclusive. Only one should be provided and not both
* `remoteCouchDBHost:string` This is the url to the couchDB host to replicate to. Should be in the form `http://username:password@localhost:5984/path`