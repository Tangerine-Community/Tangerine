#!/usr/bin/env node
const axios = require('axios')
const util = require('util')
const writeFile = util.promisify(require('fs').writeFile)
const readFile = util.promisify(require('fs').readFile)
const exec = util.promisify(require('child_process').exec);

if (process.argv[2] === '--help') {
  console.log('Imports a Tangerine v2 Assessment as a Tangerine v3 Group Form.')
  console.log('Usage:')
  console.log('   import-v2-assessment <dbUrlWithCredentials> <assessmentId> <targetGroupId>')
  process.exit()
}

async function importV2Assessment(dbUrlWithCredentials, assessmentId, targetGroupId) {
  const assessment = (await axios.get(`${dbUrlWithCredentials}/${assessmentId}`)).data
  assessment.subtests = (await axios.get(`${dbUrlWithCredentials}/_design/ojai/_view/subtestsByAssessmentId?key=%22${assessmentId}%22&include_docs=true`))
    .data
    .rows
    .map(rows => rows.doc)
    .sort((a, b) => a.order - b.order)
  const questionsBySubtestId = {}
  for (const subtest of assessment.subtests) {
    if (subtest.prototype === 'survey') {
      questionsBySubtestId[subtest._id] = (await axios.get(`${dbUrlWithCredentials}/_design/ojai/_view/questionsByParentId?key=%22${subtest._id}%22&include_docs=true`))
        .data
        .rows
        .map(rows => rows.doc)
    }
  }
  assessment.subtests = assessment.subtests.map(subtest => {
    return !Object.keys(questionsBySubtestId).includes(subtest._id)
      ? subtest
      : {
        ...subtest,
        questions: questionsBySubtestId[subtest._id]
      }
  })
  const template = `
    <tangy-form id="${assessment._id}" title="${assessment.name}">
      ${assessment.subtests.map(subtest => `
        <tangy-form-item id="${subtest._id}" title="${subtest.name}">
          <template>
            ${subtest.prototype === 'survey' ? `
              ${subtest.questions.map(question => `
                ${question.type === 'single' ? `
                  <tangy-radio-buttons name="${question.name}" label="${question.prompt}" ${question.skippable ? '' : 'required'}>
                    ${question.options.map(option => `
                      <option value="${option.value}">${option.label}</option>
                    `).join('')}
                  </tangy-radio-buttons>
                
                `:``}
                ${question.type === 'multiple' ? `
                  <tangy-checkboxes name="${question.name}" label="${question.prompt}" ${question.skippable ? '' : 'required'}>
                    ${question.options.map(option => `
                      <option value="${option.value}">${option.label}</option>
                    `).join('')}
                  </tangy-checkboxes>
                
                `:``}
                ${question.type === 'open' ? `
                  <tangy-input name="${question.name}" label="${question.prompt}" ${question.skippable ? '' : 'required'}>
                  </tangy-input>               
                `:``}

              `).join('')}
            `:``}
            ${subtest.prototype === 'datetime' ? `
              <tangy-input type="date" auto-fill></tangy-input>
              <tangy-input type="time" auto-fill></tangy-input>
            `:``}
            ${subtest.prototype === 'grid' ? `
              <tangy-timed name="${subtest.variableName}" auto-stop="${subtest.autostop}" duration="${subtest.timer}" columns="${subtest.columns === 0 ? '3' : subtest.columns}">
                ${subtest.items.map((item, i) => `
                  <option value="${i}">${item}</option>
                `)}
              </tangy-timed>
            `:``}
            ${subtest.prototype === 'location' ? `
              <tangy-location ${subtest.levels ? `levels="${subtest.levels.join(',')}"`: ``} name="${subtest.name}"></tangy-location>
            `:``}
            ${subtest.prototype === 'gps' ? `
              <tangy-gps name="${subtest.name}"></tangy-gps>
            `:``}
            ${subtest.prototype === 'consent' ? `
              <tangy-consent name="${subtest.name}"></tangy-consent>
            `:``}
          </template>
        </tangy-form-item>
      `).join('')}
    </tangy-form>
  `
  try {
    await exec(`mkdir /tangerine/client/content/groups/${targetGroupId}/${assessment._id}/`)
  } catch(e) { 
    // Do nothing. May be a redo.
  }
  await writeFile(`/tangerine/client/content/groups/${targetGroupId}/${assessment._id}/form.html`, template, 'utf8')
  const forms = JSON.parse(await readFile(`/tangerine/client/content/groups/${targetGroupId}/forms.json`))
  if (!forms.find(formInfo => formInfo.id === assessment._id)) {
    forms.push({
      id: assessment._id,
      src: `./assets/${assessment._id}/form.html`,
      title: assessment.name
    })
    await writeFile(`/tangerine/client/content/groups/${targetGroupId}/forms.json`, JSON.stringify(forms), 'utf8')
  }
}
importV2Assessment(process.argv[2], process.argv[3], process.argv[4])

