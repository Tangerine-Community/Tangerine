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