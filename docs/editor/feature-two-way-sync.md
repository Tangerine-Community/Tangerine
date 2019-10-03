# Feature: Two Way Sync (experimental)
This feature when enabled allows some or all of forms responses to be synced between devices.
The form responses that are synced depend on which forms are configured for sync and limited to a grouping by the "location"
field in that users' profile.

For example: An installation has two Forms, Form A and Form B. Only Form A is configured to sync.
User A who has "facility 1" assigned to them in their user profile creates a form response for Form A and Form B then initiates
a sync to find that two form responses have been pushed up. User B has "facility 1" assigned to them in their user profile and
initiates a sync to find they pulled down one form response for Form A that originated on User A's device. If User B modifies
this form response, it will be pushed on the next sync and then later User A would pull down the change. Let's say there is a
User C who is assigned to "facility 2" in their user profile. When they initiate a sync, they will not
receive any form responses from the server because the server only has form responses from User A who is assigned to
"facility 1".

## Configuration

In the `groups` database, find the doc for the Group you want to configure two-way sync for and add the following to the
doc replacing `form-1` and `form-2` with the IDs of the forms you would like to be included for a two-way sync. Note, form
responses that do not match any of these Form IDs will simply be push only from devices, but never pulled down.

```
  "config": {
    "sync": {
      "formIds": [
        "form-1",
        "form-2"
      ]
    }
  }
```

In the Group's `app-config.json` doc, set `"syncProtocol"` to `"two-way"`.

Create a `_users` database in the CouchDB.

Add a Location item to the User Profile with a variable name of `location`. When a user syncs, the value in this location item is used to limit the data pulled down to the device.


## Merge conflicts
When syncing, there may be cases where two tablets may both modify a form response and then try to sync. This will cause a merge conflict and will be flagged and listed as a merge conflict on the device. Currently the only way to resolve this merge conflict is manually on the server using the Futon database interface. When conflicts are resolved, their resolution will replicate to the tablets on the next sync.
