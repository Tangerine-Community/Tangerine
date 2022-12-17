const fs = require('fs-extra');
const util = require('util');
const junk = require('junk');
const {
  doesUserExist,
  hashPassword,
  USERS_DB,
  isSuperAdmin,
  findUserByUsername,
  areCredentialsValid,
} = require('./auth');

const registerUser = async (req, res) => {
  try {
    if (!(await doesUserExist(req.body.username))) {
      const user = req.body;
      user.isActive = true;
      user.password = await hashPassword(user.password);
      user.groups = [];
      const data = await USERS_DB.post(user);
      res.send({ statusCode: 200, data: `User registered Successfully` });
      return data;
    }
  } catch (error) {
    res.send('Could Not Create user');
  }
};

const getAllUsers = async (req, res) => {
  const result = await USERS_DB.allDocs({ include_docs: true });
  const data = result.rows
    .map(doc => doc)
    .filter(doc => !doc['id'].startsWith('_design'))
    .map(doc => {
      const user = doc['doc'];
      return {
        _id: user._id,
        email: user.email,
        // Users created before the introduction of the isActive property should be assumed to be active
        // Where the isActive property does not exist, we can safely assume the user has not been deleted
        // We should probably create an upgrade path to set and iSActive property to all user documents
        isActive: user.isActive === undefined ? true : user.isActive,
        username: user.username,
      };
    });
  res.send({ statusCode: 200, data });
};

const getUserByUsername = async (req, res) => {
  const username = req.params.username;
  try {
    await USERS_DB.createIndex({ index: { fields: ['username'] } });
    const results = await USERS_DB.find({
      selector: { username: { $regex: `(?i)${username}` } },
    });
    const data = results.docs.map(user => user.username);
    res.send({ data, statusCode: 200, statusMessage: 'Ok' });
  } catch (error) {
    res.sendStatus(500);
  }
};

const checkIfUserExistByUsername = async (req, res) => {
  try {
    const data = await doesUserExist(req.params.username);
    if (!data) {
      res.send({ statusCode: 200, data: !!data });
    } else {
      res.send({ statusCode: 409, data: !!data });
    }
  } catch (error) {
    // In case of error assume user exists. Helps avoid same username used multiple times
    res.send({ statusCode: 500, data: true });
  }
};

const isUserSuperAdmin = async (req, res) => {
  try {
    const data = await isSuperAdmin(req.params.username);
    res.send({ data, statusCode: 200, statusMessage: 'ok' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const isUserAnAdminUser = async (req, res) => {
  try {
    const data = await isAdminUser(req.params.username);
    res.send({ data, statusCode: 200, statusMessage: 'ok' });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

// If is not admin, return false else return the list of the groups to which user isAdmin
async function isAdminUser(username) {
  try {
    const groups = await getGroupsByUser(username);
    let data = groups.filter(group => group.attributes.roles.includes('Admin'));
    if (data.length < 1) {
      data = false;
    }
    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getGroupsByUser(username) {
  if (await isSuperAdmin(username)) {
    const readdirPromisified = util.promisify(fs.readdir);
    const files = await readdirPromisified('/tangerine/client/content/groups');
    let filteredFiles = files
      .filter(junk.not)
      .filter(name => name !== '.git' && name !== 'README.md');
    let groups = [];
    groups = filteredFiles.map(groupName => {
      return {
        attributes: {
          name: groupName,
          roles:['Admin']
        },
      };
    });
    return groups;
  } else {
    const user = await findUserByUsername(username);
    let groups = [];
    if (typeof user.groups !== 'undefined') {
      groups = user.groups.map(group => {
        return {
          attributes: {
            name: group.groupName,
            roles: group.roles,
          },
        };
      });
    }
    return groups;
  }
}

const deleteUser = async (req, res) => {
  try {
    const username = req.params.username;
    if (username) {
      const user = await findUserByUsername(username);
      user['isActive'] = false;
      const data = await USERS_DB.put(user);
      res.status(200).send({
        data: `User Deleted Successfully`,
      });
    } else {
      res.status(500).send({ data: `Could not Delete User` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ data: `Could not Delete User` });
  }
};
const restoreUser = async (req, res) => {
  try {
    const username = req.params.username;
    if (username) {
      const user = await findUserByUsername(username);
      user['isActive'] = true;
      const data = await USERS_DB.put(user);
      res.status(200).send({
        data: `User Restored Successfully`,
      });
    } else {
      res.status(500).send({ data: `Could not restore User` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ data: `Could not restore User` });
  }
};

const findMyUser = async (req, res) => {
  try {
    const user = await findUserByUsername(req.user.name);
    const { _id, email, firstName, lastName } = user;
    res.status(200).send({
      data: { _id, username: user.username, email, firstName, lastName },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ data: `Could not find User` });
  }
};

const findOneUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(500).send({ data: `Could not find User` });
    }
    const user = await findUserByUsername(username);
    const { _id, email, firstName, lastName, groups } = user;
    res.status(200).send({
      data: { _id, username: user.username, email, firstName, lastName, groups },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ data: `Could not find User` });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(500).send({ data: `Could not update User` });
    }
    const { firstName, lastName, email, password, confirmPassword, updateUserPassword } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(500).send({ data: `Could not update User` });
    }
    if (updateUserPassword && (password !== confirmPassword)) {
      return res.status(500).send({ data: `Could not update User` });
    } else {
      const user = await findUserByUsername(username);
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = updateUserPassword ? await hashPassword(password) : user.password;
      await USERS_DB.put(user);
      res.status(200).send({
        data: `User updated Successfully`,
      });
    }
  } catch (error) {
    return res.status(500).send({ data: `Could not update User` });
  }
};

const updateMyUser = async (req, res) => {
  try {
    const username = req.user.name;
    const { firstName, lastName, email, currentPassword, password, confirmPassword, updateUserPassword } = req.body;
    // console.log(req.body)
    if (!firstName || !lastName || !email) {
      return res.status(500).send({ data: `Could not update User` });
    }
    if (updateUserPassword && (password !== confirmPassword)) {
      return res.status(500).send({ data: `Could not update User` });
    } else {
      // Check if username and currentPassword supplied are equal to the values stored in the database
      if (updateUserPassword && !await areCredentialsValid(username, currentPassword)) {
        return res.status(500).send({ data: `Could not update User` });
      }
      const user = await findUserByUsername(username);
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = updateUserPassword ? await hashPassword(password) : user.password;
      await USERS_DB.put(user);
      res.status(200).send({
        data: `User updated Successfully`,
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ data: `Could not update User` });
  }
};

module.exports = {
  checkIfUserExistByUsername,
  deleteUser,
  findOneUserByUsername,
  findMyUser,
  updateMyUser,
  getAllUsers,
  getGroupsByUser,
  getUserByUsername,
  isUserAnAdminUser,
  isUserSuperAdmin,
  registerUser,
  restoreUser,
  updateUser
};
