/** Settings are configuration that can change.
 * This is largly a wrapper for environment variables.
 * This script is used by the Tree, which is in a different repo than the client.
 * Please only make changes to this file and treeload.js for the proper working of the Tree.
 */

'use strict';

// Require these environment variables
let requireVars = [
  {
    key: 'T_ADMIN',
    desc: 'CouchDB admin user name.'
  },
  {
    key: 'T_PASS',
    desc: 'CouchDB admin password.'
  },
  {
    key: 'T_COUCH_HOST',
    desc: 'Location of CouchDB. (e.g. localhost)',
    defaultValue: 'localhost',
  },
  {
    key: 'T_COUCH_PORT',
    desc: 'CouchDB\'s port. (e.g. 5984)',
    defaultValue: '5984',
  },
  {
    key: 'T_LOG_LEVEL',
    desc: 'Level at which to log to: info, warn, error.',
    defaultValue: 'info'
  }
];

var Settings = {};
let errors = [];
let warns = [];

let add = function(key, value) {
  Object.defineProperty(Settings, key, {
    value: value,
    writeable: false,
    configurable: false,
    enumerable: true
  });
}


// Process env vars
requireVars.forEach(function processEnvVars(el){
  if (!process.env[el.key]) {
    if (el.defaultValue === undefined) {
      errors.push(el);
    } else {
      warns.push(el);
      add(el.key, el.defaultValue);
    }
  } else {
    add(el.key, process.env[el.key]);
  }
});

// Halt program if errors
var missingSettings = Boolean(errors.length !== 0);
if (missingSettings) {
  console.log(`Robbert requires these environment variables:\n
${errors.map((el) => `${el.key}\t\t${el.desc}`).join('\n')}
`);
  process.exit(1);
}

// Warn if defaults used.
var warningsExist = Boolean(warns.length !== 0);
if (warningsExist) {
  console.log(`Treeload missing environment variables. Defaults used:\n
${warns.map((el) => `${el.key}=${el.defaultValue}\t\t${el.desc}`).join('\n')}
`);
}


module.exports = Settings;
