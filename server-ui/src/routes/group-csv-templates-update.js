const PouchDB = require('pouchdb')

module.exports = async (req, res) => {
  const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-csv-templates`) 
  console.log(req.body)
  const doc = await db.put(req.body)
  return res.send(doc)
}