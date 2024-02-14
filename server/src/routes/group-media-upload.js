const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const stat = util.promisify(require('fs').stat)
const access = util.promisify(require('fs').access)
const exec = util.promisify(require('child_process').exec)

module.exports = async (req, res) => {
  try {
    await access(`/tangerine/client/content/groups/${req.params.group}/media`)
  } catch (e) {
    await exec(`mkdir /tangerine/client/content/groups/${req.params.group}/media`)
  }
  for (let file of req.files) {
    await exec(`mv ${file.path} /tangerine/client/content/groups/${req.params.group}/media/${file.originalname.replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
 
}