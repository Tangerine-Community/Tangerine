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
    // const forms = [];
    const formList:any = await this.http.get('./assets/forms.json')
      .toPromise()
    // for (const form of formList) {
    //   forms.push({
    //     title: form['title'],
    //     src: form['src'],
    //     id: form['id'],
    //     curricula: form['curricula']
    //   });
    // }
    return formList;
  }

  async getCurriculaForms(curriculum) {
    // const forms = [];

    let formHtml =  await this.http.get(`./assets/${curriculum}/form.html`, {responseType: 'text'}).toPromise();

    // for (const form of formList) {
    //   forms.push({
    //     title: form['title'],
    //     src: form['src'],
    //     id: form['id'],
    //     curricula: form['curricula']
    //   });
    // }
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
    const result = await this.userDB.query('tangy-class/responsesByClassId', {
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

}

