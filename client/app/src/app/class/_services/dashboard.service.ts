import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import PouchDB from 'pouchdb';
import {AuthenticationService} from "../../core/auth/_services/authentication.service";

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
}
@Injectable()
export class DashboardService {

  constructor(
    authenticationService: AuthenticationService,
    private http: HttpClient
  ) {
    this.userDB = new PouchDB
    (authenticationService.getCurrentUserDBPath());
  }

  userDB;
  db:any;
  databaseName: String;

  async getFormList() {
    const formList:any = await this.http.get('./assets/forms.json')
      .toPromise()

    return formList;
  }

  async getCurriculaForms(curriculum) {
    let formHtml =  await this.http.get(`./assets/${curriculum}/form.html`, {responseType: 'text'}).toPromise();
    return formHtml;
  }

  async getMyClasses() {
    const result = await this.userDB.query('tangy-form/responsesByFormId', {
      key: 'class-registration',
      include_docs: true
    });
    return result.rows;
  }

  async getMyStudents(selectedClass: any) {
    const result = await this.userDB.query('tangy-class/responsesForStudentRegByClassId', {
      startkey: [selectedClass],
      endkey: [selectedClass,{}],
      include_docs: true
    });
    return result.rows;
  }

  async getResultsByClass(classId: any, curriculum, curriculumFormsList) {
    const theKey = [classId,curriculum]
    const result = await this.userDB.query('tangy-class/responsesByClassIdCurriculumId', {
      key: theKey,
      include_docs: true
    });
    const data = await this.transformResultSet(result.rows, curriculumFormsList);
    // clean the array
    let cleanData = this.clean(data, undefined);
    return cleanData;
  }

  clean = function(obj, deleteValue) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i] == deleteValue) {
        obj.splice(i, 1);
        i--;
      }
    }
    return obj;
  };

  /**
   * Creates a list of forms with the results populated
   * @param result
   * @param curriculumFormsList - use to find if the form is a grid subtest.
   * @returns {Promise<any[]>}
   */
  async transformResultSet(result, curriculumFormsList) {

    const observations = [];
    // let forms = {}
    // curriculumFormsList.forEach(form => {
    //   forms[form.id] = form
    // })

    result.forEach(async observation => {
      let items = observation.doc['items']
      // filter out the forms we're currently not interested in
      // let formId = observation.doc.form.id
      // if (typeof forms[formId] !== 'undefined') {
      //   // we want this result.
      //
      // }

      for (var i = 0; i < curriculumFormsList.length; i++) {

        let itemCount = 0;
        let lastModified = null;
        let answeredQuestions = [];
        let percentCorrect = null;
        let correct = 0;
        let incorrect = 0;
        let noResponse = 0;
        let score = 0;

        let item = observation.doc['items'][i];
        if (item) {
          itemCount = item.inputs.length
          let metadata = item.metadata;
          if (metadata) {
            lastModified = metadata['lastModified']
          }
          // populate answeredQuestions array
          item.inputs.forEach(item => {
            // inputs = [...inputs, ...item.value]
            if (item.value !== "") {
              let data = {}
              data[item.name] = item.value;
              answeredQuestions.push(data)
              if (item.name === curriculumFormsList[i]['id'] + "_score") {
                score = item.value
              }
            }
          })
          // loop through answeredQuestions and calculate correct, incorrect, and missing.
        //   if (curriculumFormsList[i]['prototype'] === 'grid') {
        //
        //   }  else {
        //     for (const answer of answeredQuestions) {
        //       let values = Object.values(answer)
        //       if (typeof values !== 'undefined') {
        //         for (const value of values) {
        //           if (value['tagName'] === 'TANGY-RADIO-BUTTON') {
        //             if (value['label'] === 'Correct' && value['value'] === 'on') {
        //               correct++
        //             } else if (value['label'] === 'Incorrect' && value['value'] === 'on') {
        //               incorrect++
        //             } else if (value['label'] === '>No response' && value['value'] === 'on') {
        //               noResponse++
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        //   if (answeredQuestions.length > 0) {
        //     percentCorrect =  Math.round((answeredQuestions.length/itemCount) * 100)
        //   } else {
        //     percentCorrect = 0
        //   }
        }
        if (itemCount > 0) {
          let studentId
          if (observation.doc.metadata && observation.doc.metadata.studentRegistrationDoc) {
            studentId = observation.doc.metadata.studentRegistrationDoc.id;
          }
          let category = curriculumFormsList[i]['category']
          if (typeof category !== 'undefined' && category !== null) {
            category = category.trim()
          }

          let response = {
            formTitle: curriculumFormsList[i]['title'],
            formId: curriculumFormsList[i]['id'],
            prototype: curriculumFormsList[i]['prototype'],
            category: category,
            startDatetime: observation.doc.startUnixtime,
            formIndex: i,
            _id: observation.doc._id,
            itemCount: itemCount,
            studentId: studentId,
            lastModified: lastModified,
            answeredQuestions: answeredQuestions,
            percentCorrect: percentCorrect,
            correct: correct,
            incorrect: incorrect,
            noResponse: noResponse,
            score: score
            // columns
          };

          // return response;
          observations.push(response)
          // }
        }
      }
    });
    // });
    // return Promise.all(observations);
    return observations;
  }

  async getDataForColumns(array, columns) {
    let data = {}
      columns.map(column => {
      let input = array[0].inputs.find(input => (input.name === column) ? true : false)
      if (input) {
        data[column] = input.value;
      }
    });
    return data;
  }

}

