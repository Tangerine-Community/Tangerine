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
    if (subtest.prototype === 'survey' || subtest.collection === 'lessonPlan') {
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
    <tangy-form id="form_${assessment._id}" title="${assessment.name}">
      ${assessment.subtests.map(subtest => `
        <tangy-form-item id="section_${subtest._id}" title="${subtest.name.replace(/["']/g, "`")}"
          on-open="
	       ${subtest.prototype ===
      'datetime' ? `inputs.date_start.value = new Date().toISOString().split('T')[0]
	        inputs.time_start.value = new Date().toTimeString().substring(0,5) `: ``}
	        ${subtest.prototype === 'id' ? `function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz0123456789';
  
  //change 5 to the desired length of the ID
    for (var i = 0; i <= 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  
  if (inputs.student_id.value == '') 
     inputs.student_id.value = makeid() `: ``}
	  ">
		  <template>
		  ${subtest.collection === 'lessonPlan' ? `
		  <tangy-box name="${subtest.name}"> ${subtest.html}</tangy-box>	             
		  `: ``}

	    ${(subtest.enumeratorHelp && subtest.enumeratorHelp !== '') ? `
		<tangy-box name="header">${subtest.enumeratorHelp}</tangy-box>
	    `: ``} 
            ${(subtest.studentDialog && subtest.studentDialog !== '') ? `
                <tangy-box name="header">${subtest.studentDialog}</tangy-box>
            `: ``}
	    ${(subtest.transitionComment && subtest.transitionComment !== '') ? `
                <tangy-box name="header">${subtest.transitionComment}</tangy-box>
            `: ``}
            ${subtest.prototype === 'survey' || subtest.collection === 'lessonPlan' ? `
              ${subtest.questions.sort(function (a, b) { return a.order - b.order }).map(question => `
                ${question.type === 'single' ? `
                  <tangy-radio-buttons name="${question.name}" label="${question.prompt.replace(/["']/g, "`")}" ${question.skippable ? '' : 'required'}>
                    ${question.options.map(option => `
                      <option value="${option.value}">${option.label.replace(/["']/g, "`")}</option>
                    `).join('')}
                  </tangy-radio-buttons>
                
				`: ``}
				
                ${question.type === 'multiple' ? `
                  <tangy-checkboxes name="${question.name}" label="${question.prompt.replace(/["']/g, "`")}" ${question.skippable ? '' : 'required'}>
                    ${question.options.map(option => `
                      <option value="${option.value}">${option.label.replace(/["']/g, "`")}</option>
                    `).join('')}
				  </tangy-checkboxes>

				`: ``}
				${question.prototype === 'html' ? `
				<tangy-box name="box_${question._id}"> <p>${question.name}</p> ${question.html}</tangy-box>	             
				`: ``}
			
				${question.prototype === 'media' && (question.fileType == 'audio/mpeg' || question.fileType == 'audio/mp3' || question.fileType == 'audio/x-wav' || question.fileType == 'audio/wav') ? `
				<tangy-box name="media_${question._id}">
					<p>${question.name}</p>
					${question.html}
					<audio controls>
					<source src="./assets/media/${question.elementFilename}" type="${question.fileType}">
					Your browser does not support the audio element.
					</audio>
			</tangy-box>	             
				`: ``}

				${question.prototype === 'html' && question.fileType == 'image/jpeg' ? `
				<tangy-box name="img_${question._id}">
					<p><img  src="./assets/media/${question.elementFilename}"  alt="${question.fileName}" width="85%"/></p>
			</tangy-box>	             
				`: ``}

                ${question.type === 'open' ? `
                  <tangy-input name="${question.name.replace(/["']/g, "`")}" label="${question.prompt.replace(/["']/g, "`")}" ${question.skippable ? '' : 'required'}>
                  </tangy-input>               
                `: ``}

              `).join('')}
            `: ``}
            ${subtest.prototype === 'datetime' ? `
              <tangy-input name="date_start" label="" hint-text="" type="date" required=""></tangy-input>
	      <tangy-input name="time_start" label="" type="time" hint-text="" required=""></tangy-input>
            `: ``}
            ${subtest.prototype === 'grid' ? `
              <tangy-timed name="${subtest.variableName}" auto-stop="${subtest.autostop}" duration="${subtest.timer}" columns="${subtest.columns === 0 ? '3' : subtest.columns}">
                ${subtest.items.map((item, i) => `
                  <option value="${i}">${item}</option>
                `)}
              </tangy-timed>
            `: ``}
            ${subtest.prototype === 'location' ? `
              <tangy-location ${subtest.levels ? `levels="${subtest.levels.join(',')}"` : ``} name="location"></tangy-location>
            `: ``}
            ${subtest.prototype === 'gps' ? `
              <tangy-gps name="${subtest.name}"></tangy-gps>
            `: ``}
            ${subtest.prototype === 'consent' ? `
              <tangy-consent name="consent"></tangy-consent>
            `: ``}
	    ${subtest.prototype === 'id' ? `
              <tangy-input name="student_id" label="" hint-text="" type="text" allowed-pattern="" required=""></tangy-input>
            `: ``}

				 
		</template>
        </tangy-form-item>
      `).join('')}
    </tangy-form>
  `
  try {
    await exec(`mkdir /tangerine/client/content/groups/${targetGroupId}/${assessment._id}/`)
  } catch (e) {
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