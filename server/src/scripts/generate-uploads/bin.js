#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('       ./bin.js <numberOfUploads> <groupName> [delayBetweenBatchesInMilliseconds] [batchSize] [alternativeTemplate]')
  process.exit()
}


const pako = require('pako')
const axios = require('axios')
const uuidv1 = require('uuid/v1');
const numberOfUploads = parseInt(process.argv[2])
const groupName = process.argv[3];
const url = `http://127.0.0.1/api/${process.argv[3]}/upload`
const delay = process.argv[4] ? parseInt(process.argv[4]) : 2000
const batchSize = process.argv[5] ? parseInt(process.argv[5]) : 100

const alternativeTemplate = process.argv[6] ? process.argv[6] : ''
const templateDocfilename = './template-' + alternativeTemplate + '-doc.js'
const templateDoc = require(templateDocfilename).doc

const sleep = (milliseconds) => {
  return new Promise((res, rej) => {
    setTimeout(res, milliseconds)
  })
}

async function go() {
  let numberOfUploadsCompleted = 0
  while (numberOfUploadsCompleted < numberOfUploads) {
    let batchCount = 0
    let bodies = []
    for(var i=0; i < batchSize; i++){
      let doc;
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
      } else {
        doc = Object.assign({}, templateDoc, { _id: uuidv1() })
      }
      let body = pako.deflate(JSON.stringify({ doc }), {to: 'string'})
      bodies.push(body)
    }
    let batch = bodies.map((body) => axios({method: 'post', url, data: `${body}`, headers: { 'content-type': 'text/plain', 'Authorization': `${process.env.T_UPLOAD_TOKEN}` },}))
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
