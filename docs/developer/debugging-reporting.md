
## Debugging the Reporting Cache process

Summary of steps:

1. Turn on reporting modules in `config.sh`.
1. Run develop.sh.
1. Create a group.
1. Generate data.
1. Stop the keep alive for reporting worker by commenting out `this.keepAliveReportingWorker()` in `server/src/app.service.ts`.
1. Enter the container on command line with `docker exec -it tangerine bash`.
1. Clear reporting cache with command `reporting-cache-clear`.
1. Run a batch with debugger enabled by running command `node --inspect-brk=0.0.0.0:9228 $(which reporting-worker-batch)`.
1. Latch onto debugging session using Chrome inspect. You may need to click "configure" and add `localhost:9228` to "Target discovery settings".


## Instructions
Configure your project to use the CSV and Logstash modules:
```
T_MODULES="['csv', 'logstash']"
```

Start the development environment...
```
./develop.sh
```

Create a group called `foo` in the GUI. Then open `./server/src/app.service.ts` and comment out the call to `this.keepAliveReportingWorker()`. __It's important to do these two things in this order__ otherwise the group could be disconnected from reporting.

"exec" into the container and note how `foo` has been added to the `/reporting-worker-state.json` file.

```
docker exec -it tangerine bash
cat /reporting-worker-state.json
```

Seed the `foo` group with 100 form responses.
```
docker exec tangerine generate-uploads 100 foo
```

Clear the cache

```shell script
docker exec tangerine reporting-cache-clear
```

If you get the error message 'Waiting for current reporting worker to stop...', you must exec into the container and remove the semaphore:

```shell script
rm /reporting-worker-running
```

and then run reporting-cache-clear again.

Start the reporting-worker-batch.js batch process manually and check for errors

```shell script
node --inspect-brk=0.0.0.0:9228 $(which reporting-worker-batch)
```


In Chrome, go to `chrome://inspect`, click `Configure...`, and add `127.0.0.1:9228` as an entry in "Target discovery settings".

## Debugging Demo 

https://www.youtube.com/watch?v=AToUBoApw8E&feature=youtu.be

Now manually trigger a batch. After the command finishes, verify the batch by checking `http://localhost:5984/_utils/#database/foo-reporting/_all_docs`.
```
node --inspect-brk=0.0.0.0:9228 $(which reporting-worker-batch)
```
There will be only 15 docs in your reporting db because that is the batch size.

Although Tangerine in develop.sh mode runs node in a debugger process, you must launch a separate node process to debug the batch reporting worker.

If no errors occurred, copy the temporary state to the current state.
```
cp /reporting-worker-state.json_tmp /reporting-worker-state.json
```

Keep repeating to continue processing...
```
cat /reporting-worker-state.json | /tangerine/serversrc/scripts/reporting-worker-batch.js | tee /reporting-worker-state.json_tmp
cp /reporting-worker-state.json_tmp /reporting-worker-state.json
```

If you would like to debug, add the `--inspect-brk=0.0.0.0:9227` option to the `run-worker.js` command.

```
cat /reporting-worker-state.json | node --inspect-brk=0.0.0.0:9227 /tangerine/server/src/scripts/reporting-worker-batch.js | tee /reporting-worker-state.json_tmp
```

When you run that command, it will wait on the first line of the script for a debugger to connect to it. In Chrome, go to `chrome://inspect`, click `Configure...`, and add `127.0.0.1:9227` as an entry in "Target discovery settings". Now back to the `chrome://inspect` page and you will find under the `Remote Target #127.0.0.1` group, a new target has been discovered called `/tangerine/server/reporting/run-worker.js`. Click `inspect` and now you should be able to set breakpoints and walk through the code. You may not be able to set breakpoints in all files so use "step into" and the `debugger` keyword to get the debugger to the focus you want.


If you want to keep the cache worker running, use watch.
```
watch -n 1 "cat /reporting-worker-state.json | node /tangerine/server/reporting/run-worker.js | tee /.reporting-worker-state.json | json_pp && cp /.reporting-worker-state.json /reporting-worker-state.json"
```

If you need to clear a reporting cache, don't simply delete the reporting db. Use
```
reporting-cache-clear

```

You typically need to remove the semaphore before running reporting-cache-clear, especially if there was a crash

```
rm /reporting-worker-running

```

## A typical report debugging workflow:

Remember to setup config.sh properly! (Make sure  T_MODULES="['csv','logstash']")
Comment out keepAliveReportingWorker in /server/src/app.service.ts.
Remember to add `127.0.0.1:9228` as an entry in "Target discovery settings" in chrome://inspect/#devices

You may need to add `debugger` before the line of code you wish to debug. 

docker exec into your container

```
docker exec -it tangerine bash
```
Then you'll typically need to rm the reporting-worker-running - it keeps reporting-cache-clear from running if a previous debug session crashed.

```
rm /reporting-worker-running
reporting-cache-clear
node --inspect-brk=0.0.0.0:9228 $(which reporting-worker-batch)
```
Switch back to Chrome, open `chrome://inspect`. The debugger will be the session that looks like this:

```
Target
/usr/local/bin/reporting-worker-batch file:///tangerine/server/src/scripts/reporting-worker-batch.js
Inspect
```

When it launches, it will wait on the first line of the script for a debugger to connect to it. Click F8 to run. 
If all is right and good in this world, it will stop at your debugger statement.
When the batch has completed, your debugger window will close.
