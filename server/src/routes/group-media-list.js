const DB = require('../db.js')
const clog = require('tangy-log').clog
const log = require('tangy-log').log
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const mkDir = util.promisify(require('fs').mkdir)
const stat = util.promisify(require('fs').stat)
// source: https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

module.exports = async (req, res) => {
  async function listFiles() {
    const list = await readDir(`/tangerine/client/content/groups/${req.params.group}/media`, {withFileTypes: true})
    const files = []
    for (let dirent of list) {
      files.push({
        path: `./assets/media/${dirent.name}`,
        size: formatBytes((await stat(`/tangerine/client/content/groups/${req.params.group}/media/${dirent.name}`)).size)
      })
    }
    return res.send(files)
  }

  try {
    return await listFiles();
  } catch (e) {
    {
      if (e && e.code === 'ENOENT') {
        //     await exec(`mkdir /tangerine/client/content/groups/${req.params.group}/media`)
        const dir = await mkDir(`/tangerine/client/content/groups/${req.params.group}/media`)
        return await listFiles();
      } else {
        console.log(e)
        res.send(e)
      }
      
    }
  }
  
}