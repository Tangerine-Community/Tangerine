const clog = require('tangy-log').clog
const log = require('tangy-log').log
const tangyModules = require('../modules/index.js')()

module.exports = async (req, res) => {
  res.send(tangyModules.enabledModules);
}