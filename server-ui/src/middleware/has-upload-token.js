const log = require('tangy-log').log

module.exports = function (req, res, next) {
  if (req.headers.authorization && req.headers.authorization === process.env.T_UPLOAD_TOKEN) {
    return next();
  }
  let errorMessage = `Permission denied at ${req.url}`;
  log.warn(errorMessage)
  res.status(401).send(errorMessage)
}
