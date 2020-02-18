# Sync Protocol 2

# Enabling Sync Protocol 2 for new Groups

1. Enable Sync Protocol 2 before creating a new group by editing `config.sh` by adding `"sync-protocol-2"` to `T_MODULES`. 
2. Create a new group.
3. Define location list levels and content in `Config -> Location List`. 
4. Create a new form in `Author -> Forms`.
5. Go to `Deploy -> Device Users` and create new Device Users.
6. Go to `Deploy -> Devices` and create new Devices. 
7. Go to `Deploy -> Releases` and release the app.


`"syncProtocol":"2"` Enables a "Device Setup" process on first boot of the client application. This requires you set up a "Device" record on the server. When setting up a Device record on the server, it will give you a QR code to use to scan from the tablet in order to receive it's device ID and token.

## Upgrade an existing group to Sync Protocol 2
If planning to use ``"syncProtocol":"2"` and a project already uses `"centrallyManagedUserProfile" : true`, remove `"centrallyManagedUserProfile": true` and configure the user profile's custom sync settings to push. 
