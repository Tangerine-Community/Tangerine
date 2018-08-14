# Reporting


## Setting up debugging for reporting
Because the code in the `/tangerine/server/reporting/` folder is run as a CLI, you cannot inspect it with a debugger on the usual 9229 port that the `/tangerine/server/index.js` debugging is binded to. That's because the reporting worker is "spawned" as a child process from that main `/tangerine/server/index.js` process to ensure thta the reporting worker releases memory after completing its batch thus reducing surface area of the application that may be prone to memory leaks. 


- Step 1: Run `./develop.sh`, create some groups and create some data.
- Step 2: Near the end of `/tangerine/server/index.js` you will find a `keepAliveReportingWorker(initialGroups)`. Comment this line out to prevent the main process from running the reporting worker.
- Step 3: Upload some more data from a client and then run the following commands...

```
docker exec -it tangerine bash
cat /worker-state.json | node --inspect-brk=0.0.0.0:9227 /tangerine/server/reporting/run-worker.js
```

- Step 4: Open up node debugger tools in Chrome to port 9227.