const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    let options = {include_docs: true}
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    let results = undefined;
    if (Object.keys(req.query).length < 1 ) {
      // get all responses for a form
      options.key = req.params.formId;
      options.descending = true;
      results = await groupDb.query('responsesByStartUnixTime', options);
    } else {
      // searh options by document id
      options.startkey = req.query.id;
      options.endkey = `${req.query.id}\ufff0`;
      results = await groupDb.allDocs(options);
    }
    if (results) {
      const docs = results.rows.map(row => { if (row.doc && row.doc.collection == "TangyFormResponse") { return row.doc } });
      res.send(docs)
    }
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}