#!/usr/bin/env node

var program = require('commander')
var deployGlobals = require('./lib/DeployGlobals.js')

program
  .version('0.0.0')
  .option('--couchUrl [couchUrl]', 'The URL of the CouchDb containing HTTP Auth of a CouchDB Super Admin. If not provided, built from existing globals.')
  .option('--env [env]', 'JSON of environment variables to use. If not provided, built from existing globals.')

program.on('--help', function(){
  console.log('  Examples:')
  console.log('')
  console.log('    $ tangerine deploy-globals')
  console.log('')
});

program.parse(process.argv)

deployGlobals({
  env: program.env,
  couchUrl: program.couchUrl
}, function(error, response) {
  if (error) {
    console.log(error)
    process.exit(1)
  }
  else {
    console.log(JSON.stringify(response))
    process.exit(0)
  }
})
