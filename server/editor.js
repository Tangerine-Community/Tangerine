var fs = require('fs-extra')
var read = require('read-yaml')
var config = read.sync('./config.yml')
var path = require('path')
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
   * Reads current form.json and adds new form params to it, then saves.
   * @param dir
   * @param formParameters
   * @returns {Promise.<void>}
   */
  this.saveFormsJson = async function (dir, formParameters) {
    let formsPath = dir + "/content/forms";
    await fs.ensureDir(formsPath)
    let formsJsonPath = dir + "/content/forms.json";
    let currentFormJson = await fs.readJson(formsJsonPath)
    currentFormJson.push(formParameters)
    console.log("currentFormJson with metadata: " + JSON.stringify(currentFormJson))
    // fs.writeJson(formsJsonPath, packageObj).then(() => {
    await fs.writeJson(formsJsonPath, packageObj)
  };

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

