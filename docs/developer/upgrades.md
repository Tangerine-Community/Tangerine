# Upgrades

There are two ways to apply upgrades to Tangerine configuration or databases that cannot be automatically upgraded:
- via a shell script, runnable via `docker exec -it tangerine /tangerine/server/src/upgrade/v3.9.0.js`
- adding to the updates.ts array. This will run automatically when the client app starts if a new version was deployed.

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


