var express = require('express');
var router = express.Router();
const dataGenerator = require('./data-generator.js')

router.get('/get-table', async function(req, res) {
  try {
    if (req.query.groupId && req.query.formId) {
      const groupId = req.query.groupId.replace(/-/g, '');
      const formId = req.query.formId.replace(/-/g, '_');
      const results = await dataGenerator.getTableData(groupId, formId);
      res.json(results);
    } else {
      res.status(500).json({ error: '/get-table requires groupId and formId query parameters' });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

router.get('/get-view', async function(req, res) {
  try {
    if (req.query.groupId && req.query.viewId) {
      const groupId = req.query.groupId.replace(/-/g, '');
      const viewId = req.query.viewId;
      const results = await dataGenerator.getTableData(groupId, viewId);
      res.json(results);
    } else {
      res.status(500).json({ error: '/get-view requires groupId and viewId query parameters' });
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});


module.exports = router;
