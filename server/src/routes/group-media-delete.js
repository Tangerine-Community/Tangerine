const log = require('tangy-log').log
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const sanitize = require('sanitize-filename');

module.exports = async (req, res) => {
  console.log("deleting media", req.body.paths)
  for (let path of req.body.paths) {
    await exec(`rm /tangerine/client/content/groups/${req.params.group}/media/${sanitize(path.replace('./assets/media/', '')).replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
}
