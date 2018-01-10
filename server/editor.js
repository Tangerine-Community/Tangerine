/* jshint esversion: 6 */

const fs = require('fs-extra')
const read = require('read-yaml')
const config = read.sync('./config.yml')
const path = require('path')
const sep = path.sep;

let Editor = function Editor() {

  this.listProjects = function() {
    return new Promise(async (resolve, reject) => {
      console.log('listing projects.')
      fs.readJson(config.contentRoot + '/forms.json').catch(err => {
        console.error(err) // Not called
      })
        .then(contents => {
          resolve(contents)
          return contents
        })
        .catch(error => {
          console.log('bummer: ' + error)
          reject(contents)
        });
    });
  }


  /**
   * Populates formJson by reading current form.json. If forms.json does not exist, creates an empty array for formJson
   * and adds new form params to it, then saves form.json.
   *
   * @param formParameters
   * @param project - currently unused
   * @returns {Promise.<void>}
   */
  this.saveFormsJson = async function(formParameters, project) {
    console.log("formParameters: " + JSON.stringify(formParameters))
    let contentRoot = config.contentRoot
    let formsJsonPath = contentRoot + '/forms.json'
    console.log("formsJsonPath:" + formsJsonPath)
    let formJson
    try {
      await fs.ensureFile(formsJsonPath)
      console.log("formsJsonPath exists")
    } catch (err) {
      console.log("Creating empty formJson array" + err)
      formJson = []
    }
    try {
      formJson = await fs.readJson(formsJsonPath)
      console.log("formJson: " + JSON.stringify(formJson))
      console.log("formParameters: " + JSON.stringify(formParameters))
      formJson.push(formParameters)
      console.log("formJson with new formParameters: " + JSON.stringify(formJson))
    } catch (err) {
      console.error("An error reading the json form: " + err)
    }
    await fs.writeJson(formsJsonPath, formJson)
  }

  /**
   * Saves a form at /content/forms/formName/form.html
   * @param dir
   * @param safeFiletName
   * @param form
   * @returns {Promise.<{message: string}>}
   */
  this.saveForm = async function (formPath, form) {
    // let formPath = dir + "/content/forms/" + formName;
    console.log("Saving form at : " + formPath)
    // await fs.ensureDir(formPath)
    // await fs.outputFile(formPath + "/form.html", form)
    await fs.outputFile(formPath, form)
    let resp = {
      "message": 'Form saved: ' + formPath
    }
    return resp;
  };

  /**
   * Saves an item at projects/projectName/content/forms/formName/itemName.html
   * @param dir
   * @param formName
   * @param itemFilename
   * @param itemHtmlText
   * @returns {Promise.<{message: string}>}
   */
  this.saveItem = async function (formPath, itemFilename, itemHtmlText) {
    // let formName = formHtmlPath.split('/')[3]
    // let itemPath = dir + "/content/forms/" + formName + "/" + itemFilename;
    let itemPath = formPath.substring(0, formPath.lastIndexOf("/")) + sep + itemFilename;
    console.log("Saving item at : " + itemPath)
    await fs.outputFile(itemPath, itemHtmlText)
    let resp = {
      "message": 'Item saved: ' + itemPath
    }
    return resp;
  };

  return this;
}

module.exports = Editor;

