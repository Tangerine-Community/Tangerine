const permissionsList = {
  groupPermissions: ['can_manage_group_deployment','can_assign_permissions_to_group_user'],
  sitewidePermissions: [
    'can_manage_site_wide_users',
    'can_create_group',
    'can_create_user'],
};

const getPermissionsList = async (req, res) => {
  return res.status(200).send(permissionsList);
};
module.exports = { permissionsList , getPermissionsList};
