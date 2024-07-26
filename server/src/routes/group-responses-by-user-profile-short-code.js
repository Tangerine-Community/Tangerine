const DB = require('../db.js')
const log = require('tangy-log').log

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    const userProfileShortCode = req.params.userProfileShortCode
    let options = { key: userProfileShortCode }
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    if (req.query.totalRows) {
      const results = await groupDb.query('responsesByUserProfileShortCode', { key: userProfileShortCode, limit: 1,skip: 0, include_docs: false, reduce: true, group: true });
      res.send({ totalDocs: results.rows[0].value })
    } else {
      const results = await groupDb.query('responsesByUserProfileShortCode', { ...options, include_docs: true, reduce: false });
      const docs = results.rows.map(row => row.doc)
      res.send(docs)
    }
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}