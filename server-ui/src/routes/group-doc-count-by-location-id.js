const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log


module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    let options = {keys: [ req.params.locationId ], reduce: true, group: true}
    const results = await groupDb.query('docCountByLocationId', options);
    const count = results.rows[0]
        ? results.rows[0].value
        : 0
    res.send(`${count}`)
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}