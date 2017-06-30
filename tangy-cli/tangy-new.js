#!/usr/bin/env node
var acp = require('async-child-process');
var exec = acp.execAsync;
var program = require('commander')
var exec = require('./lib/exec.js')
program
  .version('0.0.0')

program.on('--help', function(){
  console.log('  Examples:')
  console.log('')
  console.log('    $ ')
  console.log('')
});

program.parse(process.argv)

async function go() {
  exec(`cp ${__dirname}/templates/project process.cwd()`)
  console.log(capture);
}
go()


