#!/usr/bin/env node

const pako = require('pako')
const axios = require('axios')
const uuidv1 = require('uuid/v1');
const templateDoc = require('./template-doc.js').doc
const delay = parseInt(process.argv[2])
const batchSize = parseInt(process.argv[3])
const numberOfUploads = parseInt(process.argv[4])
const url = process.argv[5]
console.log(process.argv)

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

      console.log(body)
      bodies.push(body)
    }
    let batch = bodies.map((body) => axios({method: 'post', url, data: `${body}`, headers: { 'content-type': 'text/plain' },}))
    // Don't await, the world doesn't wait. We're trying to cause stress at the rate defined.
    // await Promise.all(batch)
    numberOfUploadsCompleted = numberOfUploadsCompleted + batchSize
    console.log(`Posted ${numberOfUploadsCompleted} of ${numberOfUploads}`)
    await sleep(delay)
  }
}
go()
