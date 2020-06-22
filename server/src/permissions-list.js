const permissionsList = {
  groupPermissions: [
    'can_manage_group_deployment',
    'can_assign_permissions_to_group_user',
    'can_manage_data',
    'can_author',
    'can_configure',
    'can_deploy',
    'can_view_form_responses',
    'can_download_csv',
    'can_review_issues',
    'can_review_uploaded_cases',
    'can_manage_group_roles'
  ],
  sitewidePermissions: [
    'can_create_group',
    'can_view_users_list',
    'can_create_users',
    'can_edit_users',
    'can_manage_users_site_wide_permissions',
  ],
};

const getPermissionsList = async (req, res) => {
  return res.status(200).send(permissionsList);
};
module.exports = { permissionsList, getPermissionsList };
