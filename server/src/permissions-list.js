const permissionsList = {
  groupPermissions: [
    'can_access_dashboard',
    'can_access_configure',
      'can_access_configure_sync',
      'can_access_configure_location_list',
      'can_access_security',
        'can_manage_group_users',
        'can_manage_group_roles',
    'can_access_data',
      'can_access_uploads',
      'can_access_download_csv',
      'can_access_cases',
        'can_delete_cases',
        'can_archive_cases',
        'can_unarchive_cases',
        'can_restore_conflict_event',
      'can_access_issues',
      'can_access_database_conflicts',
    'can_access_author',
      'can_access_forms',
        'can_manage_forms',
      'can_access_media',
    'can_access_deploy',
      'can_access_device_users',
      'can_access_devices',
      'can_access_releases',
    'can_administer_couchdb_server'
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
