/** Verifies that a requesting user is either
 * - a server level admin (checked with roles), or
 * - an admin in a specific group
 * - or wants to perform an action on themself
 */

const verifyRequester = function(req, requestingUser, group, targetUser) {
  return new Promise(function(resolve, reject){
    const isntServerAdmin = req.couchAuth.body.userCtx.roles.indexOf("_admin") === -1;
    if (isntServerAdmin) {
      const isVerifiedSelfAction = targetUser && targetUser.name() === requestingUser.name();
      if (isVerifiedSelfAction) {
        return resolve();
      } else {
        return requestingUser.assertAdmin(group);
      }
    } else {
      return resolve();
    } // if (isntServerAdmin)
  }); // promise
};

module.exports = verifyRequester;