const log = require('tangy-log').log;
const bcrypt = require('bcryptjs');
const DB = require('./db.js');
const USERS_DB = new DB('users');
const GROUPS_DB = new DB('groups');
const { createLoginJWT } = require('./auth-utils');
const { permissionsList } = require('./permissions-list.js');
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (await areCredentialsValid(username, password)) {
      const permissions = await getSitewidePermissions(username);
      const token = createLoginJWT({ username, permissions });
      log.info(`${username} login success`);
      return res.status(200).send({ data: { token } });
    } else {
      log.info(`${username} login fail`);
      return res.status(401).send({ data: 'Invalid Credentials' });
    }
  } catch (error) {
    log.info(`${username} login failure`);
    console.log(error);
    return res.status(401).send({ data: 'Could not login user' });
  }
};

const getSitewidePermissionsByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await getSitewidePermissions(username);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send({ sitewidePermissions: [], groupPermissions: [] });
  }
};

const getSitewidePermissions = async username => {
  let sitewidePermissions = [];
  try {
    if (username === process.env.T_USER1) {
      return {
        groupPermissions: [],
        sitewidePermissions: [...permissionsList.sitewidePermissions].filter(
          perm => perm !== 'non_user1_user',
        ),
      };
    } else {
      const data = await findUserByUsername(username);
      sitewidePermissions = data.sitewidePermissions || [];
      return {
        groupPermissions: [],
        sitewidePermissions: [...sitewidePermissions, 'non_user1_user'],
      };
    }
  } catch (error) {
    console.error(error);
    return {
      groupPermissions: [],
      sitewidePermissions: [...sitewidePermissions, 'non_user1_user'],
    };
  }
};

const findUserByUsername = async username => {
  const result = await USERS_DB.find({ selector: { username } });
  return result.docs[0];
};

const areCredentialsValid = async (username, password) => {
  try {
    let isValid = false;
    if (
      username === process.env.T_USER1 &&
      password === process.env.T_USER1_PASSWORD
    ) {
      isValid = true;
      return isValid;
    } else {
      if (await doesUserExist(username)) {
        const data = await findUserByUsername(username);
        // if user is deleted the login attempt should fail
        if (data.isActive !== undefined && !data.isActive) {
          return false;
        }
        const hashedPassword = data.password;
        isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
      } else {
        return isValid;
      }
    }
  } catch (error) {
    return false;
  }
};

const doesUserExist = async username => {
  try {
    if (await isSuperAdmin(username)) {
      return true;
    } else {
      await USERS_DB.createIndex({ index: { fields: ['username'] } });
      const data = await findUserByUsername(username);
      return data && data.username && data.username.length > 0;
    }
  } catch (error) {
    console.error(error);
    return true; // In case of error assume user exists. Helps avoid same username used multiple times
  }
};
const isSuperAdmin = async username => {
  return username === process.env.T_USER1;
};

const hashPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
};

const extendSession = async (req, res) => {
  const { username } = req.body;
  let permissions;
  if (!req.params.groupName) {
    permissions = await getSitewidePermissions(username);
  } else {
    permissions = await getGroupAndSitewidePermissions(username, req.params.groupName);
  }
  const token = createLoginJWT({ username, permissions });
  return res.status(200).send({ data: { token } });
};
const updateUserSiteWidePermissions = async (req, res) => {
  try {
    const username = req.params.username;
    const { sitewidePermissions } = req.body;
    if (username && sitewidePermissions.length >= 0) {
      const user = await findUserByUsername(username);
      user.sitewidePermissions = [...sitewidePermissions];
      const data = await USERS_DB.put(user);
      res.status(200).send({
        data,
        statusCode: 200,
        statusMessage: `User permissions updated`,
      });
    } else {
      res.status(500).send({ data: `Could not update permissions` });
    }
  } catch (error) {
    res.status(500).send({ data: `Could not update permissions` });
  }
};
const getGroupAndSitewidePermissions = async (username, groupName) => {
  let permissions = {groupPermissions: [], sitewidePermissions: []};
  try {
    if (username === process.env.T_USER1) {
      permissions = {
        groupPermissions: [
          { groupName, permissions: permissionsList.groupPermissions },
        ],
        sitewidePermissions: [...permissionsList.sitewidePermissions].filter(
          perm => perm !== 'non_user1_user',
        ),
      };
    } else {
      const data = await findUserByUsername(username);
      const sitewidePermissions = data.sitewidePermissions || [];
      if (data.groups && data.groups.length > 0) {
        const groupData = data.groups.find(
          g => g.groupName === groupName || g.name === groupName,
        );
        const userRolesInGroup = groupData && groupData.roles ? groupData.roles : [];
        const currentGroup = await GROUPS_DB.get(groupName);
        // Get all the permissions associated with all the user's roles
        const perm = userRolesInGroup.map(r => {
          const g = currentGroup.roles.find(f => f.role === r);
          return g.permissions;
        });
        // Flatten array, would be good to use array.flat() when our node version supports it
        const myGroupPermissions = [...new Set(perm.reduce((acc, val) => acc.concat(val), []))];
        const groupPermissions = [{ groupName, permissions: myGroupPermissions || [] }];
        permissions = {
          groupPermissions,
          sitewidePermissions: [...sitewidePermissions, 'non_user1_user'],
        };
      } else {
        permissions = {
          groupPermissions: [],
          sitewidePermissions: [...sitewidePermissions, 'non_user1_user'],
        };
      }
    }
    return permissions;
  } catch (error) {
    console.error(error);
    return permissions;
  }
};
const getUserGroupPermissionsByGroupName = async (req, res) => {
  try {
    const username = req.user.name;
    const groupName = req.params.groupName;
    if (!username || !groupName) {
      return res.status(500).send('Could not get permissions');
    }
    let permissions = await getGroupAndSitewidePermissions(username, groupName);
    const token = createLoginJWT({ username, permissions });
    log.info(`${username} login success`);
    return res.status(200).send({ data: { token } });
  } catch (error) {
    console.error(error);
    res.status(500).send('Could not get permissions');
  }
};

const addRoleToGroup = async (req, res) => {
  const { data } = req.body;
  const { groupId } = req.params;
  if (!groupId || !data.role) {
    res.status(500).send('Could not add role');
  } else {
    try {
      const myGroup = await GROUPS_DB.get(groupId);
      myGroup.roles = myGroup.roles ? myGroup.roles : [];
      const exists = myGroup.roles.find(x => x.role === data.role);
      if (exists) {
        return res.status(409).send('Role already exists');
      }
      myGroup.roles = [...myGroup.roles, { ...data }];
      await GROUPS_DB.put(myGroup);
      res.status(200).send({ data: 'Role Added Successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Could not add role');
    }
  }
};

const findRoleByName = async (req, res) => {
  try {
    const { groupId, role } = req.params;
    if (!groupId) {
      return res.status(500).send('Could  not find role');
    }
    const data = await GROUPS_DB.get(groupId);
    if (data.roles) {
      const foundRole = data.roles.find(d => d.role === role);
      return res.status(200).send({ data: foundRole || {} });
    } else {
      return res.status(200).send({ data: {} });
    }
  } catch (error) {
    res.status(500).send('Could not find role');
  }
};

const getAllRoles = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(500).send('Could  not get roles');
    }
    const data = await GROUPS_DB.get(groupId);
    if (data.roles && data.roles.length > 0) {
      return res.status(200).send({ data: data.roles });
    } else {
      return res.status(200).send({ data: [] });
    }
  } catch (error) {
    res.status(500).send('Could not find role');
  }
};

const updateRoleInGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { role, permissions } = req.body;
    if (!groupId || !role || !permissions) {
      return res.status(500).send('Could  not update role');
    }
    const data = await GROUPS_DB.get(groupId);
    data.roles = data.roles ? data.roles : [];
    if (data.roles.length > 0) {
      const index = data.roles.findIndex(r => r.role === role);
      data.roles[index] = {role, permissions};
      await GROUPS_DB.put(data);
      return res.status(200).send({ data: 'Role Updated successfully' });
    } else {
      data.roles = { role, permissions };
      await GROUPS_DB.put(data);
      return res.status(200).send({ data: 'Role Updated successfully' });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send('Could  not update role');
  }
};

module.exports = {
  USERS_DB,
  addRoleToGroup,
  areCredentialsValid,
  doesUserExist,
  extendSession,
  findRoleByName,
  findUserByUsername,
  getAllRoles,
  getSitewidePermissionsByUsername,
  getUserGroupPermissionsByGroupName,
  hashPassword,
  isSuperAdmin,
  login,
  updateRoleInGroup,
  updateUserSiteWidePermissions,
};
