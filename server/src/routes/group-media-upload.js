const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const stat = util.promisify(require('fs').stat)
const exec = util.promisify(require('child_process').exec)

module.exports = async (req, res) => {
  for (let file of req.files) {
    await exec(`mv ${file.path} /tangerine/client/content/groups/${req.params.group}/media/${file.originalname.replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
 
}