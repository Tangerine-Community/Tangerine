#!/usr/bin/env node

const { rword } = require('rword');
rword.load('big')
const DB = require(`../../db.js`)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       ./bin.js <dbName>')
  console.log('       This will create a new database called <dbName>-redacted')
  process.exit()
}

const dbName = process.argv[2]

async function go() {
  console.log(`Processing ${dbName}`)
  const prodDb = new DB(`${dbName}`)
  let docs = [];
  try {
    const allDocs = await prodDb.get(`_all_docs`)
    // console.log("check out these docs: " + JSON.stringify(allDocs))
    for (let doc of allDocs.rows) {
      let docId = doc.id;
      docs.push(docId)
    }
    // prodDbs[groupName] = docs
  } catch (err) {
    console.log("error: " + err)
  }
  
  console.log("docs size: " + docs.length)

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
              console.log("type: " + type + " name: " + input.name + " valueOriginal: " + valueOriginal + " redactedValue: " + redactedValue)
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

  if (docs) {
    let startTime = Math.round(new Date() / 1000);
    try {
      await redact(docs)
    } catch (e) {
      console.log("Error: " + e)
    }
    let endTime = Math.round(new Date() / 1000);
    const duration = endTime - startTime
    console.log("duration: " + duration)
  }

}

go()