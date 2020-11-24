/**
 * This file creates headers for CSV, processes the form response
 * and saves them into the result database.
 *
 *  Modules: generateHeaders, processFormResponse, saveProcessedFormData
 */


/**
 * Module dependencies.
 */

const PouchDB = require('pouchdb');
const tangyModules = require('../modules/index.js')()

const CODE_SKIP = '999'

let DB = PouchDB.defaults({
  prefix: process.env.T_COUCHDB_ENDPOINT
});

// Function to pass to PouchDbChangesFeedWorker.
exports.changeProcessor = (change, sourceDb) => {
  return new Promise((resolve, reject) => {
    sourceDb.get(change.id)
      .then(doc => {
        switch (doc.collection) {
          case 'TangyFormResponse':
            if (process.env.T_PAID_ALLOWANCE !== 'unlimited' && !doc.paid) {
              resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name})
            } else {
              processFormResponse(doc, sourceDb)
                .then(_ => resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name}))
                .catch(error => { reject(error) })
            }
            break
          default:
            resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name})
        }
      })
      .catch(error => {
        console.log('Error in changeProcessor: ' + JSON.stringify(error))
        reject(new Error(error))
      })
  })
}

/** This function saves processed form response.
 *
 * @param {object} formData - form response from database
 * @param {string} resultDB - result database url
 *
 * @returns {object} - saved document
 */

const processFormResponse = async (doc, sourceDb) => {
  try {
    const hookResponse = await tangyModules.hook('reportingOutputs', {doc, sourceDb})
  } catch (error) {
    console.error(error)
    throw new Error(`Error processing doc ${doc._id} in db ${sourceDb.name}: ${JSON.stringify(error,replaceErrors)}`)
  }
};

function replaceErrors(key, value) {
  if (value instanceof Error) {
    var error = {};
    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = value[key];
    });
    return error;
  }
  return value;
}

