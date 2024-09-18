const path = require('path')
const fs = require('fs')
const util = require('util')
const readDir = util.promisify(require('fs').readdir)
const log = require('tangy-log').log

/*
 * This script compiles and returns the data into location list files in the group directory.
 * Before multiple location lists were allowed, the file named 'location-list.json' lived in the
 * client directory. This script looks for that file and adds it's data to the returned list if 
 * it exists. It also looks for a folder called 'locations' in the group directory and gets the data
 * from any JSON files in that directory. 
 */

module.exports = async (req, res) => {
  const locationLists = []

  function getLocationListData(fullPath, filePath) {
    let locationData = {}
    
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const fileData = JSON.parse(fileContents)

    // if it has locationsLevels and locations, it is probably a location list file
    if (!!fileData.locationsLevels && !!fileData.locations) {
      const locationName = fileData.name ? fileData.name : path.parse(filePath).name
      const fileId = fileData.id ? fileData.id : locationName

      locationData = {
        id: fileId,
        name: locationName,
        path: filePath,
        ...fileData
      }
      return locationData
    }
  
  }

  const groupDir = `/tangerine/groups/${req.params.groupId}/client`
  try {
    const locationListFilePath = 'location-list.json'
    const locationListFullPath = path.join(groupDir, locationListFilePath)
    if (fs.existsSync(locationListFullPath)) {
      const data = getLocationListData(locationListFullPath, locationListFilePath)
      if (data) {
        locationLists.push(data)
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
            const data = getLocationListData(fullPath, filePath)
            if (data) {
              locationLists.push(data)
            }
          }
        }
      }
    }
    return res.send(locationLists)
  } catch (err) {
    log.error(`Error reading location list: ${err}`)
    return res.status(500).send(err)
  }
}