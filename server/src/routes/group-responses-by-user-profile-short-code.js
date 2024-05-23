const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    const userProfileShortCode = req.params.userProfileShortCode
    let options = { key: userProfileShortCode, include_docs: true }
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    if (req.query.totalRows) {
      options.limit = 1
      options.skip = 0
      const results = await groupDb.query('responsesByUserProfileShortCode', options);
      res.send({ totalRows: results.total_rows })
    } else if (req.query.userProfile) {
     
      await groupDb.query("userProfileByUserProfileShortCode", { limit: 0 });
      const profile = await groupDb.query("userProfileByUserProfileShortCode", { key: userProfileShortCode, limit: 1, include_docs: true });
      res.send(profile.rows[0])
    } else {
      const results = await groupDb.query('responsesByUserProfileShortCode', options);
      const docs = results.rows.map(row => row.doc)
      res.send(docs)
    }
  } catch (error) {
    console.log(error)
    log.error(error);
    res.status(500).send(error);
  }
}