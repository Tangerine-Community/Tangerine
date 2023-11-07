const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const existsSync = util.promisify(fs.existsSync)
const removeFile = util.promisify(fs.unlink)
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const groupId = req.params.groupId
  const locationInfo = req.body

  if (locationInfo.id == 'location-list') {
    // Clear the the Default Location List
    try {
      await writeFile(`/tangerine/client/content/groups/${groupId}/location-list.json`, JSON.stringify({
        "id": "location-list",
        "name": "Default Location List",
        "locationsLevels": [],
        "locations": {},
        "metadata": {}
      }))
    } catch (err) {
      log.error(err);
      res.status(500).send(err);
    }
  } else {  
    try {
      const locationsPath = `/tangerine/client/content/groups/${groupId}/locations/${locationInfo.id}.json`
      if (existsSync(locationsPath)) {
        await removeFile(locationsPath)
      }
    } catch (err) {
      log.error(err);
      res.status(500).send(err);
    }
  }
  res.send({status: 'ok'})
}