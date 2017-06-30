#!/usr/bin/env node
var program = require('commander')

program
  .version('0.0.1')
  .command('new <name>', 'create a new tangy project')
  .command('build', 'build it')
  .command('foo', 'gotta foo')
  .parse(process.argv);
