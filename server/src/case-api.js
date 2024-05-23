const DB = require('./db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log

getEventFormData = async (req, res) => {
  const groupDb = new DB(req.params.groupId)
  let data = {}
  try {
    let options = { key: req.params.eventFormId, include_docs: true }
    const results = await groupDb.query('eventForms/eventForms', options);
    if (results.rows.length > 0) {
      const doc = results.rows[0].doc
      for (let event of doc.events) {
        let eventForm = event.eventForms.find((f) => f.id === req.params.eventFormId);
        if (eventForm) {
          data = eventForm
          break;
        }
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
  res.send(data)
}

module.exports = {
  getEventFormData
}