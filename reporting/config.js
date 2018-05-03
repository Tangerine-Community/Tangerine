const Settings = require('./../server/Settings');

let config = {
  db_url: `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}/db/`
}

module.exports = config;
