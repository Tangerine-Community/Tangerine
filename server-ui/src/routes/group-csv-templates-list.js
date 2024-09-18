const PouchDB = require('pouchdb')

module.exports = async (req, res) => {
  const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-csv-templates`)
  const all_docs = await db.allDocs({include_docs:true})
  return res.send(all_docs.rows.map(row => row.doc))
}