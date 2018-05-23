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

let DB = {}
if (process.env.T_COUCHDB_ENABLE === 'true') {
  DB = PouchDB.defaults({
    prefix: process.env.T_COUCHDB_ENDPOINT
  });
} else {
  DB = PouchDB.defaults({
    prefix: '/tangerine/db/'
  });
}

/**
 * This function retrieves all processed result for a given form id
 *
 * @param {string} formId - id of document.
 * @param {string} resultDB - result database url.
 *
 * @returns {Array} - result documents.
 */

function getResultsByFormId(formId, db) {
  return new Promise((resolve, reject) => {
    db.query('tangy-reporting/resultsByGroupFormId', { key: formId, include_docs: true })
      .then(body => resolve(body.rows))
      .catch(err => reject(err));
  });
}


/**
 * This function creates a CSV file.
 *
 * @param {string} formId – form id
 * @param {string} resultDB – the result database.
 * @param {Object} res – response object.
 *
 * @returns {Object} – csv file
 */

const generateCSV = async function (formId, resultDB, res) {
  const RESULT_DB = new DB(resultDB);
  let workbook = new Excel.Workbook();
  let excelSheet = workbook.addWorksheet('Tangerine Sheet', {
    views: [{ xSplit: 1 }],
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });
  workbook.creator = 'Tangerine';

  // Fetch column headers
  let columnData = await RESULT_DB.get(formId);

  // Fetch processed form result
  let resultData = await getResultsByFormId(formId, RESULT_DB);

  const FILENAME = columnData._id;

  // Add column headers and define column keys
  excelSheet.columns = columnData.columnHeaders;

  // Add rows by key-value using the column keys
  resultData.forEach(function (row) {
    excelSheet.addRow(row.doc.processedResult);
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${FILENAME}.xlsx`);

  workbook.xlsx.write(res).then(function (data) {
    console.log(chalk.green(`✓ You have successfully created "${FILENAME}.xlsx" file at ${new Date()}`));
    res.end();
  });

}

exports.generateCSV = generateCSV;
