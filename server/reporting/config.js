const Settings = require('../Settings');
let config = {};

config.base_db = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}/db/`;
config.result_db = `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}/db/`;

module.exports = config;
