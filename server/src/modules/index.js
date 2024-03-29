const path = require('path')
const fs = require('fs')
const util = require('util')
const readDir = util.promisify(require('fs').readdir)

class TangyModules {

  constructor() {
    
    let enabledModules = process.env.T_MODULES
      ? JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
      : []
    this.modules = enabledModules.map(moduleName => require(`/tangerine/server/src/modules/${moduleName}/index.js`))
    this.enabledModules = enabledModules

    // lazy load the location lists
    this.locationLists;
  }

  async hook(hookName, data) {
    for (let module of this.modules) {
      if(module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
        data = await module.hooks[hookName](data)
      }
    }
    return data;
  }

  /*
   * setVariable() is used in the modules to set the output value of a variable based on the input's metadata and the 
   * Tangerine server level configurations related to reporting. The hierarchy of elements is based on our experience 
   * in users want the data to appear.
   * 
   * 1. 'skipped' means there is skip-logic that made the question not appear
   * 3. 'hidden' is for variables that are auto-calculated
   * 2. 'not required and incomplete' is for optional questions that were not answered
   * 4. 'undefined' handles cases where the user wants something like 'null' or 'na' for easier processing with stats tools
   */
  setVariable(flatFormResponse, input, key, value) {

    if (value === undefined && process.env.T_REPORTING_MARK_UNDEFINED_WITH !== "ORIGINAL_VALUE") {
      value = process.env.T_REPORTING_MARK_UNDEFINED_WITH
    }

    if (input.skipped) {
      flatFormResponse[key] = process.env.T_REPORTING_MARK_SKIPPED_WITH
    } else if (input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE") {
      // The name for the variable T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH is misleading
      // DO NOT ADD 'input.disabled' to the else if statement above
      flatFormResponse[key] = process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH
    } else if (!input.required && value == '') {
      flatFormResponse[key] = process.env.T_REPORTING_MARK_OPTIONAL_NO_ANSWER_WITH
    } else {
      flatFormResponse[key] = value
    }
  }

  async getLocationLists(groupId) {
    return this.locationLists ? this.locationLists : await this.initLocationLists(groupId);
  }

  async getLocationListsByLocationSrc(groupId, locationSrc) {
    if (!this.locationLists) {
      this.locationLists = await this.initLocationLists(groupId);
    }
    return this.locationLists.find(locationList => locationSrc == path.parse(locationList.path).base)
  }

  async initLocationLists(groupId) {
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

    const groupDir = `/tangerine/client/content/groups/${groupId}`
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
    return fileMetadata
  }

}

module.exports = function() {
  return new TangyModules()
}