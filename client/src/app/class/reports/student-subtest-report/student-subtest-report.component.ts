import { UserService } from 'src/app/shared/_services/user.service';
import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ClassFormService} from '../../_services/class-form.service';
import {DashboardService} from '../../_services/dashboard.service';
import {ClassUtils} from '../../class-utils';
import {AppConfigService} from '../../../shared/_services/app-config.service';
import {StudentResult} from '../student-grouping-report/student-result';
import {TangyFormService} from '../../../tangy-forms/tangy-form.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { tNumber } from 'src/app/t-number.util';
import { ClassFormMetadata } from '../../_classes/class-form-metadata.class';

export class SubtestReport {
  formId: any;
  label: any;
  categories: any;
  totals: any;
  studentCategorizedResults: any;
  noCategories: any;
  usingPercentages = false;
  cssName: string;
}

@Component({
  selector: 'app-student-subtest-report',
  templateUrl: './student-subtest-report.component.html',
  styleUrls: ['./student-subtest-report.component.css']
})
export class StudentSubtestReportComponent implements OnInit, AfterViewChecked {

  classUtils: ClassUtils;
  curriculumFormsList;
  students: any;
  studentCategorizedResults: any;
  categories: any;
  noCategories: any;
  usingPercentages: any;
  totals: any;
  curriculums: any;
  subtestReports: any;
  revealReport = false;
  today:string 

  @ViewChild('subTestReport', {static: true}) subTestReport: ElementRef;
  @ViewChild('curriculumSelectElement', {static: true}) curriculumSelect: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private userService: UserService,
    private appConfigService: AppConfigService,
    private classFormService: ClassFormService,
    private tangyFormService: TangyFormService,
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  tNumber(fragment) {
    return tNumber(fragment)
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig()
    this.today = this.tNumber(window['moment'](Date.now()).format(appConfig.dateFormat))
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.classUtils = new ClassUtils();
    }
    await this.dashboardService.initialize();
    const classId = this.route.snapshot.paramMap.get('classId');
    this.students = (await this.getMyStudents(classId)).sort((a, b) => a.student_name.localeCompare(b.student_name));
  }

  ngAfterViewChecked() {
    if (this.revealReport) {
      const firstReport = this.subtestReports[0];
      const el = this.subTestReport.nativeElement.querySelector('#curr-' + firstReport['cssName']);
      if (el) {
        el.style.display = 'block';
      }
      this.revealReport = false;
    }
  }

  async onStudentSelect(event) {
    if (event.value && event.value !== 'none') {
      await this.getReport(event.value);
      this.curriculumSelect.nativeElement.style.display = 'block';
      // the view needs to be refreshed before we can access this report; thus revealReport in ngAfterViewChecked;
      this.revealReport = true;
    }
  }

  onCurriculumSelect(event) {
    if (event.value && event.value !== 'none') {
      const el = this.subTestReport.nativeElement.querySelector(`#curr-${event.value}`);
      if (el) {
        this.subtestReports.forEach(subtestReport => {
          const childEl = this.subTestReport.nativeElement.querySelector('#curr-' + subtestReport['cssName']);
          childEl.style.display = 'none';
        });
        el.style.display = 'block';
      }
    }
  }

  async getReport(studentId) {
    // Get data about this particular subtest

    this.curriculums = [];

    let formId;
    let classIndex;
    const __vars = await this.dashboardService.initExposeVariables(classIndex, formId);
    const currentClass = __vars.currentClass;
    if (!classIndex) {
      classIndex = __vars.classIndex;
    }
    formId = __vars.formId;

    const curriculumArray = await this.dashboardService.getCurriculumArray();
    const enabledClasses = await this.dashboardService.getEnabledClasses();

    // When app is initialized, there is no formId, so we need to set it to the first one.
    if (!formId && curriculumArray?.length > 0) {
      formId = curriculumArray[0]
    }

    const curriculumInputValues = currentClass.items[0].inputs.filter(input => input.name === 'curriculum')[0].value;
    const curriculum = curriculumInputValues.find(form => form.name === formId);
    const classFormMetadata = new ClassFormMetadata(curriculum);
    this.curriculums.push(classFormMetadata);

    this.subtestReports = [];
    for (const curriculum of this.curriculums) {
      const formId = curriculum.name;
      const cssName = curriculum.labelSafe;
      const label = curriculum.label;
      const subtestReport = new SubtestReport();
      subtestReport.formId = formId;
      subtestReport.label = label;
      subtestReport.cssName = cssName;

      const curriculumFormHtml = await this.dashboardService.getForm(formId);
      const curriculumFormsList = await this.classUtils.createCurriculumFormItemsList(curriculumFormHtml);
      // this.subtestReport.students = await this.getMyStudents(classId);
      const appConfig = await this.appConfigService.getAppConfig();
      this.categories = appConfig.categories;
      let categoryName;
      if (typeof this.categories === 'undefined' || this.categories.length === 0) {
        this.categories = [];
        subtestReport.noCategories = true;
        categoryName = _TRANSLATE('Results');
      } else {
        subtestReport.noCategories = false;
        categoryName = _TRANSLATE('Unassigned Category');
      }

      this.categories.push(categoryName);

      subtestReport.categories = this.categories;

      this.totals = {};
      for (const thisCategory of this.categories) {
        this.totals[thisCategory] = 0;
      }

      subtestReport.totals = this.totals;

      // let students = (studentIds.length > 0)
      //   ? (await this.getMyStudents(classId)).filter(student => studentIds.indexOf(student.id) !== -1)
      //   : await this.getMyStudents(classId);
      const studentResults = {};
      // for (const student of students) {
      //   let studentId = student.id
        const forms = {};
        for (const form of curriculumFormsList) {
          const name = form.title;
          forms[name] = {};
        }
        studentResults[studentId] = forms;
      // }

      const responses = (await this.classFormService.getResponsesByStudentId(studentId)).reduce((acc, curr) => {
        return curr.doc.form.id === formId ? acc.concat(curr) : acc;
      }, [])
      const data = await this.dashboardService.transformResultSet(responses, curriculumFormsList, null);
      // clean the array
      const results: Array<StudentResult> = this.dashboardService.clean(data, undefined);
      const student = this.students.find(x => x.id === studentId);

      for (const result of results) {
        // TODO filter by curriculum
        const formTitle = result.formTitle;
        const studentId = result.studentId;
        let category = result.category;
        const isCategory = this.categories.find(function(item) {
          return item === category;
        });
        if (!isCategory && typeof category !== 'undefined' && category !== '') {
          // console.log("!isCategory: " + category)
          this.categories.push(category);
          this.totals[category] = 0;
        }
        if (category === '') {
          category = _TRANSLATE('Unassigned Category');
        }
        const rawScore = parseInt(result.score).toString();
        // let percentage = rawScore
        let percentage, totalCorrect;
        const percentCorrect = result.scorePercentageCorrect;
        if (percentCorrect) {
          percentage = percentCorrect + '%';
          subtestReport.usingPercentages = true;
        } else {
          // percentage = result.totalCorrect
          totalCorrect = result.totalCorrect;
        }
        const resultObject = {};
        for (const thisCategory of this.categories) {
          resultObject[thisCategory] = null;
        }
        const scores = {
          rawScore: result.score,
          totalGridAnswers: result.maxValueAnswer,
          percentage: percentage,
          totalCorrect: totalCorrect,
          customScore: result.customScore
        };
        resultObject[category] = scores;
        const currentTotal = this.totals[category];
        this.totals[category] = currentTotal + parseInt(result.score);
        const forms = studentResults[studentId];
        if (typeof forms !== 'undefined') {
          forms[formTitle] = resultObject;
        }
      }
      this.studentCategorizedResults = [];
      // for (const student of students) {
      //   let studentId = student.id
        const result = {};
        result['name'] = student.student_name;
        result['results'] = studentResults[studentId];
        this.studentCategorizedResults.push(result);
      // }

      subtestReport.studentCategorizedResults = this.studentCategorizedResults;

      this.subtestReports.push(subtestReport);
    }

  }

  generateArray(obj) {
    const result =  Object.keys(obj).map((key) => ({key: key, value: obj[key]}));
    // console.log("result: " + JSON.stringify(result))
    return result;
  }

  isEmpty(obj) {
    const stringy = JSON.stringify(obj);
    if (Object.keys(obj).length === 0) {
      return true;
    } else {
      return false;
    }
  }

  async getMyStudents(classId: any) {
    const observations = [];
    try {
      // find which class is selected
      const studentResults = await this.dashboardService.getMyStudents(classId);
      for (const result of studentResults) {
        const student = {};
        result.doc['items'][0].inputs.forEach(item => {
          // inputs = [...inputs, ...item.value]
          if (item.value !== '') {
            student[item.name] = item.value;
            // if (item.name === curriculumFormsList[i]['id'] + "_score") {
            //   score = item.value
            // }
          }
        });
        student['id'] = result.doc['_id'];
        observations.push(student);
      }
    } catch (error) {
      console.error(error);
    }
    return observations;
  }

  async getResultsByClass(selectedClass: any, curriculum, curriculumFormsList) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, curriculumFormsList, null);
    } catch (error) {
      console.error(error);
    }
  }

}
