const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async function routeGroupResponses(req, res) {
  try {
    const groupDb = new DB(req.params.groupId)
    let options = {key: req.params.formId, include_docs: true, descending: true}
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    const results = await groupDb.query('responsesByStartUnixTime', options);
    const docs = results.rows.map(row => row.doc)
    res.send(docs)
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}