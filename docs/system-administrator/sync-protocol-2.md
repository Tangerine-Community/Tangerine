# Sync Protocol 2 (two-way sync)

This feature when enabled allows some or all of forms responses to be synced between devices. The form responses that are synced depend on which forms are configured for sync and limited to a grouping by the "location" field in that users' profile.

For example: An installation has two Forms, Form A and Form B. Only Form A is configured to sync. User A who has "facility 1" assigned to them in their user profile creates a form response for Form A and Form B then initiates a sync to find that two form responses have been pushed up. User B has "facility 1" assigned to them in their user profile and initiates a sync to find they pulled down one form response for Form A that originated on User A's device. If User B modifies this form response, it will be pushed on the next sync and then later User A would pull down the change. Let's say there is a User C who is assigned to "facility 2" in their user profile. When they initiate a sync, they will not receive any form responses from the server because the server only has form responses from User A who is assigned to "facility 1".

## Enabling Sync Protocol 2 for new Groups

1. Enable Sync Protocol 2 before creating a new group by editing `config.sh` by adding `"sync-protocol-2"` to `T_MODULES`. 
2. Create a new group.
3. Define location list levels and content in `Config -> Location List`. 
4. Create a new form in `Author -> Forms`.
5. Go to `Deploy -> Device Users` and create new Device Users.
6. Go to `Deploy -> Devices` and create new Devices. 
7. Go to `Deploy -> Releases` and release the app.


`"syncProtocol":"2"` Enables a "Device Setup" process on first boot of the client application. This requires you set up a "Device" record on the server. When setting up a Device record on the server, it will give you a QR code to use to scan from the tablet in order to receive its device ID and token.

## Upgrade an existing group to Sync Protocol 2
If planning to use ``"syncProtocol":"2"` and a project already uses `"centrallyManagedUserProfile" : true`, remove `"centrallyManagedUserProfile": true` and configure the user profile's custom sync settings to push. 

## Managing Data Conflicts
Because we can sync data down to Devices, it's possible for two Devices to edit the same data between syncs. This causes a "Data Conflict". It's important for someone to monitor conflicts to ensure data integrity. Please refer to [Managing Data Conflicts](managing-data-conflicts.md) documentation.


