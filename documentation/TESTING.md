# Testing for Tangerine

## Running tests

 - npm test will run mocha-phantomjs tests and watch for changes to coffeescript files.
 - npm run testWatch will run tests using mocha-phantomjs, displaying output on command line and watch for changes to coffeescript files.
 - npm run debug-test will run mocha tests in the browser at http://127.0.0.1:8080/test/index.html and watch for changes to coffeescript files.
 
### Issues with phantomjs

Run pahtomjs at least 2.1.1 in order to correct a bug in 1.9.8. When running tests it was printing this message:
                      
`
Unsafe JavaScript attempt to access frame with URL about:blank from frame with URL
`
                      
More info: https://github.com/ariya/phantomjs/issues/12697
 
To help debug pahtomjs issues, here is a sample command, which includes switches for dealing with cors issues. In truth, they don't seem to make a different :-( 
 
`
phantomjs node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/index.html spec "{\"localToRemoteUrlAccessEnabled\":\"true\",\"webSecurityEnabled\":\"false\"}"
`
 
## Write tests

Tests are undergoing a bit of change, mostly due to a strict behaviour of Mocha v3.0.0 and newer. Some of the tests may throw the following error:

````
Error: Resolution method is overspecified. Specify a callback *or* return a Promise; not both.
````

The current strategy is to discontinue passing done through each test, but instead use a setTimeout to wait x seconds before done()

````
      beforeEach( 'Setup done and timeout',(done) ->
        console.log("beforeEach, we are setting the timeout")
        setTimeout(() ->
          console.log("at the end of the timeout, return done()")
          foo = true;
          done()
        , 20000)
        return
      )
````

Ultimately we should consider moving away from callbacks and embracing promises. We're in a transitional phase now.

Currently tests are all written using the [Mocha framework](https://mochajs.org/) and placed in `./test/spec/test.coffee`. We have a giant `describe` with each test contained in an `it`. 
For example, here is the test that verifies that an assessment can be retrieved.

```
it('Should return the expected assessment', (done)->
  id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
  assessment = new Assessment "_id" : id
  assessment.deepFetch({
    error:(err) ->
      console.log "Catch Error: " + JSON.stringify err
      done(err)
    success: (record) ->
      Tangerine.assessment = assessment
      expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
      done()
  })
)
```

When you write your own test, place it after the last `it` test. 

When you write a test, you might want to create a new Assessment to test against. In `./test/packs` folder you will find a number of JSON documents, one for each Assessment. Because these JSON docs are in that folder, they are automatically loaded into the PouchDB database before your test will run. You can include your own Assessment in that folder by creating it on an instance of Tangerine Server and then using the `./scripts/pack-cli.js` script to pull it down.

From the command line, the `./scripts/pack-cli.js` command can be used like this.
```
./scripts/pack-cli.js --id a8587919-0d0e-9155-b41d-7a71b41be749 --url http://username:password@databases.tangerinecentral.org/group-sweet_tree > test/packs/be749-grid-with-autostop-and-subsequent-test-with-link-to-grid.json
```

Notice the naming convention of the JSON file. It's the last 5 characters of the Assessment ID and then a descriptive human readable name.