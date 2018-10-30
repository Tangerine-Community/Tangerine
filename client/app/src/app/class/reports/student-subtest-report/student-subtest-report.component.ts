import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ClassFormService} from "../../_services/class-form.service";
import {DashboardService} from "../../_services/dashboard.service";
import {AuthenticationService} from "../../../core/auth/_services/authentication.service";
import {ClassUtils} from "../../class-utils";
import {AppConfigService} from "../../../shared/_services/app-config.service";

export class SubtestReport {
  curriculumId:any
  label:any
  categories: any;
  totals:any;
  studentCategorizedResults:any
}

export interface StudentResult {
  id: string;
  name: string;
  results:any;
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
  totals:any;
  curriculums:any;
  subtestReports:any;

  @ViewChild('container') container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit() {
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classFormService = new ClassFormService({databaseName: currentUser});
      this.classFormService = classFormService
      this.classUtils = new ClassUtils();
    }
    await this.getReport()
  }

  async getReport() {
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
      let label = curriculum.label;
      let subtestReport = new SubtestReport()
      subtestReport.curriculumId = curriculumId;
      subtestReport.label = label;

      let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
      const container = this.container.nativeElement
      let curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml, container);
      // this.subtestReport.students = await this.getMyStudents(classId);
      const appConfig = await this.appConfigService.getAppConfig();
      this.categories = appConfig.categories;
      this.categories.push("Unassigned Category")

      subtestReport.categories = this.categories;

      this.totals = {}
      for (const thisCategory of this.categories) {
        this.totals[thisCategory] = 0
      }

      subtestReport.totals = this.totals;

      let students = await this.getMyStudents(classId);
      let studentResults = {}
      for (const student of students) {
        let studentId = student.id
        let forms = {}
        for (const form of curriculumFormsList) {
          let name = form.title
          forms[name] = {}
        }
        studentResults[studentId] = forms
      }

      let results = await this.getResultsByClass(classId, curriculumId, curriculumFormsList);
      for (const result of results) {
        let formTitle = result.formTitle
        let studentId = result.studentId
        let category = result.category
        if (category === "") {
          category = "Unassigned Category"
        }
        let score = parseInt(result.score)
        let resultObject = {}
        for (const thisCategory of this.categories) {
          resultObject[thisCategory] = null
        }
        resultObject[category] = score
        let currentTotal = this.totals[category]
        this.totals[category] = currentTotal + score
        let forms = studentResults[studentId]
        if (typeof forms !== 'undefined') {
          forms[formTitle] = resultObject
        }
      }
      this.studentCategorizedResults = []
      for (const student of students) {
        let studentId = student.id
        let result = {}
        result["name"] = student.student_name
        result["results"] = studentResults[studentId]
        this.studentCategorizedResults.push(result)
      }

      subtestReport.studentCategorizedResults = this.studentCategorizedResults;

      this.subtestReports.push(subtestReport)
    }

  }

  generateArray(obj){
    return Object.keys(obj).map((key)=>{ return {key:key, value:obj[key]}});
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
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, curriculumFormsList);
    } catch (error) {
      console.error(error);
    }
  }

}
