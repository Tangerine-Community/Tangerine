var express = require('express');
var router = express.Router();
const dataGenerator = require('./data-generator.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(`
    <h2>API Index:</h2>
    <div>
    <div>
      <p><a href="/get-table?groupId=groupc95a711880df4875a46646e4b40af512&formId=form_ee17ac29_a21b_4ef8_a62f_af0f314d2c6c">Get Table Test</a></p>
      <p><a href="/get-view?groupId=groupf4881f8ad4964a939d3eb903cd0d63bf&viewId=attendance_view">Get View Test</a></p>
    </div>
  `);
});

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
