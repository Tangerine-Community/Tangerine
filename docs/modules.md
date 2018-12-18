# Tangy Modules

Modules provide two functions:
 - forms added to the client when a new group is created
 - data transformation for reporting

Steps to add a module
 - Forms that need to be copied over to the client should be placed in server/src/modules/moduleName.
 - Modify the code in server/src/routes/group-new
 - Add new functionality to the client Angular code, if needed.

 To modify the data transformation for reports, add an index.js file to your modules directory and follow this code example
 to implement the flatFormReponse hook:

 ```
 const DB = require('../../db.js')
 const log = require('tangy-log').log
 const clog = require('tangy-log').clog

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
     }
   }
 }
 ```

This code will be automatically run when the TangyModules (server/src/modules/index.js) is run
