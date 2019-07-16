const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const stat = util.promisify(require('fs').stat)
const exec = util.promisify(require('child_process').exec)

// source: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

module.exports = async (req, res) => {
  console.log(req.files) 
  for (let file of req.files) {
    await exec(`mv ${file.path} /tangerine/client/content/groups/${req.params.group}/media/${file.originalname.replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
  /*
  const list = await readDir(`/tangerine/client/content/groups/${req.params.group}/media`, {withFileTypes: true})
  const files = []
  for (let filePath of list) {
    files.push({
      path: filePath,
      size: formatBytes((await stat(`/tangerine/client/content/groups/${req.params.group}/media/${filePath}`)).size)
    })
  }
  return res.send(files)
  */
}