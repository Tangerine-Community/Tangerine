#!/usr/bin/env node

/**
 * CLI App Entry Point.
 */

/**
 * Module dependencies.
 */

const tangerine = require('commander');
const chalk = require('chalk');
const PouchDB = require('pouchdb');

/**
 * Local Dependencies.
 */

const createColumnHeaders = require('./controllers/assessment').createColumnHeaders;
const processAssessmentResult = require('./controllers/result').generateResult;
const createWorkflowHeaders = require('./controllers/workflow').createWorkflowHeaders;
const processWorkflowResult = require('./controllers/trip').processWorkflowResult;
const generateCSV = require('./controllers/generate_csv').generateCSV;

const dbQuery = require('./utils/dbQuery');
const dbConfig = require('./config');

/******************************************
 *  HELPER FUNCTIONS FOR GENERATING AND   *
 *      SAVING HEADERS AND RESULTS        *
 ******************************************
 */


/**
 * @description This function creates and saves assessment headers.
 *
 * @param {Array} data - database documents to be processed.
 *
 * @returns {Object} - database response
 */

async function generateAssessmentHeaders(data) {
  let response;
  for (item of data) {
    let assessmentId = item.doc.assessmentId;
    let generatedHeaders = await createColumnHeaders(item.doc);
    response = await dbQuery.saveHeaders(generatedHeaders, assessmentId);
    console.log(response);
  }
  return response;
}

/**
 * @description This function creates and saves workflow headers.
 *
 * @param {Array} data - database documents to be processed.
 *
 * @returns {Object} - database response
 */

async function generateworkflowHeaders(data) {
  let response;
  for (item of data) {
    let workflowId = item.id;
    let generatedWorkflowHeaders = await createWorkflowHeaders(item.doc);
    response = await dbQuery.saveHeaders(generatedWorkflowHeaders, workflowId);
    console.log(response);
  }
  return response;
}

/**
 * @description This function creates and saves assessment results.
 *
 * @param {Array} data - database documents to be processed.
 *
 * @returns {Object} - database response
 */

async function generateAssessmentResult(data) {
  let response;
  for (item of data) {
    let docId = item.assessmentId || item.curriculumId;
    let processedResult = await processAssessmentResult(docId);
    response = await dbQuery.saveResult(processedResult);
    console.log(response);
  }
  return response;
}

/**
 * @description This function creates and saves workflow results.
 *
 * @param {Array} data - database documents to be processed.
 *
 * @returns {Object} - database response
 */

async function generateWorkflowResult(data) {
  let response;
  for (item of data) {
    let resultDoc = [{ doc: item }];
    if (!item.tripId) {
      let docId = item.assessmentId || item.curriculumId;
      let assessmentResults = await processResult(resultDoc);
      response = await dbQuery.saveResult(assessmentResults);
      console.log(response);
    } else {
      let processedResult = await processWorkflowResult(resultDoc);
      response = await dbQuery.saveResult(processedResult);
      console.log(response);
    }
  }
  return response;
}

/**********************
 *  CLI APPLICATION   *
 **********************
 */

/**
 * @description This part retrieves all assessments in the database.
 * It is executed when the command `tangerine-reporting assessments` is run.
 */
tangerine
  .version('0.1.0')
  .command('assessments')
  .description('Retrieves all assessments in the database')
  .action(async () => {
    try {
      let assessments = await GROUP_DB.query('ojai/byCollection', { key: 'assessment', include_docs: true });
      console.log({ assessments: assessments.rows.length, count: assessments.rows.length });
      console.log(chalk.green('✓ Successfully retrieve all assessments'));
    } catch (err) {
      console.error(err);
    }
  });

/**
 * @description This part retrieves all workflow documents in the database.
 * It is executed when the command `tangerine-reporting workflows` is run.
 */
tangerine
  .version('0.1.0')
  .command('workflows')
  .description('Retrieves all workflows in the database')
  .action(async () => {
    try {
      let workflows = GROUP_DB.query('ojai/byCollection', { key: 'workflow', include_docs: true })
      console.log({ workflows: workflows.rows, count: workflows.rows.length });
      console.log(chalk.green('✓ Successfully retrieve all workflows'));
    } catch (err) {
      console.error(err);
    }
  });

/**
 * @description This part retrieves all result documents in the database.
 * It is executed when the command `tangerine-reporting results` is run.
 */
tangerine
  .version('0.1.0')
  .command('results')
  .description('Retrieves all results in the database')
  .action(async () => {
    try {
      let results = await GROUP_DB.query('ojai/byCollection', { key: 'result', include_docs: true })
      console.log({ results: results.rows.length, count: results.rows.length });
      console.log(chalk.green('✓ Successfully retrieve all results'));
    } catch (err) {
      console.error(err);
    }
  });

/**
 * @description This part generates an assessment header.
 * It is executed when the command `tangerine-reporting assessment-header <assessment_id>` is run.
 *
 * @param {string} id - assessment id is required.
 */
tangerine
  .version('0.1.0')
  .command('assessment-header <id>')
  .description('generate header for an assessment')
  .action(async (id) => {
    try {
      let data = await GROUP_DB.get(id);
      const docId = data.assessmentId || data.curriculumId;
      const colHeaders = await createColumnHeaders(data);
      const saveResponse = await dbQuery.saveHeaders(colHeaders, docId);
      console.log(saveResponse);
      console.log(chalk.green('✓ Successfully generate and save assessment header'));
    }
    catch(err) {
      console.error(err);
    }
  });

/**
 * @description This part processes an assessment result.
 * It is executed when the command `tangerine-reporting assessment-result <assessment_id>` is run.
 *
 * @param {string} id - assessment id is required.
 */
tangerine
  .version('0.1.0')
  .command('assessment-result <id>')
  .description('process result for an assessment')
  .action(async (id) => {
    try {
      let data = await GROUP_DB.get(id);
      let resultDoc = { doc: data };
      const result = processAssessmentResult(resultDoc);
      const saveResponse = await dbQuery.saveResult(result);
      console.log(saveResponse);
      console.log(chalk.green('✓ Successfully process and save assessment result'));
    }
    catch(err) {
      console.error(err);
    }
  });

/**
 * @description This part generates a workflow header.
 * It is executed when the command `tangerine-reporting workflow-header <workflow_id>` is run.
 *
 * @param {string} id - workflow id is required.
 */
tangerine
  .version('0.1.0')
  .command('workflow-header <id>')
  .description('generate headers for a workflow')
  .action(async (id) => {
    try {
      let doc = await GROUP_DB.get(id);
      let colHeaders = await createWorkflowHeaders(doc);
      const saveResponse = await dbQuery.saveHeaders(colHeaders, id);
      console.log(saveResponse);
      console.log(chalk.green('✓ Successfully generate and save workflow header'));
    } catch(err) {
      console.error(err);
    }
  });

/**
 * @description This part processes a workflow result.
 * It is executed when the command `tangerine-reporting workflow-result <workflow_id>` is run.
 *
 * @param {string} id - workflow id is required.
 */
tangerine
  .version('0.1.0')
  .command('workflow-result <id>')
  .description('process result for a workflow')
  .action((id) => {
    dbQuery.getTripResults(id).then(async (data) => {
      const result = processWorkflowResult(data);
      const saveResponse = await dbQuery.saveResult(result);
      console.log(saveResponse);
      console.log(chalk.green('✓ Successfully process and save workflow result'));
    })
    .catch((err) => console.error(err));
  });

/**
 * @description This part processes headers or results based on the flag passed to it.
 *
 * It is executed when the command `tangerine-reporting create-all [flags]` is run.
 * The various flags are required for this to execute.
 * E.g. run `tangerine-reporting create-all -w` => to generate all workflow headers in the database
 */
tangerine
  .version('0.1.0')
  .command('create-all')
  .description('create headers or results based on the collection type')
  .option('-a', '--assessment', 'create all assessment headers')
  .option('-r', '--result', 'process all assessment results')
  .option('-w', '--workflow', 'create all workflow headers')
  .option('-t', '--workflow-result', 'process all workflow results')
  .action((options) => {
    if (!options.A && !options.R && !options.W && !options.T) {
      console.log(chalk.red('Please select a flag either "-a", "-r", "-t", or "-w" flag along with your command. \n'));
    }
    if (options.A) {
      dbQuery.getAllAssessment(dbConfig.base_db)
        .then(async(data) => {
          await generateAssessmentHeaders(data);
          console.log(chalk.green('✓ Successfully generate and save all assessment headers'));
        }).catch((err) => Error(err));
    }
    if (options.W) {
      dbQuery.getAllWorkflow(dbConfig.base_db)
        .then(async(data) => {
          await generateworkflowHeaders(data);
          console.log(chalk.green('✓ Successfully generate and save all workflow headers'));
        }).catch((err) => Error(err));
    }
    if (options.R) {
      dbQuery.getAllResult(dbConfig.base_db)
        .then(async(data) => {
          await generateAssessmentResult(data);
          console.log(chalk.green('✓ Successfully processe and save all assessment results'));
        }).catch((err) => Error(err));
    }
    if (options.T) {
      dbQuery.getAllWorkflow(dbConfig.base_db)
        .then(async(data) => {
          await generateWorkflowResult(data);
          console.log(chalk.green('✓ Successfully generate and save all workflow results'));
        }).catch((err) => Error(err));
    }
  }).on('--help', function() {
    console.log(chalk.blue('\n Examples: \n'));
    console.log(chalk.blue('  $ tangerine-reporting create-all -a'));
    console.log(chalk.blue('  $ tangerine-reporting create-all -r'));
    console.log(chalk.blue('  $ tangerine-reporting create-all -t'));
    console.log(chalk.blue('  $ tangerine-reporting create-all -w \n'));
  });

/**
 * This part generates a csv file.
 * It is executed when the command `tangerine-reporting generate-csv <docId>` is run.
 *
 * @param {string} docId - workflow id  of the document
 */
tangerine
  .version('0.1.0')
  .command('generate-csv <docId>')
  .description('creates a csv file')
  .action((docId) => {
    RESULT_DB.get(docId).then(async (docHeaders) => {
      const result = await dbQuery.getProcessedResults(docId);
      await generateCSV(docHeaders, result);
      console.log(chalk.green('✓ CSV Successfully Generated'));
    })
    .catch((err) => console.error(err));
  });

/**
 * @description This part retrieves a document from the database.
 * It is executed when the command `tangerine-reporting get <id>` is run.
 *
 * @param {string} id - id of the document
 */
tangerine
  .version('0.1.0')
  .command('get <id>')
  .description('retrieve a document from the database')
  .action((id) => {
    GROUP_DB.get(id).then((data) => {
      console.log(data);
      console.log(chalk.green('✓ Successfully get document'));
    })
    .catch((err) => console.error(err));
  });

/**
 * @description This part retrieves all result by tripId.
 * It is executed when the command `tangerine-reporting get-result <id>` is run.
 *
 * @param {string} id - id of the result document
 */
tangerine
  .version('0.1.0')
  .command('get-processed-result <id>')
  .description('retrieve all processed results by id from the database')
  .action((id) => {
    dbQuery.getProcessedResults(id).then((data) => {
      console.log(data);
      console.log(chalk.green('✓ Successfully retrieved all processed results'));
    })
    .catch((err) => console.error(err));
  });


tangerine.parse(process.argv);

if (process.argv.length === 0) {
  tangerine.help();
}

console.log(chalk.green('✓ Tangerine Reporting CLI Tool'));
