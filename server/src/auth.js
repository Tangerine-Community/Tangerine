const log = require('tangy-log').log;
const bcrypt = require('bcryptjs');
const DB = require('./db.js');
const USERS_DB = new DB('users');
const { createLoginJWT } = require('./auth-utils');
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (await areCredentialsValid(username, password)) {
      const token = createLoginJWT({ username });
      log.info(`${username} login success`);
      return res.status(200).send({data: { token }});
    } else {
      log.info(`${username} login fail`);
      return res.status(401).send({ data: 'Invalid Credentials' });
    }
  } catch (error) {
    log.info(`${username} login failure`);
    return res.status(401).send({ data: 'Could not login user' });
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
      username == process.env.T_USER1 &&
      password == process.env.T_USER1_PASSWORD
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
  const token = createLoginJWT({ username });
  return res.status(200).send({data: { token }});
};

module.exports = {
  areCredentialsValid,
  doesUserExist,
  extendSession,
  findUserByUsername,
  hashPassword,
  isSuperAdmin,
  login,
  USERS_DB,
};
