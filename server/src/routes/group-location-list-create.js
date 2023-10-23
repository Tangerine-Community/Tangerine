const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const existsSync = util.promisify(fs.existsSync)
const log = require('tangy-log').log

module.exports = async (req, res) => {
  const locationInfo = req.body

  try {
    const locationsDir = `/tangerine/client/content/groups/${req.params.groupId}/locations`
    if (!existsSync(locationsDir)) {
      await fs.mkdir(locationsDir)
    }

    const locationsPath = path.join(locationsDir, `${locationInfo.id}.json`)
    await writeFile(locationsPath, JSON.stringify(locationInfo))
  } catch (err) {
    log.error(err);
    res.status(500).send(err);
  }
}