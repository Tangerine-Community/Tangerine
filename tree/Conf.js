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
add('APK_PATH', `${__dirname}/client/platforms/android/app/build/outputs/apk/debug/app-debug.apk`);
add('X86_APK_PATH', `${__dirname}/client/platforms/android/app/build/outputs/apk/android-x86-debug.apk`);
add('sessionUrl', `http://${Settings.T_COUCH_HOST}:${Settings.T_COUCH_PORT}${Conf.sessionPath}`);

module.exports = Conf;