import { UserService } from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ClassFormService} from "../../_services/class-form.service";
import {DashboardService} from "../../_services/dashboard.service";
import {ClassUtils} from "../../class-utils";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {StudentResult} from "../student-grouping-report/student-result";

export class SubtestReport {
  curriculumId:any
  label:any
  categories: any;
  totals:any;
  studentCategorizedResults:any
  noCategories:any
  usingPercentages:boolean = false;
  cssName: string;
}

@Component({
  selector: 'app-student-subtest-report',
  templateUrl: './student-subtest-report.component.html',
  styleUrls: ['./student-subtest-report.component.css']
})
export class StudentSubtestReportComponent implements OnInit {

  classFormService:ClassFormService;
  classUtils: ClassUtils
  curriculumFormsList
  students:any
  studentCategorizedResults:any
  categories: any;
  noCategories: any;
  usingPercentages: any;
  totals:any;
  curriculums:any;
  subtestReports:any
  revealReport:boolean = false;

  @ViewChild('subTestReport', {static: true}) subTestReport: ElementRef;
  @ViewChild('curriculumSelectPara', {static: true}) curriculumSelect: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit() {
    const currentUser = await this.userService.getCurrentUser();
    if (currentUser) {
      const classFormService = new ClassFormService({databaseName: currentUser});
      this.classFormService = classFormService
      this.classUtils = new ClassUtils();
    }
    const classId = this.route.snapshot.paramMap.get('classId');
    this.students = (await this.getMyStudents(classId)).sort((a, b) => a.student_name.localeCompare(b.student_name))
  }

  ngAfterViewChecked() {
    if (this.revealReport) {
      let firstReport = this.subtestReports[0];
      let el = this.subTestReport.nativeElement.querySelector("#curr-" + firstReport['cssName'])
      if (el) {
        el.style.display = "block"
      }
      this.revealReport = false;
    }
  }

  async onStudentSelect(event) {
    if (event.value && event.value !== 'none') {
      await this.getReport(event.value)
      this.curriculumSelect.nativeElement.style.display = "block"
      // the view needs to be refreshed before we can access this report; thus revealReport in ngAfterViewChecked;
      this.revealReport = true;
    }
  }

  onCurriculumSelect(event) {
    if (event.value && event.value !== 'none') {
      let el = this.subTestReport.nativeElement.querySelector(`#curr-${event.value}`)
      if (el) {
        this.subtestReports.forEach(subtestReport => {
          let childEl = this.subTestReport.nativeElement.querySelector("#curr-" + subtestReport['cssName'])
          childEl.style.display = "none"
        })
        el.style.display = "block"
      }
    }
  }

  async getReport(studentId) {
    const classId = this.route.snapshot.paramMap.get('classId');
    // console.log("type: " + classId)
    let classDoc = await this.classFormService.getResponse(classId);
    let classRegistration = this.classUtils.getInputValues(classDoc);

    // Get data about this particular subtest

    this.curriculums = []
    let allCurriculums = classRegistration.curriculum;
    for (const curriculum of allCurriculums as any[] ) {
      if (curriculum['value'] === 'on') {
        this.curriculums.push(curriculum)
      }
    }

    this.subtestReports = [];
    for (const curriculum of this.curriculums) {
      let curriculumId = curriculum.name;
      let cssName = curriculumId.replace(/\./g, "-")
      let label = curriculum.label;
      let subtestReport = new SubtestReport()
      subtestReport.curriculumId = curriculumId;
      subtestReport.label = label;
      subtestReport.cssName = cssName;

      let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
      let curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
      // this.subtestReport.students = await this.getMyStudents(classId);
      const appConfig = await this.appConfigService.getAppConfig();
      this.categories = appConfig.categories;
      let categoryName;
      if (typeof this.categories === 'undefined' || this.categories.length === 0) {
        this.categories = []
        subtestReport.noCategories = true;
        categoryName = "Results";
      } else {
        subtestReport.noCategories = false;
        categoryName = "Unassigned Category";
      }

      this.categories.push(categoryName)

      subtestReport.categories = this.categories;

      this.totals = {}
      for (const thisCategory of this.categories) {
        this.totals[thisCategory] = 0
      }

      subtestReport.totals = this.totals;

      // let students = (studentIds.length > 0)
      //   ? (await this.getMyStudents(classId)).filter(student => studentIds.indexOf(student.id) !== -1)
      //   : await this.getMyStudents(classId);
      let studentResults = {}
      // for (const student of students) {
      //   let studentId = student.id
        let forms = {}
        for (const form of curriculumFormsList) {
          let name = form.title
          forms[name] = {}
        }
        studentResults[studentId] = forms
      // }

      // let results = (await this.getResultsByClass(classId, curriculumId, curriculumFormsList))
      //   .filter(result => studentIds.indexOf(result.studentId) !== -1)
      let responses = await this.classFormService.getResponsesByStudentId(studentId);
      const data = await this.dashboardService.transformResultSet(responses, curriculumFormsList, null);
      // clean the array
      let results:Array<StudentResult> = this.dashboardService.clean(data, undefined);
      let student = this.students.find(x => x.id === studentId)

      for (const result of results) {
        // TODO filter by curriculum
        let formTitle = result.formTitle
        let studentId = result.studentId
        let category = result.category
        let isCategory = this.categories.find(function(item) {
          return item === category;
        });
        if (!isCategory && typeof category !=='undefined' && category !== "") {
          // console.log("!isCategory: " + category)
          this.categories.push(category)
          this.totals[category] = 0
        }
        if (category === "") {
          category = "Unassigned Category"
        }
        let rawScore = parseInt(result.score).toString()
        // let percentage = rawScore
        let percentage, totalCorrect;
        let percentCorrect = result.scorePercentageCorrect
        if (percentCorrect) {
          percentage = percentCorrect + "%"
          subtestReport.usingPercentages = true;
        } else {
          // percentage = result.totalCorrect
          totalCorrect = result.totalCorrect
        }
        let resultObject = {}
        for (const thisCategory of this.categories) {
          resultObject[thisCategory] = null
        }
        let scores = {
          rawScore:result.score,
          totalGridAnswers:result.maxValueAnswer,
          percentage: percentage,
          totalCorrect: totalCorrect
        }
        resultObject[category] = scores
        let currentTotal = this.totals[category]
        this.totals[category] = currentTotal + parseInt(result.score)
        let forms = studentResults[studentId]
        if (typeof forms !== 'undefined') {
          forms[formTitle] = resultObject
        }
      }
      this.studentCategorizedResults = []
      // for (const student of students) {
      //   let studentId = student.id
        let result = {}
        result["name"] = student.student_name
        result["results"] = studentResults[studentId]
        this.studentCategorizedResults.push(result)
      // }

      subtestReport.studentCategorizedResults = this.studentCategorizedResults;

      this.subtestReports.push(subtestReport)
    }

  }

  generateArray(obj){
    let result =  Object.keys(obj).map((key)=>{ return {key:key, value:obj[key]}});
    // console.log("result: " + JSON.stringify(result))
    return result
  }

  isEmpty(obj) {
    let stringy = JSON.stringify(obj)
    if (Object.keys(obj).length === 0) {
      return true
    } else {
      return false
    }
  }

  async getMyStudents(classId: any) {
    const observations = [];
    try {
      // find which class is selected
      let studentResults = await this.dashboardService.getMyStudents(classId);
      for (const result of studentResults) {
        let student = {};
        result.doc['items'][0].inputs.forEach(item => {
          // inputs = [...inputs, ...item.value]
          if (item.value !== "") {
            student[item.name] = item.value;
            // if (item.name === curriculumFormsList[i]['id'] + "_score") {
            //   score = item.value
            // }
          }
        })
        student["id"] = result.doc['_id']
        observations.push(student)
      }
    } catch (error) {
      console.error(error);
    }
    return observations
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
