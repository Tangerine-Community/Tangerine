const util = require('util')
const access = util.promisify(require('fs').access)
const exec = util.promisify(require('child_process').exec)
const md5File = require('md5-file')

module.exports = async (req, res) => {
  try {
    await access(`/tangerine/client/content/groups/${req.params.group}/client-uploads`)
  } catch (e) {
    await exec(`mkdir /tangerine/client/content/groups/${req.params.group}/client-uploads`)
  }
  const uploadedMd5 = req.body['md5']
  for (let file of req.files) {
    const fileMd5 = await md5File(file.path)
    if (fileMd5 !== uploadedMd5) {
      console.error('md5 mismatch')
      res.statusMessage = 'File upload error: Invalid MD5';
      res.status(400).send('Invalid MD5')
      return
    }
    await exec(`mv ${file.path} /tangerine/client/content/groups/${req.params.group}/client-uploads/${file.originalname.replace(/(\s+)/g, '\\$1')}`)
  }
  res.send()
 
}