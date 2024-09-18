const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const mkDir = util.promisify(fs.mkdir)
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const locationInfo = req.body

  try {
    const locationsDir = `/tangerine/groups/${req.params.groupId}/client/locations`
    const dirExists =  fs.existsSync(locationsDir)
    if (!dirExists) {
      await mkDir(locationsDir)
    }

    const locationsPath = path.join(locationsDir, `${locationInfo.id}.json`)
    await writeFile(locationsPath, JSON.stringify(locationInfo))

    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).send(err);
  }
}