# Tangy Modules

Modules provide additional features to Tangerine, such as:
 - automatically add forms to the client when a new group is created (via groupNew hook)
 - data transformation for reporting (via flatFormResponse hook)

Modules:
 - [Class](../editor/project_management/class.md)

Steps to add a module
 - Create an index.js file inside server/src/modules/moduleName using the sample below as a guide.
 - Implement any relevant hooks. See the examples for flatFormResponse and groupNew, below.
 - Forms that need to be copied over to the client should be placed in server/src/modules/moduleName.

## Sample module index.js

 ```
const clog = require('tangy-log').clog
const fs = require('fs-extra')

module.exports = {
  hooks: {
    flatFormResponse: function(data) {
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
 ```

This code will be automatically run when the TangyModules (server/src/modules/index.js) is run
