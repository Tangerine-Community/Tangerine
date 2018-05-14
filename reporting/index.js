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

// get all routes
app.post('/assessment', assessmentController.all);
app.post('/result', resultController.all);
app.post('/workflow', workflowController.all);

// result routes
app.post('/assessment/result/:id', resultController.processResult);
app.post('/workflow/result/:id', tripController.processResult);

// header routes
app.post('/assessment/headers/all', assessmentController.generateAll);
app.post('/workflow/headers/all', workflowController.generateAll);
app.post('/assessment/headers/:id', assessmentController.generateHeader);
app.post('/workflow/headers/:id', workflowController.generateHeader);

// csv routes
app.get('/generate_csv/:id/:db_name/:year?/:month?', csvController.generate);
app.post('/generate_csv/:id/:db_name/:year?/:month?', csvController.generate);

// changes feed route
app.post('/tangerine_changes', changesController.changes);


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
