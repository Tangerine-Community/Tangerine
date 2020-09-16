# Upgrades

## Implementing Upgrades

There are two ways to implement upgrades to Tangerine configuration or databases that cannot be automatically upgraded:
- via a shell script, runnable via `docker exec -it tangerine /tangerine/server/src/upgrade/v3.9.0.js`
- adding to the updates.ts array. This will run automatically when the client app starts if a new version was deployed.

## Upgrading a server

You must run each version's server image before running its upgrade. for example, if you are upgrading from v3.6.4 to v3.13.0, follow these steps:

```
git clone https://github.com/Tangerine-Community/Tangerine.git
cd Tangerine
git fetch origin
git checkout v3.6.4
cp config.defaults.sh config.sh
# configure T_HOST_NAME, T_PROTOCOL (https), and T_MODULES (csv)
./start.sh v3.6.4
docker exec -it tangerine reporting-cache-clear
git checkout v3.7.1
./start.sh v3.7.1
docker exec tangerine translations-update
git checkout v3.8.0
./start.sh v3.8.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.8.0.js
git checkout v3.8.1
mv config.sh config.sh_backup
cp config.defaults.sh config.sh
# To edit both files in vim you would run...
vim -O config.sh config.sh_backup
# No upgrade script for this relese.
git checkout v3.9.0
./start.sh v3.9.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.9.0.js
git checkout v3.10.0
./start.sh v3.10.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.10.0.js
git checkout v3.11.0
./start.sh v3.11.0
docker exec -it tangerine /tangerine/server/src/upgrade/v3.11.0.js
# There was a bug in 3.11.0 that causes a blank screen in earlier APK's
git checkout v3.11.1-rc-2
./start.sh v3.11.1-rc-2
git checkout v3.12.0
./start.sh v3.12.0
# Run upgrade
docker exec -it tangerine reporting-cache-clear 
git checkout v3.13.0
./start.sh v3.13.0
docker exec -it tangerine reporting-cache-clear 
docker exec -it tangerine /tangerine/server/src/upgrade/v3.13.0.js
# Remove previous Tangerine version's Docker images.
docker rmi tangerine/tangerine:v3.6.4
docker rmi tangerine/tangerine:v3.8.0
docker rmi tangerine/tangerine:v3.8.1
docker rmi tangerine/tangerine:v3.9.0
docker rmi tangerine/tangerine:v3.10.0
docker rmi tangerine/tangerine:v3.11.0
docker rmi tangerine/tangerine:v3.13.0
```

## Limits to Upgrades

Read the instructions in the CHANGELOG.md. 

If testing a pre-v3.8 APK, it will fail to run on v3.8 or higher due to lack of newer Cordova plugins. 

## Update tips

Be aware that sync-protocol 2 uses a shared database; therefore, you don't want to do the same update whenever a different user logs in. 

The `requiresViewsRefresh` property will update All Default User Docs, which may place too much load on the tablet when it re-indexes those views. 

The following code checks for that scenario and show how to update a single view:

```
  {
    requiresViewsUpdate: false,
    script: async (userDb, appConfig, userService: UserService) => {
      // syncProtocol uses a single shared db for all users. Update only once.
      if (appConfig.syncProtocol === '2' && localStorage.getItem('ran-update-v3.9.0')) return
      console.log('Updating to v3.9.0...')
      await userDb.put(TangyFormsDocs[0])
      await userDb.query('responsesUnLockedAndNotUploaded')
      localStorage.setItem('ran-update-v3.9.0', 'true')
    }
```


