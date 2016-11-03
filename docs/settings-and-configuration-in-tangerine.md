# Settings and Configuration in Tangerine


## The settings Doc in every group database

To edit this document in a group, go to `http://<my tangerine server URL>/db/_utils/document.html?group-<my group name>/settings`.

### `userSchema` property
A JSON object for custom properties on user object. See [backbone-forms](https://github.com/powmedia/backbone-forms) for the format.

## The `acl` Doc in the `tangerine` database
ACL stands for Access Control List. Robbert, the HTTP service in charge of doing things like creating groups uses this list to determine if users have permissions to do things like create a group. Here's the default ACL document.
```
{
   "_id": "acl",
   "_rev": "134-93a90c7246cf59fa4c0e24b8d97e22e0",
   "groups": [
       {
           "users": [
               "admin",
               "user1"
           ],
           "permissions": [
               "Create new group",
               "Edit group's own content",
               "Create group content"
           ],
           "name": "Starter group",
           "creator": "admin"
       }
   ],
   "couchapp": {
   }
}
```

## Environment variables for Tangerine Server

