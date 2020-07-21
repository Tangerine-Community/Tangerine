#!/usr/bin/env node

const groupsListLegacy = require('/tangerine/server/src/groups-list.js')
const fs = require('fs-extra')

async function go() {
  try {
    console.log('Scanning for groups with broken form src paths...')
    const groupList = await groupsListLegacy()
    for (let groupId of groupList) {
      console.log(`Checking group ${groupId}`)
      let forms = await fs.readJson(`/tangerine/client/content/groups/${groupId}/forms.json`)
      try {
        let hasFormIssues = false
        forms = forms.map(form => {
          if (form.id === 'user-profile' && form.src ==='user-profile/form.html') {
            hasFormIssues = true
            form.src = './assets/user-profile/form.html'
          }
          if (form.id === 'reports' && form.src ==='reports/form.html') {
            hasFormIssues = true
            form.src = './assets/reports/form.html'
          }
          return form
        })
        if (hasFormIssues) {
          await fs.writeJson(`/tangerine/client/content/groups/${groupId}/forms.json`, forms)
        }
      } catch (e) {
        console.log(`Failed to update forms.json for group ${groupId}`)
        console.log(forms)
      }
    }
  } catch (error) {
    console.log(error)
  }
}
go()

