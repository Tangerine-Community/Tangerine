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
      const results = await groupDb.query('totalDocsByUserProfileShortCode', { key: userProfileShortCode, limit: 1,skip: 0, include_docs: false, reduce:true, group:true });
      res.send({ totalDocs: results.rows[0].value })
    } else if (req.query.userProfile) {
      await groupDb.query("userProfileByUserProfileShortCode", { limit: 0 });
      const result = await groupDb.query("userProfileByUserProfileShortCode", { key: userProfileShortCode, limit: 1, include_docs: true });
      const profile = result.rows[0]
      const data = profile ? {_id: profile.id, key: profile.id, formId: profile.doc.form.id, collection: profile.doc.collection}: undefined
      res.send(data)
    } else {
      const results = await groupDb.query('responsesByUserProfileShortCode', options);
      const docs = results.rows.map(row => row.doc)
      res.send(docs)
    }
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}