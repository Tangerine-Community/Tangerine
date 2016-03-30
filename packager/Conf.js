/** Configuration values. Things that should only change between versions. */
'use strict';

const Settings = require('./Settings')
const Conf = {
  sessionPath : '/_session'
};

const add = function(key, value) {
  Object.defineProperty(Conf, key, {
    value: value,
    writeable: false,
    configurable: false,
    enumerable: true
  });
};

add('APP_ROOT_PATH', __dirname);
add('sessionUrl', `http://${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}${Conf.sessionPath}`);

module.exports = Conf;