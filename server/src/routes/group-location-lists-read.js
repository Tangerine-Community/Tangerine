const path = require('path')
const fs = require('fs')
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const log = require('tangy-log').log

/*
 * This script compiles and returns metadata about location list files in the group directory.
 * Before multiple location lists were allowed, the file named 'location-list.json' lived in the
 * client directory. This script looks for that file and adds the metadata to the returned list if 
 * it exists. It also looks for a folder called 'locations' in the group directory and gets the metadata
 * from any JSON files in that directory. 
 */

module.exports = async (req, res) => {
  const fileMetadata = []

  function getFileMetadata(fullPath, filePath) {    
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const fileData = JSON.parse(fileContents)

    // if it has locationsLevels and locations, it is probably a location list file
    if (!!fileData.locationsLevels && !!fileData.locations) {
      const locationName = fileData.name ? fileData.name : path.parse(filePath).name
      const fileId = fileData.id ? fileData.id : locationName
      return {
        id: fileId,
        name: locationName,
        path: filePath,
        ...fileData
      }
    }
  
  }

  const groupDir = `/tangerine/client/content/groups/${req.params.groupId}`
  try {
    const locationListFilePath = 'location-list.json'
    const locationListFullPath = path.join(groupDir, locationListFilePath)
    if (fs.existsSync(locationListFullPath)) {
      const metadata = getFileMetadata(locationListFullPath, locationListFilePath)
      if (metadata) {
        fileMetadata.push(metadata)
      }
    }

    const locationsDir = path.join(groupDir, 'locations')
    if (fs.existsSync(locationsDir)) {
      const list = await readDir(locationsDir, {withFileTypes: true})
      if (list && list.length > 0) {
        for (let dirent of list) {
          const fileName = dirent.name
          if (path.extname(fileName) == ".json") {
            const fullPath = path.join(locationsDir, fileName)
            const filePath = `locations/${fileName}`
            const metadata = getFileMetadata(fullPath, filePath)
            if (metadata) {
              fileMetadata.push(metadata)
            }
          }
        }
      }
    }
    return res.send(fileMetadata)
  } catch (err) {
    log.error(`Error reading location list: ${err}`)
    return res.status(500).send(err)
  }
}