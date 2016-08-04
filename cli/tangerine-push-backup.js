#!/usr/bin/env node

var program = require('commander')
var pushBackupArchive = require('./lib/PushBackupArchive.js')
fs = require('fs');

program
  .version('0.0.0')
  .option('--url <url>', 'The URL of the database to push the archive to.')
  .option('--path <id>', 'Path of the Backup Archive.')

program.on('--help', function(){
  console.log('  Examples:')
  console.log('')
  console.log('    $ tangerine push-backup --path ./directory_of_backup_files --url http://username:password@databases.tangerinecentral.org/group-sweet_tree')
  console.log('')
});

program.parse(process.argv)

pushBackupArchive({
  path: program.path,
  url: program.url
}, function(error, response) {
  if (error) {
    console.log(error)
    process.exit(1)
  }
  else {
    console.log('\n\n')
    fs.writeFile('upload.log',JSON.stringify(response), function (err) {
      if (err) return console.log(err);
      console.log('Saved log to upload.log');
      process.exit(0)
    });
    console.log(response, null, 2)
    //  process.exit(0)
  }
})
