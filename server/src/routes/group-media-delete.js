const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const stat = util.promisify(require('fs').stat)
const exec = util.promisify(require('child_process').exec)
const sanitize = require('sanitize-filename');

module.exports = async (req, res) => {
  for (let path of req.body.paths) {
    await exec(`rm /tangerine/client/content/groups/${req.params.group}/media/${sanitize(path).replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
}