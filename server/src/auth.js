const log = require('tangy-log').log;
const bcrypt = require('bcryptjs');
const DB = require('./db.js');
const USERS_DB = new DB('users');
const GROUPS_DB = new DB('groups');
const { createLoginJWT } = require('./auth-utils');
const {permissionsList} = require('./permissions-list.js');
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (await areCredentialsValid(username, password)) {
      const permissions = await collateUserPermissions(username);
      const token = createLoginJWT({ username, permissions });
      log.info(`${username} login success`);
      return res.status(200).send({data: { token }});
    } else {
      log.info(`${username} login fail`);
      return res.status(401).send({ data: 'Invalid Credentials' });
    }
  } catch (error) {
    log.info(`${username} login failure`);
    console.log(error)
    return res.status(401).send({ data: 'Could not login user' });
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const username = req.params.username;
    const data = await collateUserPermissions(username);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send({sitewidePermissions:[], groupPermissions: []})
  }
};

const collateUserPermissions = async username => {
  if (username === process.env.T_USER1) {
    const groups = ((await GROUPS_DB.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(doc => !doc._id.includes('_design')));
    const groupPermissions = groups.map(group=>{
      return{groupName: group._id, permissions: permissionsList.groupPermissions};
    });
    return {sitewidePermissions: permissionsList.sitewidePermissions, groupPermissions};
  } else {
    const data = await findUserByUsername(username);
    const sitewidePermissions = data.sitewidePermissions || [];
    if (data.groups.length > 0) {
    const groupPermissions = data.groups.map(group => {
      return {groupName: group.groupName, permissions: group.permissions || []};
    });
    return {sitewidePermissions, groupPermissions};
  } else {
    return {sitewidePermissions, groupPermissions: []};
  }
  }
};

const findUserByUsername = async (username) => {
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

const doesUserExist = async (username) => {
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
const isSuperAdmin = async (username) => {
  return username === process.env.T_USER1;
};

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
  }
};

const extendSession = async (req, res) => {
  const {username} = req.body;
  const permissions = await collateUserPermissions(username);
  const token = createLoginJWT({ username, permissions });
  return res.status(200).send({data: { token }});
};
const updateUserSiteWidePermissions = async (req, res) => {
  try {
    const username = req.params.username;
    const {sitewidePermissions} = req.body;
    if (username && sitewidePermissions.length >= 0 ) {
    const user = await findUserByUsername(username);
    user.sitewidePermissions = [...sitewidePermissions];
    const data = await USERS_DB.put(user);
    res.send({ data, statusCode: 200, statusMessage: `User permissions updated` });
  } else {
    res.send(`Could not update permissions`);
  }
  } catch (error) {
    res.send(`Could not update permissions`);
  }
};
module.exports = {
  USERS_DB,
  areCredentialsValid,
  doesUserExist,
  extendSession,
  findUserByUsername,
  getUserPermissions,
  hashPassword,
  isSuperAdmin,
  login,
  updateUserSiteWidePermissions,
};
