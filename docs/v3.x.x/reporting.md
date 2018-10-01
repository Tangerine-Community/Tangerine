
## Debugging the Reporting Cache process

Start the development environment...
```
./develop.sh
```

Create a group called `foo` in the GUI. Then open `./server/index.js` and comment out the call to `keepAliveReportingWorker(initialGroups)`. 

"exec" into the container and note how `foo` has been added to the `/worker-state.json` file.

```
docker exec -it tangerine bash
cat /worker-state.json
```

Seed the `foo` group with 100 form responses.
```
cd /tangerine/server/src/scripts/generate-uploads
./bin.js 100 foo
```

Now manually trigger a batch. After the command finishes, verify the batch by checking `http://localhost:5984/_utils/#database/foo-reporting/_all_docs`.
```
cat /worker-state.json | node /tangerine/server/reporting/run-worker.js | tee /worker-state.json_tmp
```

If no errors occured, copy the temporary state to the current state.
```
cp /worker-state.json_tmp /worker-state.json
```

Keep repeating to continue processing...
```
cat /worker-state.json | node /tangerine/server/reporting/run-worker.js | tee /worker-state.json_tmp
cp /worker-state.json_tmp /worker-state.json
```

If you would like to debug, add the `--inspect-brk=0.0.0.0:9227` option to the `run-worker.js` command.

```
cat /worker-state.json | node --inspect-brk=0.0.0.0:9227 /tangerine/server/reporting/run-worker.js | tee /worker-state.json_tmp
```

When you run that command, it will wait on the first line of the script for a debugger to connect to it. In Chrome, go to `chrome://inspect`, click `Configure...`, and add `127.0.0.1:9227` as an entry in "Target discovery settings". Now back to the `chrome://inspect` page and you will find under the `Remote Target #127.0.0.1` group, a new target has been discovered called `/tangerine/server/reporting/run-worker.js`. Click `inspect` and now you should be able to set breakpoints and walk through the code. You may not be able to set breakpoints in all files so use "step into" and the `debugger` keyword to get the debugger to the focus you want.


If you want to keep the cache worker running, use watch.
```
watch -n 1 "cat /worker-state.json | node /tangerine/server/reporting/run-worker.js | tee /.worker-state.json | json_pp && cp /.worker-state.json /worker-state.json"
```

