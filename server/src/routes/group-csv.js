const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const sanitize = require('sanitize-filename');
const util = require('util')
const exec = util.promisify(require('child_process').exec)

module.exports = async function (req, res) {
  const groupId = sanitize(req.params.groupId)
  const formId = sanitize(req.params.formId)
  let sanitizedExtension = ''
  if (req.originalUrl.includes('-sanitized')) {
    sanitizedExtension = '-sanitized'
  }
  let dbName = `${groupId}-reporting${sanitizedExtension}`;
  const fileName = `${groupId}-${formId}${sanitizedExtension}-${Date.now()}.csv`
  let outputPath = `/csv/${fileName}`
  const batchSize = (process.env.T_CSV_BATCH_SIZE) ? process.env.T_CSV_BATCH_SIZE : 5
  console.log("req.originalUrl " + req.originalUrl + " outputPath: " + outputPath + " dbName: " + dbName);
  
  const sleepTimeBetweenBatches = 0
  let cmd = `cd /tangerine/server/src/scripts/generate-csv/ && ./bin.js ${dbName} ${formId} ${outputPath} ${batchSize} ${sleepTimeBetweenBatches}`
  if (req.params.year && req.params.month) {
    cmd += ` ${sanitize(req.params.year)} ${sanitize(req.params.month)}`
  }
  log.info(`generating csv start: ${cmd}`)
  exec(cmd).then(status => {
    log.info(`generate csv done: ${JSON.stringify(status)}`)
  }).catch(error => {
    log.error(error)
  })
  res.send({
    stateUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName.replace('.csv', '.state.json')}`,
    downloadUrl: `${process.env.T_PROTOCOL}://${process.env.T_HOST_NAME}/csv/${fileName}`
  })
}
