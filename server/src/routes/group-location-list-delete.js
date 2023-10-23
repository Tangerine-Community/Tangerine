const fs = require('fs')
const util = require('util')
const existsSync = util.promisify(fs.existsSync)
const removeFile = util.promisify(fs.unlink)
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const groupId = req.params.groupId
  const locationInfo = req.body
  
  try {
    const locationsPath = `/tangerine/client/content/groups/${groupId}/locations/${locationInfo.id}.json`
    if (existsSync(locationsPath)) {
      await removeFile(locationsPath)
    }
  } catch (err) {
    log.error(err);
    res.status(500).send(err);
  }
  res.send({status: 'ok'})
}