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
    const formList:Array<any> = await this.http.get<Array<any>>('./assets/forms.json')
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

  async getResultsByClass(classId: any, curriculum, curriculumFormsList, tangyFormItem) {
    const theKey = [classId,curriculum]
    const result = await this.userDB.query('tangy-class/responsesByClassIdCurriculumId', {
      key: theKey,
      include_docs: true
    });
    const data = await this.transformResultSet(result.rows, curriculumFormsList, tangyFormItem);
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
   * Acts like a delete but archives instead so that it will get sync'd.
   * @param id
   */
  async archiveStudentRegistration(id) {
    try {
      let doc = await this.userDB.get(id)
      doc.archive = true
      let lastModified = Date.now();
      doc.lastModified = lastModified
      const result = await this.userDB.put(doc)
      return result
    } catch (e) {
      console.log("Error deleting student: " + e)
    }

  }

  /**
   * Creates a list of forms with the results populated
   * @param resultSet
   * @param curriculumFormsList - use to find if the form is a grid subtest.
   * @param tangyFormItem - use to filter by tangyFormItem
   * @returns {Promise<any[]>}
   */
  async transformResultSet(resultSet, curriculumFormsList, item) {

    const transformedResults = [];
    resultSet.forEach(async observation => {
      if (item) {
        let form = curriculumFormsList.find(x => x.id === item.id)
        let items = observation.doc['items']
        let thisItem = items.find(x => x.id === item.id)
        let response = this.poopulateTransformedResult(thisItem, i, form, observation);
        transformedResults.push(response)
      } else {
        let items = observation.doc['items']
        for (var i = 0; i < items.length; i++) {
          let item = items[i];
          let form = curriculumFormsList.find(x => x.id === item.id)
          let response = this.poopulateTransformedResult(item, i, form, observation);
          transformedResults.push(response)
        }
      }

    });
    // return Promise.all(transformedResults);
    return transformedResults;
  }

  private poopulateTransformedResult(item, i: number, form, observation) {

    let itemCount = 0;
    let lastModified = null;
    let answeredQuestions = [];
    let percentCorrect = null;
    let correct = 0;
    let incorrect = 0;
    let noResponse = 0;
    let score = 0;
    let max = null;
    let totalGridIncorrect = 0;
    let totalGridCorrect = 0;
    let totalGridAnswers = 0;
    let totalGridPercentageCorrect = 0;
    let duration = 0;
    let prototype = 0;

    if (item) {
      itemCount = item.inputs.length
      let metadata = item.metadata;
      if (metadata) {
        lastModified = metadata['lastModified']
      }
      // populate answeredQuestions array
      item.inputs.forEach(input => {
        // inputs = [...inputs, ...input.value]
        if (input.value !== "") {
          let data = {}
          let valueField = input.value;
          let value;
          if (input.tagName === 'TANGY-INPUT') {
            if (typeof input.max !== 'undefined' && input.max !== '') {
              max = input.max
            }
          }
          if (input.tagName === 'TANGY-RADIO-BUTTONS') {
            valueField.forEach(option => {
              if (option.value !== "") {
                value = option.name
              }
            })
          } else {
            value = input.value
          }
          data[input.name] = value;
          answeredQuestions.push(data)
          if (typeof form !== 'undefined') {
            if (input.name === form['id'] + "_score") {
              score = value
            }
          }
        }
      })

      // Check if tangy-form-item has been removed.
      if (typeof form !== 'undefined') {
        let childElements = form.children
        if (childElements) {
          let alreadyAnswered = false
          for (const element of childElements) {
            // console.log("element name: " + element.name)
            // Check if there are grid subtests aka tangy-timed in this response
            if (element.tagName === 'TANGY-TIMED') {
              for (const answer of answeredQuestions) {
                let value = answer[element.name]
                if (typeof value !== 'undefined') {
                  totalGridAnswers = value.length;
                  const reducer = (incorrect, button) => button.pressed ? ++incorrect : incorrect
                  totalGridIncorrect = value.reduce(reducer, 0)
                  totalGridCorrect = totalGridAnswers - totalGridIncorrect
                  totalGridPercentageCorrect = Math.round(totalGridCorrect / totalGridAnswers * 100)
                  alreadyAnswered = true
                }
                // console.log("subtest name: " + element.name + " totalGridIncorrect: " + totalGridIncorrect + " of " + totalGridAnswers)
              }
              duration = element.duration;
              prototype = element.tagName
            } else {
              // Don't want to process the element if it is the _score field
              // don't talley if already answered, in the case of a grid subtest.
              if (!alreadyAnswered) {
                // one of the answeredQuestions is the _score, so don't count it.
                const totalAnswers = item.inputs.length - 1
                if (totalAnswers > 0) {
                  totalGridAnswers = totalAnswers
                  totalGridCorrect = Number(score)
                  totalGridIncorrect = totalAnswers - totalGridCorrect
                  if (max) {
                    totalGridPercentageCorrect =  Math.round(score / max * 100)
                  } else {
                    totalGridPercentageCorrect = Math.round(totalGridCorrect / totalGridAnswers * 100)
                  }
                  prototype = element.tagName
                  // console.log("subtest name: " + element.name + " totalGridIncorrect: " + totalGridIncorrect + " of " + totalGridAnswers + " score: " + score)
                }
              }
            }
          }
        }
      }
    }
    if (itemCount > 0) {
      let studentId
      if (observation.doc.metadata && observation.doc.metadata.studentRegistrationDoc) {
        studentId = observation.doc.metadata.studentRegistrationDoc.id;
      }
      let category
      if (typeof form !== 'undefined') {
        category = form['category']
        if (typeof category !== 'undefined' && category !== null) {
          category = category.trim()
        }
      }

      let response = {
        formTitle: item['title'],
        formId: item['id'],
        prototype: item['prototype'],
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
        score: score,
        max: max,
        totalGridIncorrect: totalGridIncorrect,
        totalGridAnswers: totalGridAnswers,
        totalGridCorrect: totalGridCorrect,
        totalGridPercentageCorrect: totalGridPercentageCorrect,
        duration: duration
      };

      if (prototype) {
        response['prototype'] = prototype
      }

      // observations.push(response)
      return response
    }
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

