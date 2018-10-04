const DB = require('../../db.js')
const log = require('tangy-log').log
const clog = require('tangy-log').clog

module.exports = {
  hooks: {
    flatFormReponse: function(data) {
      return new Promise((resolve, reject) => {
        setTimeout(_ => {
          debugger;
          let formResponse = data.formResponse
          // manipulate data in formResponse
          let flatFormResponse = data.flatFormResponse
          // add this processed data to flatFormResponse

          let formID = formResponse.form.id;
          if (formResponse.hasOwnProperty('metadata') && formResponse.metadata.studentRegistrationDoc.classId) {
            let classId = formResponse.metadata.studentRegistrationDoc.classId
            let studentRegistrationDoc = formResponse.metadata.studentRegistrationDoc
            let userProfileId = formResponse.items[0]
            flatFormResponse[`classId`] = classId;
            flatFormResponse[`student_name`] = studentRegistrationDoc.student_name;
            flatFormResponse[`student_id`] = studentRegistrationDoc.id;
            flatFormResponse[`age`] = studentRegistrationDoc.age;
            flatFormResponse[`gender`] = studentRegistrationDoc.gender;
          }
          // this feels a little inefficient - is there a better way to do this?
          // I'm unsure if formResponse.items[0] will always be the first question - that is where the userProfileId is stored.
          // That is why I'm looping through every input.
          for (let item of formResponse.items) {
            for (let input of item.inputs) {
              if (input && input.name === 'userProfileId') {
                flatFormResponse[`userProfileId`] = input.value;
              }
            }
          }
          resolve(flatFormResponse)
        }, 1000)

      })
    }
  }
}