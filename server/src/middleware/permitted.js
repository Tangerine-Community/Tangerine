const permit = (allowedPermissions) => {
    const isAllowed = permissions => (allowedPermissions.filter(Set.prototype.has, new Set(permissions))).length > 0;
    return (req, res, next) => {
      if (isAllowed(req.user.sitewidePermissions)) {
          next();
      } else {
        res.status(403).send(`Access Denied at ${req.url}`);
      }
    };
  };
module.exports = {
  permit,
};
