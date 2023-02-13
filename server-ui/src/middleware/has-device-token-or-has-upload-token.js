const PouchDB = require("pouchdb");
const log = require('tangy-log').log
    
module.exports = async function (req, res, next) {
  async function tokenDoesMatch(groupId, deviceId, token) {
    console.log("tokenDoesMatch:  for " + groupId + " " + deviceId + " " + token);
    const groupDevicesDb = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${groupId}-devices`)
    // const groupDevicesDb = this.getGroupDevicesDb(groupId)
    const device = await groupDevicesDb.get(deviceId)
    return device.token === token ? true : false
  }

  if ((req.headers.authorization && req.headers.authorization === process.env.T_UPLOAD_TOKEN)) {
    return next();
  }
  // Next step - check if the device has a token
  console.log("req.headers:  for " + JSON.stringify(req.headers));
  const groupId = req.header('groupId')
  const deviceId = req.header('deviceId')
  const deviceToken = req.header('deviceToken')
  console.log("headers for " + groupId + " " + deviceId + " " + deviceToken);
  let isMatching
  try {
    isMatching = await tokenDoesMatch(groupId, deviceId, deviceToken);
  } catch (e) {
    log.error(e)
    return res.status(500).send({
      error: 'Error checking device token'
    })
  }
  console.log("isMatching: " + isMatching + " for " + groupId + " " + deviceId + " " + deviceToken);
  if (isMatching) {
    return next();
  }
  let errorMessage = `Permission denied at ${req.url}`;
  log.warn(errorMessage)
  res.status(401).send(errorMessage)
}
