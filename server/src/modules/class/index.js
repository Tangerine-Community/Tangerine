const clog = require('tangy-log').clog
const fs = require('fs-extra')

module.exports = {
  name: 'class',
  hooks: {
    csv_flatFormReponse: function(data) {
      return new Promise((resolve, reject) => {
          let formResponse = data.formResponse
          let flatFormResponse = data.flatFormResponse
          if (formResponse.metadata && formResponse.metadata.studentRegistrationDoc && formResponse.metadata.studentRegistrationDoc.classId) {
            let studentRegistrationDoc = formResponse.metadata.studentRegistrationDoc
            flatFormResponse[`sr_classId`] = studentRegistrationDoc.classId;
            flatFormResponse[`sr_student_name`] = studentRegistrationDoc.student_name;
            flatFormResponse[`sr_student_id`] = studentRegistrationDoc.id;
            flatFormResponse[`sr_age`] = studentRegistrationDoc.age;
            flatFormResponse[`sr_gender`] = studentRegistrationDoc.gender;
          }
          resolve({flatFormResponse, formResponse})
      })
    },
    groupNew: function(data) {
      return new Promise(async (resolve, reject) => {
        const {groupName, appConfig} = data
        clog("Setting homeUrl to dashboard and uploadUnlockedFormReponses to true.")
        appConfig.homeUrl =  "dashboard"
        appConfig.uploadUnlockedFormReponses =  true
        // copy the class forms
        try {
          await fs.copy('/tangerine/server/src/modules/class/', `/tangerine/client/content/groups/${groupName}`)
          clog("Copied class module forms.")
        } catch (err) {
          console.error(err)
        }
        let formsName = appConfig.syncProtocol === '1' ? 'forms-sp1.json' : 'forms-sp2.json'
        const classJSON = JSON.parse(await fs.readFile(`/tangerine/server/src/modules/class/${formsName}`))
        const groupJSON = JSON.parse(await fs.readFile(`/tangerine/client/content/groups/${groupName}/forms.json`))
        const newGroupJSON = groupJSON.concat(classJSON);
        await fs.writeFile(`/tangerine/client/content/groups/${groupName}/forms.json`, JSON.stringify(newGroupJSON), 'utf8')
        resolve(data)
      })
    },
  }
}
