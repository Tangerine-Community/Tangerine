#!/usr/bin/env node
const fs = require('fs-extra')
const groupsList = require('/tangerine/server/src/groups-list.js')
const util = require('util');
const exec = util.promisify(require('child_process').exec)

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('Update about page ')
  process.exit()
}

async function go() {
  const groupNames = await groupsList()
  for (let groupName of groupNames) {
    await exec(`cp -R /tangerine/content-sets/default/client/about /tangerine/groups/${groupName}/client/`);

    console.log(`Upgrading group ${groupName}`)
    let forms = await fs.readJson(`/tangerine/client/content/groups/${groupName}/forms.json`)
    try {
      forms = [
        ...(forms.some(form => form.id === 'about')
          ? forms.map(form =>
            form.id === 'about'
              ? { ...form, src: './assets/about/form.html' }
              : form
          )
          : [
            {
              id: 'about',
              title: 'About',
              listed: false,
              archived: true,
              src: './assets/about/form.html',
            },
          ]),
      ]
      await fs.writeJson(`/tangerine/client/content/groups/${groupName}/forms.json`, forms)

    } catch (e) {
      console.log(`Failed to update forms.json for group ${groupName}`)
      console.log(forms)
    }
  }


}
go()