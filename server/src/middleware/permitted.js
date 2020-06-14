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

const permitOnGroupIfAll = (permissions) => {
  console.log(permissions)
  const isAllowed = groupPermissions => permissions.every(e => groupPermissions.includes(e));
  return (req, res, next) => {
    try {
      const group = req.params.groupId || req.params.groupName || req.params.group;
      const allGroupsPermissions = req.user.groupPermissions;
      const myGroupsPermissions = (allGroupsPermissions.find(g => g.groupName === group)).permissions;
      if (isAllowed(myGroupsPermissions)) {
        next();
      } else {
        res.status(403).send(`Access Denied at ${req.url}`);
      }
    } catch (error) {
      res.status(403).send(`Access Denied at ${req.url}`);
    }
  };
};
const permitOnGroupIfEither = (permissions) => {
  const isAllowed = groupPermissions => (permissions.some(e => groupPermissions.includes(e)));
  return (req, res, next) => {
    try {
      const group = req.params.groupId || req.params.groupName || req.params.group;
      const allGroupsPermissions = req.user.groupPermissions;
      const myGroupsPermissions = (allGroupsPermissions.find(g => g.groupName === group)).permissions;
      if (isAllowed(myGroupsPermissions)) {
        next();
      } else {
        res.status(403).send(`Access Denied at ${req.url}`);
      }
    } catch (error) {
      res.status(403).send(`Access Denied at ${req.url}`);
    }
  };
};
const permitOnGroupIf = (permission) => {
  const isAllowed = groupPermissions => groupPermissions.includes(permission);
  return (req, res, next) => {
    try {
      const group = req.params.groupId || req.params.groupName || req.params.group;
      const allGroupsPermissions = req.user.groupPermissions;
      const myGroupsPermissions = (allGroupsPermissions.find(g => g.groupName === group)).permissions;
      if (isAllowed(myGroupsPermissions)) {
        next();
      } else {
        res.status(403).send(`Access Denied at ${req.url}`);
      }
    } catch (error) {
      res.status(403).send(`Access Denied at ${req.url}`);
    }
  };
};
module.exports = {
  permit,
  permitOnGroupIf,
  permitOnGroupIfAll,
  permitOnGroupIfEither,
};
