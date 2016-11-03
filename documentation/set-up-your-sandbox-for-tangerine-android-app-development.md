# Set up your sandbox for Tangerine Android App Development

```
git clone <your fork url>
cd Tangerine/client
npm install
npm run debug
```

Now go to http://127.0.0.1:8080 in your web browser.

To load test data, on the command line run `./scripts/compilepacks.js && cp test/packs.json src/packs.json` and then in your web browser's javascript console run `Utils.loadDevelopmentPacks`. Wait a minute as that loads, then reload your browser, wait another minute while all the data indexes, and then voila, you'll have a whole bunch of assessments to play with.
