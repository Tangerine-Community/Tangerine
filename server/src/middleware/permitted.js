const permit = (allowedRoles) => {
    const isAllowed = roles => (allowedRoles.filter(Set.prototype.has, new Set(roles))).length > 0;
    return (req, res, next) => {
      if (isAllowed(req.user.roles)) {
          next();
      } else {
        res.status(403).send(`Access Denied at ${req.url}`);
      }
    };
  };
module.exports = {
  permit,
};
