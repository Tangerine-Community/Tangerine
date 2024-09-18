const PouchDB = require('pouchdb')

module.exports = async (req, res) => {
  const db = new PouchDB(`${process.env.T_COUCHDB_ENDPOINT}/${req.params.groupId}-csv-templates`)
  const response = await db.post({
    title: '',
    formId: '',
    headers: []
  })
  const doc = await db.get(response.id)
  return res.send(doc)
}