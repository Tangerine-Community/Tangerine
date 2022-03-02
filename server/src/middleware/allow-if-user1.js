const log = require('tangy-log').log;
const { verifyJWT, decodeJWT } = require('../auth-utils');
module.exports = function(req, res, next) {
  const token = req.headers.authorization || req.cookies.Authorization
  const errorMessage = `Permission denied at ${req.url}`;
  if (token && verifyJWT(token)) {
    const { username, permissions:{sitewidePermissions = [], groupPermissions = []} } = decodeJWT(token);
    if (username !== 'user1') {
      log.warn(errorMessage);
      res.status(401).send(errorMessage);
    } else {
      req.user = {};
      req.user.name = username;
      req.user.sitewidePermissions = sitewidePermissions;
      req.user.groupPermissions = groupPermissions;
      next();
    }
  } else {
    log.warn(errorMessage);
    res.status(401).send(errorMessage);
  }
};
