const PouchDB = require('pouchdb')

module.exports = async (req, res) => {
  const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-csv-templates`) 
  const doc = await db.get(req.params.templateId)
  return res.send(doc)
}