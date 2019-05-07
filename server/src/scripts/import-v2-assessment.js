#!/usr/bin/env node
const axios = require('axios')
if (process.argv[2] === '--help') {
  console.log('Clears reporting caches.')
  console.log('Usage:')
  console.log('   reporting-cache-clear')
  process.exit()
}

async function importV2Assessment(dbUrlWithCredentials, assessmentId, targetGroupId, targetFormId) {
  const assessment = (await axios.get(`${dbUrlWithCredentials}/${assessmentId}`)).data
  assessment.subtests = (await axios.get(`${dbUrlWithCredentials}/_design/ojai/_view/subtestsByAssessmentId?key=%22${assessmentId}%22&include_docs=true`))
    .data
    .rows
    .map(rows => rows.doc)
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
    <tangy-form id="${targetFormId}">
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
            `:``}
            ${subtest.prototype === 'grid' ? `
            `:``}
            ${subtest.prototype === 'location' ? `
            `:``}
            ${subtest.prototype === 'gps' ? `
            `:``}
            ${subtest.prototype === 'consent' ? `
            `:``}
          </template>
        </tangy-form-item>
      `).join('')}
    </tangy-form>
  `
  debugger


}
importV2Assessment(process.argv[2], process.argv[3], process.argv[4], process.argv[5])

