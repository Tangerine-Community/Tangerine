const log = require('tangy-log').log
const clog = require('tangy-log').clog
const http = require('axios')
import fs, { access } from 'fs';
import {promisify} from 'util';
const stat = promisify(fs.stat)


module.exports = {
  hooks: {
    reportingOutputs: function(data) {
      return new Promise(async (resolve, reject) => {
          const {flatResponse, doc, sourceDb} = data
          await ensureIndex(sourceDb.name);
          if (await access('/transformers/elastic_search.js') === fs.constants.F_OK) {
            const transformer = require('/transformers/elastic_search.js')
            await indexFlattenedFormResponse(await transformer(flatResponse, doc, sourceDb.name), sourceDb.name, doc);
          } else {
            await indexFlattenedFormResponse(flatResponse, sourceDb.name, doc);
          }
          resolve(data)
      })
    }
  }
}

function ensureIndex(groupName) {
  return new Promise((resolve, reject) => {
    http.get(`http://elasticsearch:9200/${groupName}`)
      .then(_ => resolve(true))
      .catch(err => {
        http.put(`http://elasticsearch:9200/${groupName}`)
          .then(_ => resolve(true))
          .catch(err => reject(err))
      })
  })
}

function indexFlattenedFormResponse(doc, groupName, originalDoc) {
  return new Promise((resolve, reject) => {
    let safeDoc = Object.assign({}, doc.processedResult)
    let indexDoc = {}
    for (let prop in safeDoc) {
      // elasticsearch gets confused about periods, replace them with underscores.
      let indexProp = prop.replace(/\./g, '_')
      if (typeof safeDoc[prop] === 'boolean') {
        indexDoc[indexProp] = (safeDoc[prop]) ? 'true' : 'false'
      }
      else if (!safeDoc[prop]) {
        indexDoc[indexProp] = ''
      } else {
        indexDoc[indexProp] = safeDoc[prop]
      }
    }
    http.put(`${process.env.T_MODULE_ELASTIC_SEARCH_URL}/${groupName}/_doc/${doc._id}`, indexDoc)
      .then(_ => resolve(true))
      .catch(err => {
        reject(err)
      })
  })
}