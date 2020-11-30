#!/usr/bin/env node

// import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";

const { rword } = require('rword');
rword.load('big')
const DB = require(`../../db.js`)
const TARGETNAME = 'redacted2'
const {promisify} = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const AsyncWindow = require('happy-dom').AsyncWindow ;
const VM = require('vm');
const window = VM.createContext(new AsyncWindow());
const document = window.document;

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js <dbName>')
  console.log('       This will create a new database called <dbName>-redacted')
  process.exit()
}

const dbName = process.argv[2]

async function go() {
  console.log(`Processing ${dbName}`)
  const sourceDb = new DB(`${dbName}`)
  // First generate the full-cream database
  let targetDb
  try {
    targetDb = await new DB(`${sourceDb.name}-${TARGETNAME}`);
  } catch (e) {
    console.log("Error creating db: " + JSON.stringify(e))
  }
  const startTime = new Date().toISOString()
  let processed = 0
  try {
    // const allDocs = await sourceDb.get(`_all_docs`)
    const changes = await sourceDb.changes({ since: 0, include_docs: false })
    if (changes.results.length > 0) {
      for (let change of changes.results) {
        try {
          await changeProcessor(change, sourceDb, targetDb)
          processed++
        } catch (error) {
          log.error(`Error on change sequence ${change.seq} with id ${changes.id} - ${error} ::::: `)
        }
      }
    }
    // prodDbs[groupName] = docs
  } catch (err) {
    console.log("error: " + err)
  }
  
  // console.log("docs size: " + docs.length)

  // const redactedDb = new DB(`${dbName}-redacted`)
  // const info = await redactedDb.info()
  // console.log("info: " + JSON.stringify(info))

  // kudos: https://stackoverflow.com/a/27725806
  function randomFixedInteger(length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  }

  function redactItemInputs(doc) {
    let changed = false;
    if (doc.items && doc.items.length > 0) {
      doc.items.forEach(item => {
        if (item.inputs && item.inputs.length > 0) {
          item.inputs.forEach(input => {
            if (input.value) {
              let redactedValue;
              let valueOriginal = input.value
              let type = typeof valueOriginal
              if (type === 'string') {
                const len = valueOriginal.length
                if (len > 0) {
                  redactedValue = rword.generate(1, {length: len});
                  input.value = redactedValue
                  changed = true
                }
              } else if (type === 'number') {
                const len = valueOriginal.toString().length;
                if (len > 0) {
                  // making a guess here on the length, trying to increase randomness by adding 1 to length.
                  redactedValue = randomFixedInteger(len + 1)
                  input.value = redactedValue
                  changed = true
                }
              } else if (type === 'boolean') {
                redactedValue = Math.random() <= 0.5;
                input.value = redactedValue
                changed = true
              } else if (type === 'object') {
                redactedValue = ''
                input.value = redactedValue
                changed = true
              } else {
                redactedValue = ''
                input.value = redactedValue
                changed = true
              }
              // try not to overwhelm console with signatures and other huge strings.
              let consoleValue;
              if (type === 'string') {
                consoleValue = valueOriginal.substring(0,20)
              } else {
                consoleValue = valueOriginal
              }
              console.log("type: " + type + " name: " + input.name + " valueOriginal: " + consoleValue + " redactedValue: " + redactedValue)
            }
          })
        }
      })
    }
    return changed;
  }

  async function redact(docs) {
    for (const docId of docs) {
      console.log("docId: " + docId)
      if (!docId.startsWith('_design')) {
        let changed = false;
        let doc;
        try {
          doc = await prodDb.get(docId)
        } catch (e) {
          console.log("Error: " + e)
        }
        if (doc.type === 'response') {
          const changedItemInputs = redactItemInputs(doc);
          if (changedItemInputs) {
            changed = true
          }
        } else if (doc.type === 'case') {
          const changedCaseInputs = redactItemInputs(doc);
          if (changedCaseInputs) {
            changed = true
          }
          
          if (doc.participants) {
            doc.participants.forEach(participant => {
              participant.data = {}
            })
          }

          if (doc.events) {
            doc.events.forEach(event => {
              let valueOriginal = event.name
              const len = valueOriginal.length
              if (len > 0) {
                const redactedValue = rword.generate(1, {length: len});
                event.name = redactedValue
                changed = true
              }
            })
          }
          
        }
        
        if (doc.location) {
          doc.location = {
            "Region": "R1",
            "District": "D1"
          }
        }
        doc.startDatetime = null
        doc.startUnixtime = null
        doc.uploadDatetime = null
        doc.tangerineModifiedByUserId = null
        doc.tangerineModifiedByDeviceId = null
        doc.tangerineModifiedOn = null
        doc.deviceId = null
        doc.lastModified = null
        if (changed) {
          console.log("doc.type: " + doc.type + " Changed. Doc id: " + docId)
        }
        try {
          await prodDb.put(doc)
        } catch (e) {
          console.log("Error updating doc into db: " + JSON.stringify(e) )
        }
      }
    }
  }

  // if (docs) {
  //   let startTime = Math.round(new Date() / 1000);
  //   try {
  //     await redact(docs)
  //   } catch (e) {
  //     console.log("Error: " + e)
  //   }
  //   let endTime = Math.round(new Date() / 1000);
  //   const duration = endTime - startTime
  //   console.log("duration: " + duration)
  // }

}

const changeProcessor = (change, sourceDb, targetDb) => {
  return new Promise((resolve, reject) => {
    sourceDb.get(change.id)
      .then(doc => {
        switch (doc.collection) {
          case 'TangyFormResponse':
              resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name})
              processDoc({doc, sourceDb, targetDb})
                .then(_ => resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name}))
                .catch(error => { reject(error) })
            break
          default:
            resolve({status: 'ok', seq: change.seq, dbName: sourceDb.name, collection: doc.collection, comments: 'Not processed.'})
        }
      })
      .catch(error => {
        console.log('Error in changeProcessor: ' + JSON.stringify(error))
        reject(new Error(error))
      })
  })
}

const processDoc = (data) => {
  async function redactDocumentValues(sourceDb, targetDb, doc, locationList, exclusions, resolve) {
    if (exclusions && exclusions.includes(doc.form.id)) {
      // skip!
    } else {
      // Always create a new doc
      // let formHtml =  await this.tangyFormService.getFormMarkup(this.formId, null)
      const contentPath = `/tangerine/groups/${sourceDb.name}/client`
      const forms = JSON.parse(await readFile(`${contentPath}/forms.json`))
      console.log("doc.formId: " + doc.form.id)
      const formInfo = forms.find(formInfo => formInfo.id === doc.form.id)
      const formInfoSrc = formInfo.src;
      const src = formInfoSrc.replace('./assets','')
      const formPath = contentPath + src
      console.log("Getting formPath: " + formPath)
      // const formHtml = JSON.parse(await readFile(`${formPath}`))
      const formHtml = await readFile(`${formPath}`, 'utf8')
      const htmlHeader = `
      <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
            <title>tangy-form</title>
            <script src="/tangerine/editor/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
            <script src="/tangerine/editor/node_modules/redux/dist/redux.min.js"></script>
            <script type="module" src="/tangerine/client/node_modules/tangy-form/tangy-form.js"></script>
            <script type="module" src="/tangerine/client/node_modules/tangy-form/tangy-form-item.js"></script>
            <script type="module" src="/tangerine/client/node_modules/tangy-form/input/tangy-input.js"></script>
            </head>
        <body>
        <div id="container">
      `
      const htmlFooter = `
              </div>
        </body>
      </html>
      `
      
      // const options = {
      //   resources: "usable",
      //   runScripts: "dangerously",
      //   pretendToBeVisual: true,
      //   includeNodeLocations: true
      // }
      // const formEl = new JSDOM(formHtml, options);
      const content = htmlHeader + formHtml + htmlFooter
      // console.log("content: " + content)

      // const dom = new JSDOM(content, options);
      document.body.innerHTML = content
      // console.log(dom.window.document.querySelector("#content").innerHTML); // "Hello world"

      // let initialResponse = new TangyFormResponseModel()
      // const props = {};
      // Object.keys(this.constructor.properties).forEach(p => props[p] = this[p]);
      //
      // initialResponse.form = this.getProps()
      // this.querySelectorAll('tangy-form-item').forEach((item) => {
      //   initialResponse.items.push(item.getProps())
      // })
      // this.response = initialResponse
      
      // console.log("formEL: " + JSON.stringify(dom))
      // console.log("tangy-form: " +  dom.window.document.querySelector("tangy-form").innerHTML)
      
      // console.log("tangy-form: " +  JSON.stringify(formEl))

      window.whenAsyncComplete().then(() => {
        // const myContainer = document.querySelector('.myContainer div');
        //
        // // Will output "Test"
        // console.log(myContainer.innerHTML);
        // const container = document.querySelector('#container')
        // console.log("container: " +  container)

        const formEl = document.querySelector('tangy-form')
        // console.log("formEl: " +  formEl)
        console.log("formEl tagName: " +  formEl.tagName)
        // console.log("formEl.constructor.properties: " +  formEl.constructor.properties)
        // const meta = formEl.getMeta()
        // formEl.newResponse()
        // const items = formEl.querySelectorAll('tangy-form-item')
        // console.log("items: " +  items)
        let initialResponse = new TangyFormResponseModel()
        const props = {};
        // Object.keys(this.constructor.properties).forEach(p => props[p] = this[p]);
        // Object.keys(formEl.constructor.properties).forEach(p => props[p] = formEl[p]);

        initialResponse.form = props
        formEl.querySelectorAll('tangy-form-item').forEach((item) => {
          // initialResponse.items.push(item.getProps())
          console.log("item: " + item)
        })
        formEl.response = initialResponse
        
      });
      
      // formEl.newResponse()
      // const newDoc = formEl.response

      // if (newDoc.type === 'case') {
      //   // output case
      //   await saveRedactedResponse(newDoc, locationList, targetDb, resolve);
      // } else {
      //   await saveRedactedResponse(newDoc, locationList, targetDb, resolve);
      // }
    }
  }

  return new Promise(async (resolve, reject) => {
    const {doc, sourceDb, targetDb} = data
    const locationList = JSON.parse(await readFile(`/tangerine/client/content/groups/${sourceDb.name}/location-list.json`))
    const groupsDb = await new DB(`groups`);
    const groupDoc = await groupsDb.get(`${sourceDb.name}`)
    const exclusions = groupDoc['exclusions']
    await redactDocumentValues(sourceDb, targetDb, doc, locationList, exclusions, resolve);
  })
}

async function saveRedactedResponse(doc, locationList, targetDb, resolve) {
  // if (doc.location) {
  doc.location = {
    "Region": "R1",
    "District": "D1"
  }
  // }
  doc.startDatetime = null
  doc.startUnixtime = null
  doc.uploadDatetime = null
  doc.tangerineModifiedByUserId = null
  doc.tangerineModifiedByDeviceId = null
  doc.tangerineModifiedOn = null
  doc.deviceId = null
  doc.lastModified = null
  let redactedResponse = await generateRedactedResponse(doc, locationList);
  await pushResponse(redactedResponse, targetDb);
  resolve('done!')
}

/** This function processes form response, making the data structure flatter.
 *
 * @param {object} formData - form response from database
 * @param {object} locationList - location list doing label lookups on TANGY-LOCATION inputs
 *
 * @returns {object} processed results for csv
 */

const generateRedactedResponse = async function (formResponse, locationList) {
  let sep = "-"
  if (formResponse.form.id === '') {
    formResponse.form.id = 'blank'
  }
  // let flatFormResponse = {
  //   _id: formResponse._id,
  //   formId: formResponse.form.id,
  //   formTitle: formResponse.form.title,
  //   startUnixtime: formResponse.startUnixtime,
  //   buildId: formResponse.buildId||'',
  //   buildChannel: formResponse.buildChannel||'',
  //   deviceId: formResponse.deviceId||'',
  //   groupId: formResponse.groupId||'',
  //   complete: formResponse.complete
  // };
  function set(input, value) {
    input.value = input.skipped
      ? process.env.T_REPORTING_MARK_SKIPPED_WITH
      : input.hidden && process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH !== "ORIGINAL_VALUE"
        ? process.env.T_REPORTING_MARK_DISABLED_OR_HIDDEN_WITH
        : value
  }
  let formID = formResponse.form.id;
  for (let item of formResponse.items) {
    for (let input of item.inputs) {
      // Simplify the keys by removing formID.itemId
      let firstIdSegment = `${formID}_${item.id}_`
      let redactedValue;
      let valueOriginal = input.value
      let tagName = input.tagName
      if (input.tagName === 'TANGY-LOCATION') {
        // Populate the ID and Label columns for ≈ levels.
        // TANGY-LOCATION input creates a data structure like this:
        //[
        //   {
        //     "level": "county",
        //     "value": "county1"
        //   },
        //   {
        //     "level": "school",
        //     "value": "school1"
        //   }
        // ]
        valueOriginal = JSON.stringify(input.value)
        let locationValue = []
        for (let group of input.value) {
          let groupValueOriginal = group.value
          const len = groupValueOriginal.length
          let groupValue = rword.generate(1, {length: len});
          locationValue.push({"level": group.level, "value": groupValue})
          set(input, locationValue)
          redactedValue = JSON.stringify(locationValue)
        }
      } else if (input.tagName === 'TANGY-RADIO-BUTTONS') {
        valueOriginal = input.value.find(input => input.value == 'on')
          ? input.value.find(input => input.value == 'on').name
          : ''
        const len = valueOriginal.length
        redactedValue = rword.generate(1, {length: len});
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-RADIO-BUTTON') {
        redactedValue = Math.random() <= 0.5;
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-CHECKBOXES') {
        valueOriginal = []
        redactedValue = []
        for (let checkboxInput of input.value) {
          valueOriginal.push(checkboxInput.value)
          const cbValue = Math.random() <= 0.5;
          checkboxInput.value = cbValue
          redactedValue.push(cbValue)
        }
        set(input, input.value)

      } else if (input.tagName === 'TANGY-CHECKBOX') {
        redactedValue = Math.random() <= 0.5;
        set(input, redactedValue)
      } else if (input.tagName === 'TANGY-BOX' || input.name === '') {
        // Do nothing :).
      } else if (input && typeof input.value === 'string') {
        const len = valueOriginal.length
        if (len > 0) {
          redactedValue = rword.generate(1, {length: len});
        }
        // try not to overwhelm console with signatures and other huge strings.
        valueOriginal = input.value.substring(0,20)
        set(input, redactedValue)
      } else if (input && typeof input.value === 'number') {
        // set(input, `${firstIdSegment}${input.name}`, input.value)
        const len = valueOriginal.toString().length;
        if (len > 0) {
          // making a guess here on the length, trying to increase randomness by adding 1 to length.
          redactedValue = randomFixedInteger(len + 1)
          set(input, redactedValue)
        }
      } else if (input && Array.isArray(input.value)) {
        // for (let group of input.value) {
        //   set(input, `${firstIdSegment}${input.name}${sep}${group.name}`, group.value)
        // }
        valueOriginal = JSON.stringify(input.value)
        redactedValue = []
        set(input,redactedValue)
      } else if ((input && typeof input.value === 'object') && (input && !Array.isArray(input.value)) && (input && input.value !== null)) {
        // let elementKeys = Object.keys(input.value);
        // for (let key of elementKeys) {
        //   set(input, `${firstIdSegment}${input.name}${sep}${key}`, input.value[key])
        // };
        valueOriginal = JSON.stringify(input.value)
        redactedValue = {}
        set(input,redactedValue)
      }
      console.log("tagName: " + tagName + " name: " + input.name + " valueOriginal: " + valueOriginal + " redactedValue: " + redactedValue)
    }
  }
  return formResponse;
};

// kudos: https://stackoverflow.com/a/27725806
function randomFixedInteger(length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
}

function pushResponse(doc, db) {
  return new Promise((resolve, reject) => {
    db.get(doc._id)
      .then(oldDoc => {
        // Overrite the _rev property with the _rev in the db and save again.
        const updatedDoc = Object.assign({}, doc, { _rev: oldDoc._rev });
        db.put(updatedDoc)
          .then(_ => resolve(true))
          .catch(error => reject(`rshiny pushResponse could not overwrite ${doc._id} to ${db.name} because Error of ${JSON.stringify(error)}`))
      })
      .catch(error => {
        const docClone = Object.assign({}, doc);
        // Make a clone of the doc so we can delete part of it but not lose it in other iterations of this code
        // Note that this clone is only a shallow copy; however, it is safe to delete top-level properties.
        // delete the _rev property from the docClone
        delete docClone._rev
        db.put(docClone)
          .then(_ => resolve(true))
          .catch(error => reject(`rshiny pushResponse could not save ${docClone._id} to ${docClone.name} because Error of ${JSON.stringify(error)}`))
      });
  })
}

class TangyFormResponseModel {
  constructor(props) {
    this._id = uuid()
    this.collection = 'TangyFormResponse'
    // Placeholders for where element.getProps() info will go.
    this.form = {}
    this.items = []
    // States.
    this.complete = false
    this.hasUnlocked = false
    // Focus indexes.
    // @TODO: We can probably get rid of these indexes.
    this.focusIndex = 0
    this.nextFocusIndex = 1
    this.previousFocusIndex = -1
    // Info.
    this.startDatetime = (new Date()).toLocaleString(),
      this.startUnixtime = Date.now(),
      this.uploadDatetime = ''
    this.location = {}
    this.type = 'response'
    if (props && props.hasOwnProperty('inputs')) delete props.inputs
    Object.assign(this, props)
  }
}

function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

go()