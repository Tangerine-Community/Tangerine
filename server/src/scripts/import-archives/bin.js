#!/usr/bin/env node
if (!process.argv[2]) {
  console.log('Place archives from clients into the ./data/archives folder on the host machine then run...')
  console.log('       ./bin.js <groupName>')
  process.exit()
}

const util = require('util')
const readdir = util.promisify(require('fs').readdir)
const readFile = util.promisify(require('fs').readFile)
const pako = require('pako')
const axios = require('axios')
const url = `http://localhost/api/${process.argv[2]}/upload`
const ARCHIVES_PATH = '/archives'


async function go() {
  const archivesList = await readdir(ARCHIVES_PATH)
  console.log(archivesList)
  for (const archivePath of archivesList) {
    const archiveContents = await readFile(`${ARCHIVES_PATH}/${archivePath}`, 'utf-8')
    const archive = JSON.parse(archiveContents)
    for (const userDatabase of archive) {
      const userProfileDoc = userDatabase.docs.rows.find(row => row.doc && row.doc.form && row.doc.form.id === 'user-profile').doc
      const docs = userDatabase.docs.rows
        .map(row => {
          if (row.doc.collection !== 'TangyFormResponse') return
          if (row.doc.form && row.doc.form.id !== 'user-profile') {
            row.doc.items[0].inputs.push(
              {
                name: 'userProfileId',
                value: userProfileDoc._id
              },
              {
                name: 'tabletUserName', value: archive[0].databaseName
              }
            )
          }
          return row.doc 
        })
        .filter(doc => doc !== undefined)
      for (const doc of docs) {
        let body = pako.deflate(JSON.stringify({ doc }), {to: 'string'})
        await axios({
          method: 'post',
          url,
          data: `${body}`,
          headers: {
            'content-type': 'text/plain',
            'Authorization': `${process.env.T_UPLOAD_TOKEN}`
          }
        })
      }
    }
  }
}

try {
  go()
} catch(e) {
  console.log(e)
}
