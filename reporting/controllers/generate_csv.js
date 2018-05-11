/**
 * This file generates a CSV file.
 *
 * Module: generateCSV
 */

/**
 * Module dependencies
 */

const chalk = require('chalk');
const Excel = require('exceljs');
const PouchDB = require('pouchdb');

/**
 * Local dependency.
 */

const dbQuery = require('./../utils/dbQuery');
const Settings = require('./../../server/Settings');

const DB_URL =  `http://${Settings.T_ADMIN}:${Settings.T_PASS}@${Settings.T_COUCH_HOST}/db/`;


/**
 * Generates a CSV file.
 *
 * Example:
 *
 *    POST  /generate_csv/:id/:db_name/:year?/:month?
 *    GET   /generate_csv/:id/:db_name/:year?/:month?
 *
 *  where id refers to the id of the generated document in the result database.
 *  and db_name is the result database name
 *  year and month are the respective year and month the result was conducted.
 *
 * Response:
 *
 *  Returns a csv file to be downloaded.
 *
 * @param req - HTTP request object
 * @param res - HTTP response object
 */

exports.generate = function(req, res) {
  let groupName = req.params.db_name || req.body.resultDb;
  let resultDb = groupName.includes('http') ? groupName : DB_URL + groupName + '-result';

  const RESULT_DB = new PouchDB(resultDb);
  const resultId = req.params.id;
  const resultYear = req.params.year;
  let resultMonth = req.params.month;
  resultMonth = resultMonth ? resultMonth : false;
  resultMonth = resultMonth ? resultMonth[0].toUpperCase() + resultMonth.substr(1, 2) : false;

  let queryId = resultMonth && resultYear ? `${resultId}_${resultYear}_${resultMonth}` : resultId;

  RESULT_DB.get(resultId)
    .then(async(colHeaders) => {
      const result = await dbQuery.getProcessedResults(queryId, resultDb);
      generateCSV(colHeaders, result, res);
    })
    .catch((err) => res.send(err));
}

/**
 * This function creates a CSV file.
 *
 * @param {Object} columnData – column headers
 * @param {Array} resultData – the result data.
 * @param {Object} res – response object.
 *
 * @returns {file} – generated csv file.
 */

const generateCSV = function(columnData, resultData, res) {
  const FILENAME = columnData.name.replace(/\s/g, '_');
  let workbook = new Excel.Workbook();
  workbook.creator = 'Tangerine';

  let excelSheet = workbook.addWorksheet('Tangerine Sheet', {
    views: [{ xSplit: 1 }],
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Add column headers and define column keys
  excelSheet.columns = columnData.column_headers;

  // Add rows by key-value using the column keys
  resultData.forEach(row => {
    excelSheet.addRow(row.doc.processed_results);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${FILENAME}.xlsx`);
  workbook.xlsx.write(res).then(function(data) {
    console.log(chalk.green(`✓ You have successfully created ${FILENAME}.xlsx file at ${new Date()}`));
    res.end();
  });
}

exports.generateCSV = generateCSV;
