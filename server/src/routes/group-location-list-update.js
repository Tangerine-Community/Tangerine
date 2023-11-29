const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const existsSync = util.promisify(fs.existsSync)
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const locationInfo = req.body

  const groupDir = `/tangerine/client/content/groups/${req.params.groupId}/`

  if (locationInfo && locationInfo.id == "location-list.json") {
    var locationsPath = path.join(groupDir, locationInfo.locationId)
  } else {
    try {
      var locationsDir = path.join(groupDir, 'locations')
      if (!existsSync(locationsDir)) {
        await fs.mkdir(locationsDir)
      }
    } catch (err) {
      log.error(err);
      res.status(500).send(err);
    }

    var locationsPath = path.join(locationsDir, `${locationInfo.id}.json`)
  }


  try {
    await writeFile(locationsPath, JSON.stringify(locationInfo))

    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).send(err);
  }
}