const log = require('tangy-log').log;
const { verifyJWT, decodeJWT } = require('../auth-utils');
module.exports = function(req, res, next) {
  const token = req.headers.authorization || req.cookies.Authorization
  const errorMessage = `Permission denied at ${req.url}`;
  if (token && verifyJWT(token)) {
    const { username } = decodeJWT(token);
    if (!username) {
      log.warn(errorMessage);
      res.status(401).send(errorMessage);
    } else {
      req.user= {}
      req.user.name = username;
      next();
    }
  } else {
    log.warn(errorMessage);
    res.status(401).send(errorMessage);
  }
};
