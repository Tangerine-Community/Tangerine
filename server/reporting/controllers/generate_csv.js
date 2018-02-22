/**
 * This file generates a CSV file.
 *
 * Module: generateCSV
 */

/**
 * Module dependencies
 */

const _ = require('lodash');
const chalk = require('chalk');
const Excel = require('exceljs');
const PouchDB = require('pouchdb');

/**
 * Local modules.
 */

const dbQuery = require('./../utils/dbQuery');
const dbConfig = require('./../config');

// Initialize database
const RESULT_DB = new PouchDB(dbConfig.result_db);

/**
 * Generates a CSV file.
 *
 * Example:
 *
 *    POST /generate_csv/:id
 *
 *  where id refers to the id of the generated document in the result database.
 *
 *  The request object must contain the result database url.
 *      {
 *        "result_db_url": "http://admin:password@test.tangerine.org/database_name"
 *      }
 *
 * Response:
 *
 *  Returns an object containing a success message.
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.generate = (req, res) => {
  RESULT_DB.get(req.params.id)
    .then(async(docHeaders) => {
      const result = await dbQuery.getProcessedResults(req.params.id);
      generateCSV(docHeaders, result);
      res.json({ message: 'CSV Successfully Generated' });
    })
    .catch((err) => res.send(err));
}

/**
 * This function creates a CSV file.
 *
 * @param {Object} columnData – column headers
 * @param {Array} resultData – the result data.
 *
 * @returns {Object} – generated response
 */

const generateCSV = function(columnData, resultData) {
  let workbook = new Excel.Workbook();
  workbook.creator = 'Brockman';
  workbook.lastModifiedBy = 'Matthew';
  workbook.created = new Date(2018, 9, 2);
  workbook.modified = Date.now();
  workbook.lastPrinted = new Date(2018, 7, 27);

  let excelSheet = workbook.addWorksheet('Workflow Sheet', {
    views: [{ xSplit: 1 }], pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Add column headers and define column keys
  excelSheet.columns = columnData.column_headers;

  // Add rows by key-value using the column keys
  _.each(resultData, (row) => {
    excelSheet.addRow(row.doc.processed_results);
  });

  let creationTime = new Date().toISOString();
  let filename = `testcsvfile-${creationTime}.xlsx`;

  // create and fill Workbook;
  workbook.xlsx.writeFile(filename, 'utf8')
    .then(() => {
      console.log(chalk.green(`✓ You have successfully created a new excel file at ${new Date()}`));
    })
    .catch((err) => err);

}

exports.generateCSV = generateCSV;
