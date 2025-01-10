const DB = require('../db.js')
const log = require('tangy-log').log

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    const userProfileShortCode = req.params.userProfileShortCode

    const result = await groupDb.query("userProfileByUserProfileShortCode", { key: userProfileShortCode, limit: 1, include_docs: true });
    const profile = result.rows[0]
    const data = profile ? {_id: profile.id, key: profile.id, formId: profile.doc.form.id, collection: profile.doc.collection} : undefined
    res.send(data)

  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}