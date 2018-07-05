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

  async getMyResults(studentId) {
    const result = await this.userDB.query('tangy-class/responsesByStudentId', {
      key: 'class-registration',
      include_docs: true
    });
    return result.rows;
  }

  async getMyStudents(selectedClass: any) {
    console.log("selectedClass: " + selectedClass)
    const result = await this.userDB.query('tangy-class/responsesForStudentRegByClassId', {
    // const result = await this.userDB.query('tangy-form/responsesByFormId', {
      key: selectedClass,
      // key: 'student-registration',
      include_docs: true
    });
    // let results = result.rows;
    // for (const result of results) {
    //   let inputs = [];
    //   result.doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
    //   let input = inputs.find(input => (input.name === 'classId') ? true : false)
    //   if (input) {
    //     console.log("input: " + input.value)
    //   }
    // }
    return result.rows;
  }

  async getResultsByClass(classId: any, forms) {
    console.log("classId: " + classId)
    const result = await this.userDB.query('tangy-class/responsesByClassId', {
      key: classId,
      include_docs: true
    });
    const data = await this.transformResultSet(result.rows, forms);
    // clean the array
    Array.prototype.clean = function(deleteValue) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
          this.splice(i, 1);
          i--;
        }
      }
      return this;
    };
    data.clean(undefined);
    return data;
  }

  async transformResultSet(result, formList) {
    // const appConfig = await this.appConfigService.getAppConfig();
    // const columnsToShow = appConfig.columnsOnVisitsTab;
    const columnsToShow = ["studentId"];
    // const formList = await this.getCurriculaForms(curriculum);

    const observations = result.map(async (observation) => {
      let columns = await this.getDataForColumns(observation.doc['items'], columnsToShow);
      // columns = columns.filter(x => x !== undefined);
      const index = formList.findIndex(c => c.id === observation.doc.form['id']);
      if (formList[index]) {
        let response = {
          formTitle: formList[index]['title'],
          formId: formList[index]['id'],
          startDatetime: observation.doc.startDatetime,
          formIndex: index,
          _id: observation.doc._id,
          count: observation.doc['items'][0].inputs.length,
          columns
        };
        return response;
      }
    });
    return Promise.all(observations);
  }

  async getDataForColumns(array, columns) {
    let data = {}
      columns.map(column => {
      // const data = array.map(el => {
      //   return el.inputs.find(e => e.name === column);
      // }).find(x => x);
      // return ({
      //   name: data ? data.name : column,
      //   value: data ? data.value : ''
      // });
      let input = array[0].inputs.find(input => (input.name === column) ? true : false)
      if (input) {
        data[column] = input.value;
      }
    });
    return data;
  }

}

