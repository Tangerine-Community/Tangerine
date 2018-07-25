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
      key: selectedClass,
      include_docs: true
    });
    return result.rows;
  }

  async getResultsByClass(classId: any, forms) {
    const result = await this.userDB.query('tangy-class/responsesByClassId', {
      key: classId,
      include_docs: true
    });
    const data = await this.transformResultSet(result.rows, forms);
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

  async transformResultSet(result, formList) {
    // const appConfig = await this.appConfigService.getAppConfig();
    // const columnsToShow = appConfig.columnsOnVisitsTab;
    const columnsToShow = ["studentId"];
    // const formList = await this.getCurriculaForms(curriculum);

    // const observations = result.map(async (observation) => {
    const observations = [];
    result.forEach(async observation => {
      // let columns = await this.getDataForColumns(observation.doc['items'], columnsToShow);
      // columns = columns.filter(x => x !== undefined);
      // const index = formList.findIndex(c => c.id === observation.doc.form['id']);
      // loop through the formList
      for (var i = 0; i < formList.length; i++) {

        let itemCount = null;
        let lastModified = null;
        let answeredQuestions = [];
        let percentCorrect = null;
        if (observation.doc['items'][i]) {
          itemCount = observation.doc['items'][i].inputs.length
          let metadata = observation.doc['items'][i].metadata;
          if (metadata) {
            lastModified = metadata['lastModified']
          }
          observation.doc['items'][i].inputs.forEach(item => {
            // inputs = [...inputs, ...item.value]
            if (item.value !== "") {
              let data = {}
              data[item.name] = item.value;
              answeredQuestions.push(data)
            }
          })
          if (answeredQuestions.length > 0) {
            percentCorrect =  Math.round((answeredQuestions.length/itemCount) * 100)
          } else {
            percentCorrect = 0
          }
        }
        // if (formList[index]) {
        let response = {
          formTitle: formList[i]['title'],
          formId: formList[i]['id'],
          startDatetime: observation.doc.startDatetime,
          formIndex: i,
          _id: observation.doc._id,
          itemCount: itemCount,
          studentId: observation.doc.metadata.studentRegistrationDoc.id,
          lastModified: lastModified,
          answeredQuestions: answeredQuestions,
          percentCorrect: percentCorrect
          // columns
        };

        // return response;
        observations.push(response)
        // }
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

