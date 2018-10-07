#!/usr/bin/env node
console.log('hi')
var program = require('commander')

program
  .version('0.0.1')
  .command('clear-reporting-cache', ' ')
  .command('push-all-groups-views', ' ')
  .command('push-all-groups-reporting-views', ' ')
  .command('release-apk', ' ')
  .parse(process.argv);
/*
  .command('release-apk <foo>', 'a')
  .command('release-pwa <foo>', 'a')
  .command('release-dat <foo>', 'a')
  .command('generate-csv <foo>', 'a')
  .command('generate-uploads <foo>', 'a')
*/
