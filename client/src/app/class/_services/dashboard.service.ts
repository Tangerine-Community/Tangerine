import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormMetadata} from '../form-metadata';
import {StudentResult} from '../reports/student-grouping-report/student-result';
import {Feedback} from '../feedback';
import {ClassGroupingReport} from '../reports/student-grouping-report/class-grouping-report';
import {ClassUtils} from '../class-utils';
import {UserService} from '../../shared/_services/user.service';
import {UserDatabase} from '../../shared/_classes/user-database.class';
import {_TRANSLATE} from 'src/app/shared/translation-marker';
import {TangyFormsInfoService} from "../../tangy-forms/tangy-forms-info-service";
import {TangyFormResponse} from "../../tangy-forms/tangy-form-response.class";
import {VariableService} from "../../shared/_services/variable.service";
import {DateTime} from "luxon";
import {sanitize} from "sanitize-filename-ts";
import {Subject} from "rxjs";
import {ClassFormService} from "./class-form.service";
import {AppConfigService} from "../../shared/_services/app-config.service";
// import Stats from 'stats-lite';

// A dummy function so TS does not complain about our use of emit in our pouchdb queries.
const emit = (key, value) => {
  return true;
};
@Injectable()
export class DashboardService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private tangyFormsInfoService : TangyFormsInfoService,
    private variableService: VariableService,
    private classFormService: ClassFormService,
  ) {}

  db: UserDatabase;
  databaseName: String;
  classUtils: ClassUtils = new ClassUtils();
  currentClassIndex
  currentClassId
  currentItemId
  currArray
  
  // Some properties that will be shared with window.T:
  selectedClass
  formList
  enabledClasses
  allStudentResults: StudentResult[];

  // public readonly enabledClasses$: BehaviorSubject<any> = new BehaviorSubject(this.getEnabledClasses());
  public readonly enabledClasses$: Subject<any> = new Subject();
  public readonly selectedClass$: Subject<any> = new Subject();
  public readonly selectedCurriculumId$: Subject<any> = new Subject();

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }

  async getFormList() {
    const formList: Array<FormMetadata> = await this.http.get<Array<FormMetadata>>('./assets/forms.json')
      .toPromise();
    return formList;
  }

  async getCurriculaForms(curriculum) {
    const formHtml =  await this.http.get(`./assets/${curriculum}/form.html`, {responseType: 'text'}).toPromise();
    return formHtml;
  }

  async getMyClasses() {
    this.db = await this.getUserDB();
    const result = await this.db.query('tangy-form/responsesByFormId', {
      key: 'class-registration',
      include_docs: true
    });
    return result.rows;
  }

  async getEnabledClasses() {
    const classes = await this.getMyClasses();
    const enabledClasses = classes.map(klass => {
      if ((klass.doc.items[0].inputs.length > 0) && (!klass.doc.archive)) {
        return klass
      }
    });
    const filteredEnabledClasses = enabledClasses.filter(item => item).sort((a, b) => (a.doc.tangerineModifiedOn > b.doc.tangerineModifiedOn) ? 1 : -1)
    this.enabledClasses = filteredEnabledClasses
    this.enabledClasses$.next(filteredEnabledClasses)
    return filteredEnabledClasses
  }

  async getBehaviorForms() {
    const forDefs = await this.getFormList();
    return forDefs.filter(form => form.id.startsWith('form-behav')).sort((a, b) => (a.id > b.id) ? 1 : -1)
  }

  /**
   * Queries the view tangy-class/responsesByClassIdCurriculumId to get the list of curricula for the selected class.
   * @param selectedClass
   */
   async getMyStudents(selectedClass: any) {
    this.db = await this.getUserDB();
    const result = await this.db.query('tangy-class/responsesForStudentRegByClassId', {
      startkey: [selectedClass],
      endkey: [selectedClass, {}],
      include_docs: true
    });
    return result.rows;
  }

  /**
   *
   * @param classId
   * @param curriculum
   * @param curriculumFormsList
   * @param tangyFormItem - optional
   */
  async getResultsByClass(classId: any, curriculum, curriculumFormsList, tangyFormItem) {
    const theKey = [classId, curriculum];
    this.db = await this.getUserDB();
    const result = await this.db.query('tangy-class/responsesByClassIdCurriculumId', {
      key: theKey,
      include_docs: true
    });
    const data = await this.transformResultSet(result.rows, curriculumFormsList, tangyFormItem);
    // clean the array
    const cleanData = this.clean(data, undefined);
    return cleanData;
  }

  async getCurriculumResponse(classId, curriculumId, studentId) {
    this.db = await this.getUserDB();
    const curriculumResponsesForClass = (await this.db.query('tangy-class/responsesByClassIdCurriculumId', {
        key: [classId, curriculumId],
        include_docs: true
      }))
      .rows
      .map(row => row.doc)
    return curriculumResponsesForClass.find(response => response.metadata.studentRegistrationDoc.id === studentId)
  }

  clean = function(obj, deleteValue) {
    for (let i = 0; i < obj.length; i++) {
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
  async archiveDoc(id) {
    try {
      this.db = await this.getUserDB();
      const doc = await this.db.get(id);
      doc.archive = true;
      const lastModified = Date.now();
      doc.lastModified = lastModified;
      const result = await this.db.put(doc);
      return result;
    } catch (e) {
      console.log('Error deleting document: ' + e);
    }
  }

  /**
   * Removed 'archived' property from document.
   * @param id
   */
  async enableDoc(id) {
    try {
      this.db = await this.getUserDB();
      const doc = await this.db.get(id);
      delete doc.archive
      const lastModified = Date.now();
      doc.lastModified = lastModified;
      const result = await this.db.put(doc);
      return result;
    } catch (e) {
      console.log('Error enabling document: ' + e);
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
    for (const observation of resultSet) {
      if (item) {
        const form = curriculumFormsList.find(x => x.id === item.id);
        const items = observation.doc['items'];
        const thisItem = items.find(x => x.id === item.id);
        const response = this.populateTransformedResult(thisItem, item, form, observation);
        transformedResults.push(response);
      } else {
        const items = observation.doc['items'];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const form = curriculumFormsList.find(x => x.id === item.id);
          const response = this.populateTransformedResult(item, i, form, observation);
          transformedResults.push(response);
        }
      }

    }
    // return Promise.all(transformedResults);
    return transformedResults;
  }

  private populateTransformedResult(item, i: number, form, observation) {

    let itemCount = 0;
    let lastModified = null;
    const answeredQuestions = [];
    const percentCorrect = null;
    const correct = 0;
    const incorrect = 0;
    const noResponse = 0;
    let score: number = null;
    // let max:number = null;
    let totalIncorrect = 0;
    let totalCorrect = 0;
    let maxValueAnswer = 0;
    let scorePercentageCorrect;
    let duration = 0;
    let prototype = 0;
    let usingScorefield = null;
    const formItemTalley = {};
    let totalMax = 0;
    let customScore = null

    if (item) {
      itemCount = item.inputs.length;
      customScore = item.customScore? item.customScore: null
      const metadata = item.metadata;
      if (metadata) {
        lastModified = metadata['lastModified'];
      }

      // usingScorefield can be useful to determine if we need to manually calculate the score.
      if (form) {
        usingScorefield = item.inputs.find(input => input.name === form['id'] + '_score');
      }

      // populate value, score, max, and totalMax

      item.inputs.forEach(input => {
        // inputs = [...inputs, ...input.value]
        // There are sometimes properties added to the inputs array - such as "userProfileId" or "tabletUserName" 
        // that are not html elements. Let's filter those out because those are not answeredQuestions.
          if (input.tagName) {
            const data = {};
            const valueField = input.value;
            let value;
            let max: number = null;
            if (input.tagName === 'TANGY-INPUT') {
              if (typeof input.max !== 'undefined' && input.max !== '') {
                max = parseFloat(input.max);
                // don't add to totalMax if it's the _score field
                if (input.name !== form['id'] + '_score') {
                  totalMax = totalMax + max;
                }
              }
            } else  if (input.tagName === 'TANGY-RADIO-BUTTONS') {
              valueField.forEach(option => {
                const optionValue = parseFloat(option.name);
                if (option.value !== '') {
                  value = optionValue;
                }
                if (optionValue > max) {
                  max = optionValue;
                }
              });
              totalMax =  totalMax + max;
            } else  if (input.tagName === 'TANGY-CHECKBOX') {
              if (input.value !== '') {
                value = 1;
              }
              ++totalMax;
            } else  if (input.tagName === 'TANGY-CHECKBOXES') {
              valueField.forEach(option => {
                const optionValue = parseFloat(option.name);
                if (option.value !== '') {
                  value = optionValue;
                }
                if (optionValue > max && optionValue !== 888) {
                  max = optionValue;
                }
                totalMax = totalMax + max;
              });
            } else  if (input.tagName === 'TANGY-BOX') {
              // ignore
            } else  if (input.tagName?.includes('WIDGET')) {
              // ignore
            } else {
              if (input.value !== '') {
                value = input.value;
              }
              totalMax = ++totalMax;
            }
            data[input.name] = value;
            if (!score) {
              score = 0
            }
            if (!max) {
              max = 0
            }
            data['score'] = score;
            data['max'] = max;
            answeredQuestions.push(data);
          }
      });

      if (usingScorefield) {
        formItemTalley['score'] = parseFloat(usingScorefield.value);
      }

      formItemTalley['totalMax'] =  totalMax;

      // The previous code block should have populated the score field for this tangy-form-item.
      // Now deal with the special case of TANGY-TIMED and get some aggregate scores.
      // Check if tangy-form-item has been removed.
      if (typeof form !== 'undefined') {
        const childElements = form.children;
        if (childElements) {
          let alreadyAnswered = false;
          for (const element of childElements) {
            // console.log("element name: " + element.name)
            // Check if there are grid subtests aka tangy-timed in this response
            if (element.tagName === 'TANGY-TIMED' || element.tagName === 'TANGY-UNTIMED-GRID') {
              for (const answer of answeredQuestions) {
                const value = answer[element.name];
                if (typeof value !== 'undefined') {
                  maxValueAnswer = value.length;
                  const reducer = (incorrect, button) => button.pressed ? ++incorrect : incorrect;
                  totalIncorrect = value.reduce(reducer, 0);
                  totalCorrect = maxValueAnswer - totalIncorrect;
                  score = totalCorrect;
                  formItemTalley['totalMax'] = 100
                  scorePercentageCorrect = Math.round(totalCorrect / maxValueAnswer * 100);
                  alreadyAnswered = true;
                }
                // console.log("TANGY-TIMED subtest name: " + element.name + " totalIncorrect: " + totalIncorrect + " of " + maxValueAnswer)
              }
              duration = element.duration;
              prototype = element.tagName;
            }
          }

          // for tangy-form-items that use the _score field
          if (usingScorefield) {
            const totalAnswers = item.inputs.length - 1;
            if (totalAnswers > 0) {
              score = formItemTalley['score'];
              totalCorrect = score;
              // maxValueAnswer = totalAnswers
              maxValueAnswer = totalAnswers;
              if (formItemTalley['totalMax']) {
                maxValueAnswer = formItemTalley['totalMax'];
                totalIncorrect = totalAnswers - totalCorrect;
                scorePercentageCorrect =  Math.round(score / formItemTalley['totalMax'] * 100);
              }
              // prototype = element.tagName
              // console.log("element.tagName: " + element.tagName + " subtest name: " + element.name + " totalIncorrect: " + totalIncorrect + " of " + maxValueAnswer + " score: " + score + " scorePercentageCorrect: " + scorePercentageCorrect)
            }
          }

          if (typeof scorePercentageCorrect === 'undefined') {
            // Auto-calculate scores for tangy form items that don't use _score or are not tangy-timed grids.
            // const totalAnswers = item.inputs.length;
            // calculate the total score manually.
            for (const answer of answeredQuestions) {
              // let value = answer[element.name];
              const answerScore = parseFloat(answer['score']);
              const max = parseFloat(answer['max']);
              totalCorrect = totalCorrect + answerScore;
              maxValueAnswer = maxValueAnswer + max;
            }
            score = totalCorrect;
            scorePercentageCorrect = customScore ? customScore : Math.round(totalCorrect / maxValueAnswer * 100);
            if (customScore) {
              maxValueAnswer = 100
            }
          }
        }
      }
    }
    if (itemCount > 0) {
      let studentId;
      if (observation.doc.metadata && observation.doc.metadata.studentRegistrationDoc) {
        studentId = observation.doc.metadata.studentRegistrationDoc.id;
      }
      let category;
      if (typeof form !== 'undefined') {
        category = form['category'];
        if (typeof category !== 'undefined' && category !== null) {
          category = category.trim();
        }
      }

      const response = {
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
        max: formItemTalley['totalMax'],
        totalIncorrect: totalIncorrect,
        maxValueAnswer: maxValueAnswer,
        totalCorrect: totalCorrect,
        scorePercentageCorrect: scorePercentageCorrect,
        duration: duration,
        customScore: customScore
      };

      if (prototype) {
        response['prototype'] = prototype;
      }

      // observations.push(response)
      return response;
    }
  }

  async getDataForColumns(array, columns) {
    const data = {};
      columns.map(column => {
      const input = array[0].inputs.find(input => (input.name === column) ? true : false);
      if (input) {
        data[column] = input.value;
      }
    });
    return data;
  }

  async getClassGroupReport(item, classId, curriculumId, results) {

    // # Used to calculate percentiles
    // # Use indices where Index = Standard Deviation * 100 for negative deviations
    const normalCurve = [0.00000, 0.00399, 0.00798, 0.01197, 0.01595, 0.01994, 0.02392, 0.02790, 0.03188, 0.03586, 0.03983, 0.04380, 0.04776, 0.05172, 0.05567, 0.05962, 0.06356, 0.06749, 0.07142, 0.07535, 0.07926, 0.08317, 0.08706, 0.09095, 0.09483, 0.09871, 0.10257, 0.10642, 0.11026, 0.11409, 0.11791, 0.12172, 0.12552, 0.12930, 0.13307, 0.13683, 0.14058, 0.14431, 0.14803, 0.15173, 0.15542, 0.15910, 0.16276, 0.16640, 0.17003, 0.17364, 0.17724, 0.18082, 0.18439, 0.18793, 0.19146, 0.19497, 0.19847, 0.20194, 0.20540, 0.20884, 0.21226, 0.21566, 0.21904, 0.22240, 0.22575, 0.22907, 0.23237, 0.23565, 0.23891, 0.24215, 0.24537, 0.24857, 0.25175, 0.25490, 0.25804, 0.26115, 0.26424, 0.26730, 0.27035, 0.27337, 0.27637, 0.27935, 0.28230, 0.28524, 0.28814, 0.29103, 0.29389, 0.29673, 0.29955, 0.30234, 0.30511, 0.30785, 0.31057, 0.31327, 0.31594, 0.31859, 0.32121, 0.32381, 0.32639, 0.32894, 0.33147, 0.33398, 0.33646, 0.33891, 0.34134, 0.34375, 0.34614, 0.34849, 0.35083, 0.35314, 0.35543, 0.35769, 0.35993, 0.36214, 0.36433, 0.36650, 0.36864, 0.37076, 0.37286, 0.37493, 0.37698, 0.37900, 0.38100, 0.38298, 0.38493, 0.38686, 0.38877, 0.39065, 0.39251, 0.39435, 0.39617, 0.39796, 0.39973, 0.40147, 0.40320, 0.40490, 0.40658, 0.40824, 0.40988, 0.41149, 0.41308, 0.41466, 0.41621, 0.41774, 0.41924, 0.42073, 0.42220, 0.42364, 0.42507, 0.42647, 0.42785, 0.42922, 0.43056, 0.43189, 0.43319, 0.43448, 0.43574, 0.43699, 0.43822, 0.43943, 0.44062, 0.44179, 0.44295, 0.44408, 0.44520, 0.44630, 0.44738, 0.44845, 0.44950, 0.45053, 0.45154, 0.45254, 0.45352, 0.45449, 0.45543, 0.45637, 0.45728, 0.45818, 0.45907, 0.45994, 0.46080, 0.46164, 0.46246, 0.46327, 0.46407, 0.46485, 0.46562, 0.46638, 0.46712, 0.46784, 0.46856, 0.46926, 0.46995, 0.47062, 0.47128, 0.47193, 0.47257, 0.47320, 0.47381, 0.47441, 0.47500, 0.47558, 0.47615, 0.47670, 0.47725, 0.47778, 0.47831, 0.47882, 0.47932, 0.47982, 0.48030, 0.48077, 0.48124, 0.48169, 0.48214, 0.48257, 0.48300, 0.48341, 0.48382, 0.48422, 0.48461, 0.48500, 0.48537, 0.48574, 0.48610, 0.48645, 0.48679, 0.48713, 0.48745, 0.48778, 0.48809, 0.48840, 0.48870, 0.48899, 0.48928, 0.48956, 0.48983, 0.49010, 0.49036, 0.49061, 0.49086, 0.49111, 0.49134, 0.49158, 0.49180, 0.49202, 0.49224, 0.49245, 0.49266, 0.49286, 0.49305, 0.49324, 0.49343, 0.49361, 0.49379, 0.49396, 0.49413, 0.49430, 0.49446, 0.49461, 0.49477, 0.49492, 0.49506, 0.49520, 0.49534, 0.49547, 0.49560, 0.49573, 0.49585, 0.49598, 0.49609, 0.49621, 0.49632, 0.49643, 0.49653, 0.49664, 0.49674, 0.49683, 0.49693, 0.49702, 0.49711, 0.49720, 0.49728, 0.49736, 0.49744, 0.49752, 0.49760, 0.49767, 0.49774, 0.49781, 0.49788, 0.49795, 0.49801, 0.49807, 0.49813, 0.49819, 0.49825, 0.49831, 0.49836, 0.49841, 0.49846, 0.49851, 0.49856, 0.49861, 0.49865, 0.49869, 0.49874, 0.49878, 0.49882, 0.49886, 0.49889, 0.49893, 0.49896, 0.49900, 0.49903, 0.49906, 0.49910, 0.49913, 0.49916, 0.49918, 0.49921, 0.49924, 0.49926, 0.49929, 0.49931, 0.49934, 0.49936, 0.49938, 0.49940, 0.49942, 0.49944, 0.49946, 0.49948, 0.49950, 0.49952, 0.49953, 0.49955, 0.49957, 0.49958, 0.49960, 0.49961, 0.49962, 0.49964, 0.49965, 0.49966, 0.49968, 0.49969, 0.49970, 0.49971, 0.49972, 0.49973, 0.49974, 0.49975, 0.49976, 0.49977, 0.49978, 0.49978, 0.49979, 0.49980, 0.49981, 0.49981, 0.49982, 0.49983, 0.49983, 0.49984, 0.49985, 0.49985, 0.49986, 0.49986, 0.49987, 0.49987, 0.49988, 0.49988, 0.49989, 0.49989, 0.49990, 0.49990, 0.49990, 0.49991, 0.49991, 0.49992, 0.49992, 0.49992, 0.49992, 0.49993, 0.49993, 0.49993, 0.49994, 0.49994, 0.49994, 0.49994, 0.49995, 0.49995, 0.49995, 0.49995, 0.49995, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49998, 0.49998, 0.49998, 0.49998];
    const colorClass  = ['concerning', 'poor', 'mediocre', 'good', 'great'];
    const status      = [_TRANSLATE('Concerning'), _TRANSLATE('Poor'), _TRANSLATE('Mediocre'), _TRANSLATE('Good'), _TRANSLATE('Great')];

    const studentsResponses: any[] = [];
    for (const response of results as any[] ) {
      const studentId = response.studentId;
      let studentReponses = studentsResponses[studentId];
      if (typeof studentReponses === 'undefined') {
        studentReponses = {};
      }
      const formId = response.formId;
      studentReponses[formId] = response;
      studentsResponses[studentId] = studentReponses;
    }
    const allStudentResults: Array<StudentResult> = [];
    let studentsAssessed = 0;
    let aveCorrect = 0;
    let aveCorrectPerc = 0;
    let attempted = 0;
    const studentsToWatch = [];
    let duration = 0;
    const itemId = item.id;
    let classGroupReportMax = null;

    const students = await this.getMyStudents(classId);

    for (const student of students) {
      const studentResults: StudentResult = new StudentResult();
      const student_name = this.getValue('student_name', student.doc)
      const classId = this.getValue('classId', student.doc)
      studentResults.id = student.id;
      studentResults.name = student_name
      studentResults.classId = classId
      studentResults.forms = [];
      if (studentsResponses[student.id]) {
        const studentResponse = studentsResponses[student.id][itemId];
        if (studentResponse) {
          studentResults.response = studentResponse;
          const score = studentResponse.score;
          if (typeof score !== 'undefined') {
            studentResults.score = score;
            // console.log("student: " + studentResults["name"]  + " form item: " + studentResults["response"]["formTitle"]  + " score: " + score)
          }
          const max = studentResponse.customScore? 100: studentResponse.max;
          if (max) {
            studentResults.max = max;
            classGroupReportMax = max;
          }
          const totalCorrect = studentResponse.customScore ? studentResponse.customScore : studentResponse.totalCorrect;
          const scorePercentageCorrect = studentResponse.customScore ? studentResponse.customScore : studentResponse.scorePercentageCorrect;
          studentResults.scorePercentageCorrect = scorePercentageCorrect;
          const maxValueAnswer = studentResponse.customScore ? 100: studentResponse.maxValueAnswer;
          studentResults.maxValueAnswer = maxValueAnswer;
          studentResults.customScore = studentResponse.customScore
          duration = studentResponse.duration;

          aveCorrect += totalCorrect;
          aveCorrectPerc += scorePercentageCorrect;
          attempted += maxValueAnswer;
          studentsAssessed ++;
          // TODO: factor correct answers per minute.
          // TODO: factor attempted vs not attempted.
        }
      }
      allStudentResults.push(studentResults);
    }

    const aveCorrectPercReport = this.classUtils.round( aveCorrectPerc / studentsAssessed, 0 );
    const aveCorrectReport = this.classUtils.round( aveCorrect / studentsAssessed, 2 );
    const attemptedReport = this.classUtils.round( attempted / studentsAssessed, 2 );

    aveCorrectPerc = this.classUtils.decimals( aveCorrectPerc / studentsAssessed, 0 );

    const squareDiffs = allStudentResults.map(function(studentResult) {
      const scorePercentageCorrect = studentResult.scorePercentageCorrect;
      const diff = scorePercentageCorrect - aveCorrectPerc;
      const sqr = diff * diff;
      return sqr;
    });

    const avgSquareDiff = average(squareDiffs);

    const stdDev = Math.sqrt(avgSquareDiff);

    // let vals = allStudentResults.map(studentResult => studentResult.score)
    // let stdDev2 = Stats.stdev(vals)
    // console.log("stdDev: " + stdDev + " stdDev2: " + stdDev2)

    function average(data) {
      const sum = data.reduce(function(sum, value) {
        return sum + value;
      }, 0);

      const avg = sum / data.length;
      return avg;
    }

    for (const studentResult of allStudentResults) {
      const scorePercentageCorrect = studentResult.scorePercentageCorrect;
      if (typeof scorePercentageCorrect !== 'undefined') {
        // dev = (person.pCorrect - @summary.aCorrect) / @summary.stdDev
        const dev = (scorePercentageCorrect - aveCorrectPerc) / stdDev;
        const devIndex = Math.round(dev * 100);
        let calculatedScore;
        if (devIndex > 409 || devIndex < -409) {
          calculatedScore = 0;
        } else if (devIndex > 0) {
          calculatedScore = 100 * Math.round(50 + 100 * normalCurve[devIndex] ) / 100;
             } else if (devIndex < 0) {
          calculatedScore = 100 * Math.round(50 - 100 * normalCurve[devIndex * -1] ) / 100;
             } else {
          calculatedScore = 50;
             }

        const percentile = this.calculatePercentile(scorePercentageCorrect);

        studentResult['percentile'] = percentile;
        studentResult['status'] = status[percentile];
        studentResult['colorClass'] = colorClass[percentile];
        if (percentile === 0) {
          studentsToWatch.push(studentResult['name']);
        }
        studentResult['calculatedScore'] = calculatedScore;
        // console.log("Student name: " + studentResult.name + " percentile: " + studentResult.percentile + " scorePercentageCorrect: " + scorePercentageCorrect + " calculatedScore: " + calculatedScore )
      }
    }


    function compare(a, b) {
      if (typeof a.score === 'undefined' && b.score) {
        return 1;
      }
      if (a.score && typeof b.score === 'undefined') {
        return -1;
      }
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      return 0;
    }


    const classGroupReport: ClassGroupingReport = {
      id: null,
      curriculumId: null,
      itemId: null,
      subtestName: null,
      classSize: null,
      studentsAssessed: null,
      aveCorrectPerc: null,
      aveCorrect: null,
      attempted: null,
      max: null,
      studentsToWatch: null,
      duration: null,
      feedback: null,
      allStudentResults: []
    };

    classGroupReport.curriculumId = curriculumId;
    classGroupReport.itemId = item.id;
    classGroupReport.subtestName = item.title;
    classGroupReport.studentsAssessed = studentsAssessed;
    classGroupReport.classSize = students.length;
    classGroupReport.max = classGroupReportMax;

    classGroupReport.aveCorrectPerc = aveCorrectPercReport;
    classGroupReport.aveCorrect = aveCorrectReport;
    classGroupReport.attempted = attemptedReport;
    classGroupReport.duration = duration;
    classGroupReport.studentsToWatch = studentsToWatch;
    // classGroupReport.feedback = feedback
    classGroupReport.allStudentResults = allStudentResults.sort(compare);
    return classGroupReport;
  }

  public calculatePercentile(score) {
    let percentile;
    if (score >= 80) {
      percentile = 4;
    } else if (score >= 60 && score <= 79) {
      percentile = 3;
         } else if (score >= 40 && score <= 59) {
      percentile = 2;
         } else if (score >= 20 && score <= 39) {
      percentile = 1;
         } else {
      percentile = 0;
         }
    return percentile;
  }

  public calculatePercentileRange(percentile) {
    let percentileRange;
    if (percentile == 4) {
      percentileRange = '80% - 100%';
    } else if (percentile == 3) {
      percentileRange = '60% - 79%';
    } else if (percentile == 2) {
      percentileRange = '40% - 59%';
    } else if (percentile == 1) {
      percentileRange = '20% - 39%';
    } else if (percentile == 0) {
      percentileRange = '0% - 19%';
    }
    return percentileRange;
  }

  public async getFeedback(percentile, curriculumId, itemId) {
    let feedback: Feedback;
    const forDefs = await this.getFormList();
    const formMetadata: FormMetadata = forDefs.find(form => form.id === curriculumId);
    if (formMetadata.feedbackItems) {
      feedback = formMetadata.feedbackItems.find(item => item.formItem === itemId && String(item.percentile) === String(percentile));
      if (feedback) {
        const tpl = eval('`' + feedback.message + '`');
        feedback.message = tpl;
      } else {
        feedback = new Feedback();
        feedback.percentile = percentile;
        feedback.message = 'No feedback available for this percentile.';
      }
    }
    return feedback;
  }

  /**
  * Special parsing for enabled curriculums.
  * By default returns the curriculum name.
   * Set provideCurriculumObject if you want a special curriculum Object, which is useful for menu labels.
  * */
  public getValue = (variableName, response) => {
    if (response) {
      const variablesByName = response.items.reduce((variablesByName, item) => {
        for (const input of item.inputs) {
          variablesByName[input.name] = input.value;
        }
        return variablesByName;
      }, {});
        return !Array.isArray(variablesByName[variableName]) ? variablesByName[variableName] : variablesByName[variableName].reduce((optionThatIsOn, option) => optionThatIsOn = option.value === 'on' ? option.name : optionThatIsOn, '');
    }
  };

  /**
  * Special parsing for enabled curriculums.
  * By default returns a special curriculum Object, which is useful for menu labels.
  * */
  public getCurriculumObject = (variableName, response) => {
    if (response) {
      const variablesByName = response.items.reduce((variablesByName, item) => {
        for (const input of item.inputs) {
          variablesByName[input.name] = input.value;
        }
        return variablesByName;
      }, {});
        return variablesByName[variableName].reduce((optionThatIsOn, option) => {
          optionThatIsOn = option.value === 'on' ? {name: option.name, label: option.label} : optionThatIsOn, ''
          return optionThatIsOn
        })
    }
  };

  getDoc = async (id) => {
    this.db = await this.getUserDB()
    return await this.db.get(id)
  }

  saveDoc = async (doc) => {
    this.db = await this.getUserDB()
    return await this.db.put(doc);
  }

  /**
   * Queries allDocs to get docs for either attendance or score. Performs a searchDateRange search by default.
   * @param type
   * @param currentClass
   * @param reportDate. If null, calculates today's date. Calculates a month previous for searchEndKey.
   * @param curriculumLabel - may be empty if ignoreCurriculumsForTracking is set in the class-registration form (currentClass).
   * @param randomId
   * @param searchDateRange
   */
  async searchDocs(type: string, currentClass, reportDate: string, curriculumLabel: string, randomId: string, searchDateRange: boolean = true) {
    let wildcardSearchString = '\uffff'
    this.db = await this.getUserDB();
    if (!reportDate) {
      reportDate = DateTime.local().toISODate()
    }
    const lastMonth = DateTime.fromISO(reportDate).minus({ months: 1 }).toISODate()
    let endDate = searchDateRange ? lastMonth : reportDate
    const grade = this.getValue('grade', currentClass)
    let searchStartKey: string, searchEndKey: string
    if (curriculumLabel) {
      if (reportDate) {
        searchStartKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + sanitize(curriculumLabel.replace(/\s+/g, '')) + '-' + reportDate
        searchEndKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + sanitize(curriculumLabel.replace(/\s+/g, '')) + '-' + endDate
      } else {
        searchStartKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + sanitize(curriculumLabel.replace(/\s+/g, ''))
        searchEndKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + sanitize(curriculumLabel.replace(/\s+/g, ''))
      }
    } else {
      if (reportDate) {
        searchStartKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + reportDate
        searchEndKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + endDate
      } else {
        searchStartKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId
        searchEndKey = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId
      }
    }
    const options = {
      startkey: searchStartKey,
      endkey: searchEndKey + wildcardSearchString,
      include_docs: true
    }
    if (reportDate) {
      options['startkey'] = searchStartKey +  wildcardSearchString
      options['endkey'] = searchEndKey
      options['descending'] = true
    }
    const result = await this.db.allDocs(options);
    return result.rows;
  }

  /**
   * Generate a unique id for the attendance or score report
   * @param currentClass
   * @param curriculumLabel
   * @param type
   * @param randomId - generated on the client when a class is created by the class-registration form.
   */
  generateSearchableId(currentClass, curriculumLabel: string, type: string, randomId: string) {
    let id: string;
    const username = this.userService.getCurrentUser()
    const reportDate = DateTime.local().toISODate()
    const reportTime = DateTime.local().toISOTime()
    const grade = this.getValue('grade', currentClass)
    if (!curriculumLabel) {
      id = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + reportDate + '-' + sanitize(username) + '-' + reportTime
    } else {
      id = type + '-' + sanitize(grade.replace(/\s+/g, '')) + '-' + randomId + '-' + sanitize(curriculumLabel.replace(/\s+/g, '')) + '-' + reportDate + '-' + sanitize(username) + '-' + reportTime
    }
    return {reportDate, grade, reportTime, id};
  }
  
  /**
   * Grafted from task-report.component.ts
   * Loops through all the student scores and calculates the presentPercentage for each student
   * @param attendanceList
   * @param register
   * @private
   */
  async processAttendanceReport(attendanceList, register) {
    for (let i = 0; i < attendanceList.length; i++) {
      const attendanceStudent = attendanceList[i]
      const student = register.attendanceList.find((thisStudent) => {
        return thisStudent.id === attendanceStudent.id
      })
      if (student) {
        student.reportCount = student.reportCount ? student.reportCount + 1 : 1
        student.presentCount = student.presentCount ? student.presentCount : 0
        if (typeof attendanceStudent.absent !== 'undefined') {
          if (attendanceStudent.absent === false) {
            student.presentCount = student.presentCount + 1
          }
          student.presentPercentage = Math.round((student.presentCount / student.reportCount) * 100)
        }
      }
    }
  }

  /**
   * Grafted from task-report.component.ts
   * Loops through all the student scores and calculates the average mood, present, and score for each student
   * populate students array if you need to add phone and other properties from studentRegistration.
   * @param attendanceList
   * @param currentAttendanceReport
   * @private
   */
  async processBehaviorReport(behaviorList, register) {
    for (let i = 0; i < behaviorList.length; i++) {
      const behaviorStudent = behaviorList[i]
      const student = register.attendanceList.find((thisStudent) => {
        return thisStudent.id === behaviorStudent.id
      })
      if (student) {
        student.behaviorSum = student.behaviorSum ? student.behaviorSum : 0
        if (typeof behaviorStudent.behavior?.internalPercentage !== 'undefined') {
          student.behaviorReportCount = student.behaviorReportCount ? student.behaviorReportCount + 1 : 1
          student.behaviorSum = student.behaviorSum + behaviorStudent.behavior?.internalPercentage
          student.behaviorPercentage = Math.round((student.behaviorSum / student.behaviorReportCount))
        }
      }
    }
  }

  processScoreReport(scoreReport, student, scoreUnits, ignoreCurriculumsForTracking: boolean, currentStudent, curriculum) {
    const currentStudentScore = scoreReport?.scoreList.find((thisStudent) => {
      return thisStudent.id === student.id
    })
    if (currentStudentScore) {
      const curriculumLabel = sanitize(curriculum.label.replace(/\s+/g, ''))
      const len = scoreUnits.length
      let total = 0
      let completedUnits = 0
      scoreUnits.forEach((scoreUnit, index) => {
        const currentScore = currentStudentScore['score_' + index];
        if (currentScore) {
          if (ignoreCurriculumsForTracking) {
            if (!currentStudent.unitScores) {
              currentStudent.unitScores = {}
            }
            currentStudent.unitScores[curriculumLabel + '_score_' + index] = currentScore
          } else {
            currentStudent['score_' + index] = currentScore
          }
          total = total + currentScore
          completedUnits++
        }
      })
      const averageScore = total / completedUnits
      if (!isNaN(averageScore)) {
        if (ignoreCurriculumsForTracking) {
          if (!currentStudent.scores) {
            currentStudent.scores = {}
          }
          // using bracket notation in case the curriculumId is a number.
          currentStudent.scores[curriculumLabel] = averageScore
        } else {
          currentStudent.score = averageScore
        }
      }
    }
  }

  async getRecentVisitsReport(recentVisitReports) {
    // do a deep clone
    const recentVisitDoc = recentVisitReports[recentVisitReports.length - 1]?.doc
    const currentAttendanceReport = JSON.parse(JSON.stringify(recentVisitDoc))
    const currentBehaviorReport = null
    for (let i = 0; i < recentVisitReports.length; i++) {
        const attendanceReport = recentVisitReports[i];
        const attendanceList = attendanceReport.doc.attendanceList
        await this.processAttendanceReport(attendanceList, currentAttendanceReport)

    }
    // this.recentVisitsReport = currentAttendanceReport
    return currentAttendanceReport
  }

  rankStudentScores(studentReportsCards: StudentReportsCards) {
    const groupings: Array<GroupingTable> = [];
    const colorClass = ['concerning', 'poor', 'mediocre', 'good', 'great'];
    const status = ['Concerning', 'Poor', 'Mediocre', 'Good', 'Great'];
    Object.values(studentReportsCards).forEach((reportCard: StudentResult) => {
      const reduceClassAverage = (p, studentResult) => {
        return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
      };
      const calcAverage = array => array.reduce(reduceClassAverage, 0) / array.length;
      const average = Math.round(calcAverage(reportCard.results));
      reportCard.scorePercentageCorrect = average;
      const percentile = this.calculatePercentile(average);

      const groupingTable = new GroupingTable();
      groupingTable.name = reportCard.name;
      groupingTable.result = reportCard;
      groupingTable.percentile = percentile;
      groupingTable.status = status[percentile];
      groupingTable.colorClass = colorClass[percentile];

      groupings.push(groupingTable);
    });
    // this.totals = totals;
    // this.studentReportsCards = studentReportsCards;
    function compare(a, b) {
      if (typeof a.result.scorePercentageCorrect === 'undefined' && b.result.scorePercentageCorrect) {
        return 1;
      }
      if (a.result.scorePercentageCorrect && typeof b.result.scorePercentageCorrect === 'undefined') {
        return -1;
      }
      if (a.result.scorePercentageCorrect < b.result.scorePercentageCorrect) {
        return 1;
      }
      if (a.result.scorePercentageCorrect > b.result.scorePercentageCorrect) {
        return -1;
      }
      return 0;
    }
    return groupings.sort(compare);
  }

  async generateStudentReportsCards(curriculum, classId) {
    const studentReportsCards: StudentReportsCards = {};
    const curriculumId = curriculum.name
    const curriculumFormHtml = await this.getCurriculaForms(curriculumId);
    const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    const itemReport = await Promise.all(curriculumFormsList.map(async item => {
        const results = await this.getResultsByClass(classId, curriculumId, curriculumFormsList, item);
        if (results.length > 0) {
          return await this.getClassGroupReport(item, classId, curriculumId, results);
        }
      })
    );
    Object.keys(itemReport).forEach((item) => {
      if (typeof itemReport[item] !== 'undefined') {
        const report: ClassGroupingReport = itemReport[item];
        const allStudentResults: Array<StudentResult> = report.allStudentResults;
        const reduceClassAverage = (p, studentResult) => {
          return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
        };
        const calcAverage = array => array.reduce(reduceClassAverage, 0) / array.length;
        const average = Math.round(calcAverage(allStudentResults));

        // now add array of studentResults to each student's record.
        const collectStudentResults = (studentResult: StudentResult) => {
          let reportCard = studentReportsCards[studentResult.id];
          if (typeof reportCard === 'undefined') {
            reportCard = new StudentResult();
            reportCard.results = new Array<StudentResult>();
            reportCard.curriculum = curriculum;
            reportCard.name = studentResult.name;
            reportCard.id = studentResult.id;
          }
          reportCard.results.push(studentResult);
          studentReportsCards[studentResult.id] = reportCard;
        };
        allStudentResults.forEach(collectStudentResults);
      }
    });
    return studentReportsCards
  }


  async populateCurrentCurriculums(currentClass) {
    let inputs = [], fullCurrArray
    currentClass.items.forEach(item => inputs = [...inputs, ...item.inputs]);
    if (inputs.length > 0) {
      // find the curriculum element
      const curriculumInput = inputs.find(input => (input.name === 'curriculum') ? true : false);
      // find the options that are set to 'on'
      if (curriculumInput) {
        const currArray = curriculumInput.value.filter(input => (input.value === 'on') ? true : false);
        fullCurrArray =  Promise.all(currArray.map(async curr => {
          const formId = curr.name;
          const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
          curr.label = formInfo.title
          curr.labelSafe = sanitize(formInfo.title.replace(/\s+/g, ''))
          return curr
        }));
      } else {
        fullCurrArray = [];
      }
      
    }

    return fullCurrArray;
  }

  getClassTitle(classResponse: TangyFormResponse) {
    const gradeInput = classResponse?.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput?.value
  }

  /**
   * Get the attendance list for the class, including any students who have not yet had attendance checked. If the savedAttendanceList is passed in, then
   * populate the student from that doc by matching student.id.
   * @param students
   * @param savedList
   */
  async getAttendanceList(students, savedList, curriculum) {
    // const curriculumFormHtml = await this.getCurriculaForms(curriculum.name);
    // const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    const list = []
    for (const student of students) {
      let studentResult
      const studentId = student.id
      if (savedList) {
        studentResult = savedList.find(studentDoc => studentDoc.id === studentId)
      }
      if (studentResult) {
        list.push(studentResult)
      } else {
        const student_name = this.getValue('student_name', student.doc)
        const student_surname = this.getValue('student_surname', student.doc)
        const phone = this.getValue('phone', student.doc);
        const classId = this.getValue('classId', student.doc)
        
        studentResult = {}
        studentResult['id'] = studentId
        studentResult['name'] = student_name
        studentResult['surname'] = student_surname
        studentResult['phone'] = phone
        studentResult['classId'] = classId
        studentResult['forms'] = {}
        // curriculumFormsList.forEach((form) => {
        //   const formResult = {};
        //   formResult['formId'] = form.id;
        //   formResult['curriculum'] = curriculum.name;
        //   formResult['title'] = form.title;
        //   formResult['src'] = form.src;
        //   // if (studentsResponses[student.id]) {
        //   //   formResult['response'] = studentsResponses[student.id][form.id];
        //   // }
        //   studentResult['forms'][form.id] = formResult;
        // });
        
        studentResult['absent'] = false
        studentResult['behavior'] = null

        // const internalBehaviorFormHtml =  await this.http.get(`./assets/form-internal-behaviour/form.html`, {responseType: 'text'}).toPromise();
        // const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
        // curriculumFormsList.forEach((form) => {
        //   const formResult = {};
        //   formResult['formId'] = form.id;
        //   formResult['curriculum'] = curriculumName;
        //   formResult['title'] = form.title;
        //   formResult['src'] = form.src;
        //   if (studentsResponses[student.id]) {
        //     formResult['response'] = studentsResponses[student.id][form.id];
        //   }
        //   studentResults['forms'][form.id] = formResult;
        // });

        // await this.addBehaviorRecords(studentResult, studentId);
        list.push(studentResult)
      }
    }
    return list
    // await this.populateFeedback(curriculumId);
  }

  /**
   * Get the score list for the class, including any students who have not yet had attendance checked. If the savedScoreList (listFromDoc) is passed in, then
   * populate the student from that doc by matching student.id.
   * @param students
   * @param listFromDoc
   */
  async getScoreList(students, listFromDoc) {
    const list = []
    for (const student of students) {
      let studentResult
      const studentId = student.id
      if (listFromDoc) {
        studentResult = listFromDoc.find(studentDoc => studentDoc.id === studentId)
      }
      if (studentResult) {
        list.push(studentResult)
      } else {
        const student_name = this.getValue('student_name', student.doc)
        const student_surname = this.getValue('student_surname', student.doc)
        const phone = this.getValue('phone', student.doc);
        const classId = this.getValue('classId', student.doc)

        studentResult = {}
        studentResult['id'] = studentId
        studentResult['name'] = student_name
        studentResult['surname'] = student_surname
        studentResult['phone'] = phone
        studentResult['classId'] = classId
        studentResult['forms'] = {}
        studentResult['absent'] = false
        studentResult['behavior'] = null

        // const internalBehaviorFormHtml =  await this.http.get(`./assets/form-internal-behaviour/form.html`, {responseType: 'text'}).toPromise();
        // const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
        // curriculumFormsList.forEach((form) => {
        //   const formResult = {};
        //   formResult['formId'] = form.id;
        //   formResult['curriculum'] = curriculumName;
        //   formResult['title'] = form.title;
        //   formResult['src'] = form.src;
        //   if (studentsResponses[student.id]) {
        //     formResult['response'] = studentsResponses[student.id][form.id];
        //   }
        //   studentResults['forms'][form.id] = formResult;
        // });

        // await this.addBehaviorRecords(studentResult, studentId);
        list.push(studentResult)
      }
    }
    return list
    // await this.populateFeedback(curriculumId);
  }
  
  // async addBehaviorRecords(studentResult, studentId) {
  //   const formsList = [
  //     {
  //       formId: 'form-internal-behaviour',
  //       curriculum: 'form-internal-behaviour',
  //       title: 'Comportamientos internalizantes',
  //       src: './assets/form-internal-behaviour/form.html'
  //     },
  //     // {
  //     //   formId: 'form-external-behaviour',
  //     //   curriculum: 'form-external-behaviour',
  //     //   title: 'Comportamientos externalizantes',
  //     //   src: './assets/form-external-behaviour/form.html'
  //     // }
  //   ]
  //   formsList.forEach((form) => {
  //     const formResult = {};
  //     formResult['formId'] = form.formId;
  //     formResult['curriculum'] = form.curriculum;
  //     formResult['title'] = form.title;
  //     formResult['src'] = form.src;
  //     studentResult['forms'][form.formId] = formResult;
  //   })
  //
  //   const responses = await this.classFormService.getResponsesByStudentId(studentId);
  //   for (const response of responses as any[]) {
  //     // const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
  //     const respFormId = response.doc.form.id;
  //     // if (respClassId === this.classId && respCurrId === this.curriculum) {
  //     //   this.formResponse = response.doc;
  //     // }
  //     // studentResult['forms'][respFormId] = response.doc;
  //     if (studentResult['forms'][respFormId]) {
  //       studentResult['forms'][respFormId]['response'] = response.doc;
  //     }
  //
  //     const responseDoc = response.doc
  //     switch (respFormId) {
  //       case 'form-internal-behaviour':
  //         const usingScorefield = responseDoc.items[0].inputs.find(input => input.name === responseDoc['form']['id'] + '_score');
  //         const intScore = usingScorefield.value
  //         studentResult['behavior']['internal'] = intScore
  //         studentResult['behavior']['internalPercentage'] = Math.round((intScore / 18) * 100)
  //       //   break
  //       // case 'form-external-behaviour':
  //       //   const usingScorefield2 = responseDoc.items[0].inputs.find(input => input.name === responseDoc['form']['id'] + '_score');
  //       //   const extScore = usingScorefield2.value
  //       //   studentResult['behavior']['external'] = extScore
  //       //   studentResult['behavior']['externalPercentage'] = Math.round((extScore / 18) * 100)
  //       //   break
  //     }
  //   }
  // }

  async initDashboard(classIndex: number, currentClassId: string, curriculumId: string, resetVars: boolean, enabledClasses) {
    if (typeof enabledClasses === 'undefined') {
      enabledClasses = await this.getEnabledClasses();
    }
    this.enabledClasses = enabledClasses
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {
      let currentClass, currentItemId = '';
      if (resetVars) {
        await this.variableService.set('class-classIndex', classIndex.toString());
        await this.variableService.set('class-currentClassId', currentClassId);
        await this.variableService.set('class-curriculumId', curriculumId);
      }
      this.currentClassIndex = 0;
      const __vars = await this.initExposeVariables(classIndex, curriculumId);
      classIndex = __vars.classIndex;
      currentItemId = __vars.currentItemId;
      currentClassId = __vars.currentClassId;
      curriculumId = __vars.curriculumId;
      currentClass = __vars.currentClass;

      if (currentClassId && currentClassId !== '') {
        this.currentClassId = currentClassId;
      } else {
        this.currentClassId = currentClass.id;
        await this.variableService.set('class-currentClassId', this.currentClassId);
      }
      if (currentItemId && currentItemId !== '') {
        this.currentItemId = currentItemId;
      } else {
        this.currentItemId = null;
      }
      const curriculumFormHtml = await this.getCurriculaForms(curriculumId);
      const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);

      this.formList = await this.populateFormsMetadata(curriculumId, curriculumFormsList, currentClass);

      if (!currentItemId || currentItemId === '') {
        const initialForm = curriculumFormsList[0];
        this.currentItemId = initialForm.id;
      }
      window['T'].classDashboard.selectedClass = this.selectedClass
      window["T"].classDashboard.formList = this.formList
      window["T"].classDashboard.enabledClasses = this.enabledClasses
      
      const allStudentResults = await this.selectSubTask(this.currentItemId, this.currentClassId, curriculumId, curriculumFormsList);
      return allStudentResults
    }
  }

  async initExposeVariables(classIndex: number, curriculumId: string) {
    let currentItemId: string
    let currentClassId: string
    let currentClass
    if (!classIndex) {
      let classClassIndex = await this.variableService.get('class-classIndex')
      if (classClassIndex !== null) {
        classIndex = parseInt(classClassIndex)
        if (!Number.isNaN(classIndex)) {
          this.currentClassIndex = classIndex;
        }
      }
      currentItemId = await this.variableService.get('class-currentItemId');
      currentClassId = await this.variableService.get('class-currentClassId');
      curriculumId = await this.variableService.get('class-curriculumId');
    } else {
      this.currentClassIndex = classIndex
    }
    
    currentClass = this.enabledClasses[this.currentClassIndex]?.doc
    if (typeof currentClass === 'undefined') {
      // Maybe a class has been removed
      this.currentClassIndex = 0
      currentClass = this.enabledClasses[this.currentClassIndex].doc
    }
    
    this.currArray = await this.populateCurrentCurriculums(currentClass);
    if (typeof curriculumId === 'undefined' || curriculumId === null || curriculumId === '') {
      const curriculum = this.currArray[0];
      curriculumId = curriculum.name;
    }
    this.selectedCurriculumId$.next(curriculumId)

    await this.variableService.set('class-curriculumId', curriculumId);
    await this.variableService.set('class-classIndex', this.currentClassIndex);
    await this.variableService.set('class-currentClassId', this.currentClassId);
    
    this.selectedClass = currentClass;
    this.selectedClass$.next(currentClass)
    return {classIndex, currentItemId, currentClassId, curriculumId, currentClass};
  }

// Uses curriculumFormsList to populate formList for a curriculum.
  async populateFormsMetadata(curriculumId, curriculumFormsList, currentClass) {
    // this only needs to happen once.
    if (typeof curriculumFormsList === 'undefined') {
      const msg = _TRANSLATE(`This is an error - there are no this.curriculumForms
      for this curriculum or range. Check if the config files are available.`);
      console.log(msg);
      alert(msg);
    }

    const formList = [];
    let currentClassId;
    // const currentClass = this.enabledClasses[this.currentClassIndex];
    if (typeof currentClass !== 'undefined') {
      currentClassId = currentClass._id;
    }
    for (const form of curriculumFormsList) {
      const formEl = {
        'title': form.title,
        'id': form.id,
        'classId': currentClassId,
        'curriculumId': curriculumId
      };
      formList.push(formEl);
    }
    return formList
  }

  async selectSubTask(itemId, classId, curriculumId, curriculumFormsList) {
    // console.log("selectSubTask itemId: " + itemId + " classId: " + classId + " curriculumId: " + curriculumId)
    const curriculumName = curriculumId
    if (!curriculumFormsList) {
      const curriculumFormHtml = await this.getCurriculaForms(curriculumId);
      curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    }
    await this.variableService.set( 'class-currentItemId', itemId );
    const students = await this.getMyStudents(classId);
    const item = curriculumFormsList.find(x => x.id === itemId);
    const results = await this.getResultsByClass(classId, curriculumName, [item], item);
    const studentsResponses = [];
    const formsTodisplay = {};
    curriculumFormsList.forEach(form => {
      formsTodisplay[form.id] = form;
    });
    for (const response of results as any[] ) {
      if (formsTodisplay[response.formId] !== 'undefined') {
        const studentId = response.studentId;
        let studentReponses = studentsResponses[studentId];
        if (typeof studentReponses === 'undefined') {
          studentReponses = {};
        }
        const formId = response.formId;
        studentReponses[formId] = response;
        studentsResponses[studentId] = studentReponses;
      }
    }
    const allStudentResults = [];
    students.forEach((student) => {
      const studentResults = {};
      const student_name = this.getValue('student_name', student.doc)
      const phone = this.getValue('phone', student.doc);
      const classId = this.getValue('classId', student.doc)
      studentResults['id'] = student.id;
      studentResults['name'] = student_name
      studentResults['phone'] = phone
      studentResults['classId'] = classId
      studentResults['forms'] = {};
      curriculumFormsList.forEach((form) => {
        const formResult = {};
        formResult['formId'] = form.id;
        formResult['curriculum'] = curriculumName;
        formResult['title'] = form.title;
        formResult['src'] = form.src;
        if (studentsResponses[student.id]) {
          formResult['response'] = studentsResponses[student.id][form.id];
        }
        studentResults['forms'][form.id] = formResult;
      });
      allStudentResults.push(studentResults);
    });
    return allStudentResults;
  }

  // Triggered by dropdown selection in UI.
  async populateCurriculum (classIndex, curriculumId) {
    const currentClass = this.enabledClasses[classIndex];
    const currentClassId = currentClass.id;
    this.allStudentResults = await this.initDashboard(classIndex, currentClassId, curriculumId, true, this.enabledClasses);
  }


  async setCurrentClass() {
    await this.variableService.set('class-classIndex', null);
    await this.variableService.set('class-currentClassId', null);
    await this.variableService.set('class-curriculumId', null);
    await this.variableService.set('class-currentItemId', null);
    const classes = await this.getMyClasses();
    const enabledClasses = classes.map(klass => {
      if (!klass.doc.archive) {
        return klass
      }
    });
    const allEnabledClasses = enabledClasses.filter(item => item).sort((a, b) => (a.doc.tangerineModifiedOn > b.doc.tangerineModifiedOn) ? 1 : -1)
    // set classIndex to allEnabledClasses.length
    const classIndex = allEnabledClasses.length - 1
    const currentClass = this.getSelectedClass(allEnabledClasses, classIndex);
    const currentClassId = currentClass._id
    await this.variableService.set('class-classIndex', classIndex);
    await this.variableService.set('class-currentClassId', currentClassId);
  }

  /**
   * Notified subscribers when selectedClass is set.
   * Returns the currentClass doc.
   * @param allEnabledClasses
   * @param classIndex
   */
  getSelectedClass(allEnabledClasses: any[], classIndex: number) {
    const currentClass = allEnabledClasses[classIndex]?.doc
    this.selectedClass$.next(currentClass)
    return currentClass;
  }
  
  buildAttendanceReport(id: string, timestamp: number, currentClassId, grade, schoolName, schoolYear, reportDate: string, type: string, attendanceList) {
    return {
      _id: id,
      timestamp: timestamp,
      classId: currentClassId,
      grade: grade,
      schoolName: schoolName,
      schoolYear: schoolYear,
      reportDate: reportDate,
      attendanceList: attendanceList,
      collection: 'TangyFormResponse',
      type: type,
      form: {
        id: type,
      },
      items: [{
        id: 'class-registration',
        title: 'Class Registration',
        inputs: [{}]
      },
        {
          id: 'item_1',
          title: 'Item 1',
          inputs: [{
            name: 'timestamp',
            label: 'timestamp'
          }]
        }],
      complete: false
    }
  }
}


export class StudentReportsCards {
  [key: string]: StudentResult
}

export class GroupingTable {
  name: string;
  result: StudentResult;
  percentile: number;
  status: string;
  colorClass: string;
}