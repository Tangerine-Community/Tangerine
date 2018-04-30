/**
 * Main App Entry Point.
 */

/**
 * Module dependencies.
 */

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');

/**
 * Create Express Server.
 */

const app = express();

/**
 * Express configuration.
 */

app.set('port', 5555);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

/**
 * Controllers.
 */

const assessmentController = require('./controllers/assessment');
const resultController = require('./controllers/result');
const workflowController = require('./controllers/workflow');
const csvController = require('./controllers/generate_csv');
const changesController = require('./controllers/changes');
const tripController = require('./controllers/trip');


/**
 * App routes.
 */

app.get('/', (req, res) => res.render('index'));

app.post('/download_csv', (req, res) => {
  const resultDbUrl =  dbConfig.result_db;
  const resultId = req.body.workflowId;
  const resultYear = req.body.year;
  let resultMonth = req.body.month;
  resultMonth = resultMonth ? resultMonth : false;

  let queryId = resultMonth && resultYear ? `${resultId}_${resultYear}_${resultMonth}` : resultId;

  dbQuery.retrieveDoc(resultId, resultDbUrl)
    .then(async docHeaders => {
      const result = await dbQuery.getProcessedResults(queryId, resultDbUrl);
      generateCSV(docHeaders, result, res);
    })
    .catch(err => res.send(err));

});

app.post('/assessment', assessmentController.all);
app.post('/assessment/headers/all', assessmentController.generateAll);
app.post('/assessment/headers/:id', assessmentController.generateHeader);

app.post('/result', resultController.all);
app.post('/assessment/result/:id', resultController.processResult);

app.post('/workflow', workflowController.all);
app.post('/workflow/headers/all', workflowController.generateAll);
app.post('/workflow/headers/:id', workflowController.generateHeader);

app.post('/workflow/result/:id', tripController.processResult);

app.post('/generate_csv/:id/:year?/:month?', csvController.generate);
app.post('/tangerine_changes', changesController.changes);
app.post('/get_processed_results/:id', dbQuery.processedResultsById);


/**
 * Error Handler.
 */

app.use(errorHandler());

/**
 * Start Express server.
 */

app.listen(app.get('port'), () => {
  console.log('%s Tangerine Reporting server listening on port %d.', chalk.green('✓'), app.get('port'));
});

module.exports = app;
