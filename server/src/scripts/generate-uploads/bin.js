#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('       generate-uploads <numberOfUploads> <groupName> [delayBetweenBatchesInMilliseconds] [batchSize] [alternativeTemplate]')
  process.exit()
}


const pako = require('pako')
const axios = require('axios')
const uuidv1 = require('uuid/v1');
const numberOfUploads = parseInt(process.argv[2])
const groupName = process.argv[3];
const url = `http://localhost/api/${process.argv[3]}/upload`
const delay = process.argv[4] ? parseInt(process.argv[4]) : 2000
const defaultBatchSize =  numberOfUploads < 100 ? numberOfUploads : 100
const batchSize = process.argv[5] ? parseInt(process.argv[5]) : defaultBatchSize

const alternativeTemplate = process.argv[6] ? process.argv[6] : ''
const templateDocfilename = './template-' + alternativeTemplate + '-doc.js'
const templateDoc = require(templateDocfilename).doc
const userProfileTemplateDoc = require('./template-user-profile-doc.js').doc
const form01ATemplateDoc = require('./template-case-form01A-doc.js').doc

const sleep = (milliseconds) => {
  return new Promise((res, rej) => {
    setTimeout(res, milliseconds)
  })
}

async function go() {

  let randomDate = function (start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  let numberOfUploadsCompleted = 0
  while (numberOfUploadsCompleted < numberOfUploads) {
    let batchCount = 0
    let bodies = []
    let linkedRecords1 = []
    for(var i=0; i < batchSize; i++){
      let doc;
      let linkedDoc1;
      if (alternativeTemplate === 'class') {
        let studentRegistration = {
          _id: uuidv1(),
          "metadata": {
            "studentRegistrationDoc": {
              "classId": "0315cc45-9bca-4452-a2ad-5b849f67ff27",
              "age": "8",
              "gender": "M",
              "student_name": "Ping",
              "id": uuidv1()
            }
          }
        }
        doc = Object.assign({}, templateDoc, studentRegistration)
      } else if (alternativeTemplate === 'case-mother') {
        let participantId = uuidv1()
        let caseId = uuidv1();
        let participant_id = Math.round(Math.random() * 1000000)
        let caseMother = {
          _id: caseId,
          "participants": [{
            "id": participantId,
            "caseRoleId": "mother-role",
            "data": {"firstname": "A", "surname": "Test", "participant_id": participant_id}
          }],
        }
        console.log("motherId: " + caseId + " participantId: " + participantId + " participant_id: " + participant_id);
        doc = Object.assign({}, templateDoc, caseMother);
        form01ATemplateDoc.items[10].inputs[2].value = participant_id;
        linkedDoc1 =  Object.assign({}, form01ATemplateDoc, {
          _id: participantId,
          caseId: caseId
        });

      } else {
        let date = randomDate(new Date(2019, 0, 1), new Date())
        let d = new Date(date),
          month = d.getMonth() + 1,
          day = d.getDate(),
          year = d.getFullYear()
        let lessonStartDate = [year, month, day].join('-')
        templateDoc.items[0].inputs[6].value = lessonStartDate
        let userProfileId = 'user-' + uuidv1();
        templateDoc.items[0].inputs[5].value = userProfileId
        doc = Object.assign({}, templateDoc, {
          _id: uuidv1()
        })
        linkedDoc1 = Object.assign({}, userProfileTemplateDoc, {
          _id: userProfileId
        })
        // console.log("userProfileDoc: " + JSON.stringify(userProfileDoc))
      }
      let body = pako.deflate(JSON.stringify({ doc }), {to: 'string'})
      bodies.push(body)
      let linkedRecord = pako.deflate(JSON.stringify({ doc: linkedDoc1 }), {to: 'string'})
      linkedRecords1.push(linkedRecord)
    }
    // Upload the profiles first
    let batchlinkedRecords1 = linkedRecords1.map((linkedRecord) => axios({method: 'post', url, data: `${linkedRecord}`, headers: { 'content-type': 'text/plain', 'Authorization': `${process.env.T_UPLOAD_TOKEN}` },}))
    // now upload the others
    let batch = bodies.map((body) => {
      axios({method: 'post', url, data: `${body}`, headers: { 'content-type': 'text/plain', 'Authorization': `${process.env.T_UPLOAD_TOKEN}` },})
          .then(function (response) {
            // console.log(response);
          })
    })
    // Don't await, the world doesn't wait. We're trying to cause stress at the rate defined.
    // await Promise.all(batch)
    numberOfUploadsCompleted = numberOfUploadsCompleted + batchSize
    console.log(`Posted ${numberOfUploadsCompleted} of ${numberOfUploads} to ${groupName} `)
    await sleep(delay)
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
