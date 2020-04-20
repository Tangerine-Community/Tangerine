# Upgrades

There are two ways to apply upgrades to Tangerine configuration or databases that cannot be automatically upgraded:
- via a shell script, runnable via `docker exec -it tangerine /tangerine/server/src/upgrade/v3.9.0.js`
- adding to the updates.ts array. This will run automatically when the client app starts if a new version was deployed.

