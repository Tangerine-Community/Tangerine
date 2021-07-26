# Bullet points for Tangerine Development

Here are my steps when developing for Tangerine:
-	Launch ngrok.io to provide https in front of the app.
-	Check settings in config.sh:
     o	T_HOST_NAME='SOME-NAME.ngrok.io' – this is critical for sync to work. I don’t think PWA’s work w/ IP addresses - must have a domain name.
     o	T_MODULES="['csv','sync-protocol-2, case']"
-	Launch Tangerine in developer mode: ./develop.sh
-	Once it is up, drop to console and do the following to get a docker console: docker exec -it tangerine bash
-	Create a new group: docker exec tangerine create-group "New Group D" case-module - Here is a doc on creating a basic case module group which users sync protocol 2, which has the bi-directional syncing/user mgmt.: https://docs.tangerinecentral.org/developer/creating-clean-dev-content/
-	Create a tablet user at Deploy -> Device Users
-	While you’re in there, go to Deploy -> Devices and create a device.
-	Go to your Tangerine instance using the URL you configured in T_HOST_NAME. Go to the new group you just created and release a PWA:
     o	Go to “Release Offline App”. In Web Browser Installation, select “Generate Test Release”.
     o	Click “ Release PWA” button. Copy the url it displays once it has generated the PWA. It should generate the PWA using the T_HOST_NAME.
-	In Chrome, enter a new Profile (makes life easier when testing…) and paste the URL for the PWA. 
-	In the Device Setup , choose “no” for the Device QR code to scan”. Switch to your Tangerine app, go to Deploy -> Devices and edit the device you created earlier and copy the device ID and Token.
-	Once it is setup, login w/ admin or the user you created.
-	To generate cases, look at the Case generation page: https://docs.tangerinecentral.org/developer/load-testing/
     o	Don’t worry about the substitutions part, just crank out some cases, substituting your group name (something like group-98e646c1-77e5-45ef-8a19-31501c2142a3) for GROUP-UUID below:
     o	docker exec tangerine generate-cases 10 GROUP-UUID
     o	After generating cases, sync!

## Troubleshooting

If you have problems, check the app-config. File in the group you created. It is at tangerine/data/groups/group-4de0b30c-1c90-4efd-8dcf-e83527109038/client/app-config.json. In the group I setup on the server:

"serverUrl":https://project.server.org/

PWA’s won’t work for that because I no longer have a load balancer setup nor DNS pointing to that instance. So if things are flaky on the groups you generate, this is a good thing to check. Also check the config.sh for the T_HOST_NAME as noted above.

To confirm your config.sh settings are correct, your group’s app-config.json should have:
"syncProtocol":"2","
"homeUrl":"case-home",
"serverUrl":https://SERVER.nkgrok.io/
