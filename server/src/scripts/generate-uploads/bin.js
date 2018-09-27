#!/usr/bin/env node

if (!process.argv[2]) {
  console.log('Usage:')
  console.log('       ./bin.js <numberOfUploads> <groupName> [delayBetweenBatchesInMilliseconds] [batchSize]')
  process.exit()
}

const pako = require('pako')
const axios = require('axios')
const uuidv1 = require('uuid/v1');
const templateDoc = require('./template-doc.js').doc
const numberOfUploads = parseInt(process.argv[2])
const url = `http://127.0.0.1/api/${process.argv[3]}/upload`
const delay = process.argv[4] ? parseInt(process.argv[4]) : 2000
const batchSize = process.argv[5] ? parseInt(process.argv[5]) : 100

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
      let doc = Object.assign({}, templateDoc, { _id: uuidv1() })
      let body = pako.deflate(JSON.stringify({ doc }), {to: 'string'})
      bodies.push(body)
    }
    let batch = bodies.map((body) => axios({method: 'post', url, data: `${body}`, headers: { 'content-type': 'text/plain', 'Authorization': `${process.env.T_UPLOAD_TOKEN}` },}))
    // Don't await, the world doesn't wait. We're trying to cause stress at the rate defined.
    // await Promise.all(batch)
    numberOfUploadsCompleted = numberOfUploadsCompleted + batchSize
    console.log(`Posted ${numberOfUploadsCompleted} of ${numberOfUploads}`)
    await sleep(delay)
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
