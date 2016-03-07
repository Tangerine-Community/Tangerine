/** Settings are configuration that can change.
* This is largly a wrapper for environment variables.
*/

'use strict';

let Settings = {};
let errors = [];
let warns = [];

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
    key: 'T_COUCH_PORT',
    desc: 'CouchDB port (e.g. 5984).',
    defaultValue: 5984
  },
  {
    key: 'T_COUCH_HOST',
    desc: 'Host for CouchDB (e.g. localhost, 192.168.0.5, etc.).',
    defaultValue: 'localhost'
  },
  {
    key: 'T_DECOMPRESSOR_PORT',
    desc: 'Port for the Decompressor service.',
    defaultValue: 4447
  },
  {
    key: 'T_LOG_LEVEL',
    desc: 'Detail of logs.',
    defaultValue: 'info'
  }

];

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
  console.log(`Tree requires these environment variables:\n
${errors.map((el) => `${el.key}\t\t${el.desc}`).join('\n')}
`);
  process.exit(1);
}

// Warn if defaults used.
var warningsExist = Boolean(warns.length !== 0);
if (warningsExist) {
  console.log(`Tree missing environment variables. Defaults used:\n
${warns.map((el) => `${el.key}=${el.defaultValue}\t\t${el.desc}`).join('\n')}
`);
}

module.exports = Settings;
