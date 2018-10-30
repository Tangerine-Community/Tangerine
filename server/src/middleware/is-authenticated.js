const log = require('tangy-log').log

module.exports = function (req, res, next) {
  // Uncomment next two lines when you want to turn off authentication during development.
  // req.user = {}; req.user.name = 'user1';
  // return next();
  if (req.isAuthenticated()) {
    return next();
  }
  let errorMessage = `Permission denied at ${req.url}`;
  log.warn(errorMessage)
  res.status(401).send(errorMessage)
}
