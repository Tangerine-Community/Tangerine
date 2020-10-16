# Configuration

## App Configuration

`app-config.json` should have the following properties defined.

- `homeUrl:string`  The default route to load when no route is specified. Think of this as the root url
- `securityPolicy:string[]`. This is an array of all the combinations of the security policies to be enforced in the app. NOTE: `noPassword` and `password` are mutually exclusive. Only one should be provided and not both.
    - `password`
    - `noPassword`
- `associateUserProfileMode`: This is the mode that determines where a user profiles comes from after a user has created an account on a device. Note, a "User" is tied together across devices by a single "User Profile". The account on the device is simply a security mechanism for using the profiles.
  - `remote`: Selecting this will result in a user being promted to enter a "code" after they register an account. This code is the last 6 characters of their User Profile ID. Typically a Group Admin would create a User Profile doc on the server and then send this code to the person associated with the User Profile. When the user enters this code on the tablet, the tablet will reach out over the Internet and download the corresponding User Profile and any content associated with that User Profile. Because all content is downloaded for that user, it can also be used as a way to fully restore a user's data on a new or recovered tablet. However note that this data is mode is not compatible with using CouchDB sync settings on any form definitions' sync settings.
  - `local-new`: This option allows users who register an Account on a tablet to create a new User Profile. This is also the default if no option is selected.
  - `local-exists`: This option is useful when using devices are set up using the "Centrally Managed Device" setup which would result in a facility's User Profiles already being on that device. When this option is selected, a drop down of unclaimed user profiles appears when accounts are being registered.

