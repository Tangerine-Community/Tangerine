const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

module.exports = async (req, res) => {
  try {
    const groupDb = new DB(req.params.groupId)
    let options = {key: req.params.formId, include_docs: true, descending: true}
    if (req.params.limit) {
      options.limit = req.params.limit
    }
    if (req.params.skip) {
      options.skip = req.params.skip
    }
    if (Object.keys(req.query).length < 1 ){
      const results = await groupDb.query('responsesByStartUnixTime', options);
      const docs = results.rows.map(row => row.doc)
      res.send(docs)
    } else{
      try {
        await groupDb.get('_design/searchViews');
      } catch (error) {
        console.log(error)
        if (error.name === 'not_found') {
          await importViews(groupDb);
        } else {
          return false;
        }
    }
      const results = await groupDb.query('searchViews/responseByFormID', {include_docs: true, startkey:req.query.id,endkey: `${req.query.id}\ufff0`,});
      const docs = results.rows.map(row => row.doc)
      res.send(docs)
    }
  } catch (error) {
    log.error(error);
    res.status(500).send(error);
  }
}

export const importViews = async (db) => {
  await db.put({
    _id: "_design/searchViews",
    views: {
      responseByFormID: {
        map: function (doc) {
          if (doc.collection === "TangyFormResponse") {
              emit(doc._id, true);
          }
      }.toString(),
      }
    }
  });
  await db.query("searchViews/responseByFormID", { limit: 0 });
};