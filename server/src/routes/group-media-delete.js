const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const stat = util.promisify(require('fs').stat)
const execFile = util.promisify(require('child_process').execFile)
const sanitize = require('sanitize-filename');

module.exports = async (req, res) => {
  // Sanitize the group parameter to prevent path traversal
  const sanitizedGroup = sanitize(req.params.group);
  
  for (let path of req.body.paths) {
    const sanitizedPath = sanitize(path.replace('./assets/media/', ''));
    const fullPath = `/tangerine/client/content/groups/${sanitizedGroup}/media/${sanitizedPath}`;
    
    // Use execFile with argument array instead of shell string for better security
    await execFile('rm', [fullPath]);
  }
  res.send()
}