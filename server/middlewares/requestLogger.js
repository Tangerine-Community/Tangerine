'use strict';
const logger = require('../logger')
var RequestLogger = function(req, res, next) {
  const method = req.method;
  const url = req.url;
  // const user = req.couchAuth.body.userCtx.name || 'unknown';
  // logger.info(`${method} ${url} ${user}`)
  logger.info(`${method} ${url}`)
  next();
};
module.exports = RequestLogger;