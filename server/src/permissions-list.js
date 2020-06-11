const permissionsList = {
  groupPermissions: ['can_manage_group_deployment','can_assign_permissions_to_group_user'],
  sitewidePermissions: [
    'can_create_group',
    'can_view_users_list',
    'can_create_users',
    'can_edit_users',
    'can_manage_users_site_wide_permissions'
  ]
};

const getPermissionsList = async (req, res) => {
  return res.status(200).send(permissionsList);
};
module.exports = { permissionsList , getPermissionsList};
