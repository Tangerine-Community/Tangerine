#!/usr/bin/env node

var program = require('commander')
var getAssessmentDocs = require('./lib/GetAssessmentDocs.js')

program
  .version('0.0.0')
  .option('--url <url>', 'The URL of the database containing the Assessment')
  .option('--id [id]', 'Optionally an ID of an Assessment, otherwise all Assessments are pulled')

program.on('--help', function(){
  console.log('  Examples:')
  console.log('')
  console.log('    $ tangerine pull-assessments --id a8587919-0d0e-9155-b41d-7a71b41be749 --url http://username:password@databases.tangerinecentral.org/group-sweet_tree > test/packs/be749-grid-with-autostop-and-subsequent-test-with-link-to-grid.json')
  console.log('')
});

program.parse(process.argv)

getAssessmentDocs({
  id: program.id,
  url: program.url
}, function(error, response) {
  if (error) {
    console.log(error)
    process.exit(1)
  }
  else {
    console.log(response)
    process.exit(0)
  }
})
