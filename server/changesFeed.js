const logger = require('./logger');


let changesFeed = function (group) {
  logger.info("Changes feed for: " + group)
  return "done"
}
module.exports = changesFeed;