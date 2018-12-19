const clog = require('tangy-log').clog
const fs = require('fs-extra')

module.exports = {
  hooks: {
    flatFormReponse: function(data) {
      return new Promise((resolve, reject) => {
          debugger;
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
        resolve(data)
      })
    },
  }
}