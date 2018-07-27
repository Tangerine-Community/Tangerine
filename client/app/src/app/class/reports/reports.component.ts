import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DashboardService} from "../_services/dashboard.service";
import {MatTableDataSource} from "@angular/material";
import {StudentResult} from "../dashboard/dashboard.component";
import {ClassFormService} from "../_services/class-form.service";
import {AuthenticationService} from "../../core/auth/_services/authentication.service";
import {ClassUtils} from "../class-utils.js";
import { _TRANSLATE } from '../../shared/translation-marker';

export interface ClassGroupingReport {
  id: string;
  subtestName: string;
  classSize:number;
  studentsAssessed:number;
  aveCorrectPerc:number;
  aveCorrect:number;
  studentsToWatch:string;
}

export interface StudentResult {
  id: string;
  name: string;
  forms:any;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  students;dataSource;
  // allStudentResults:StudentResult[] = [];
  allStudentResults = [];
  studentsResponses:any[];
  columnsToDisplay: string[] = ['name', 'status'];
  classGroupReport:ClassGroupingReport = {
    id:null,
    subtestName: null,
    classSize: null,
    studentsAssessed: null,
    aveCorrectPerc: null,
    aveCorrect: null,
    studentsToWatch: null
  }
  classFormService:ClassFormService;
  classUtils: ClassUtils
  status:string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')]

  @ViewChild('container') container: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    // private classUtils: ClassUtils
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
    const type = this.route.snapshot.paramMap.get('type');
    const classId = this.route.snapshot.paramMap.get('classId');
    console.log("type: " + type)
    let classDoc = await this.classFormService.getResponse(classId);
    let classRegistration = this.classUtils.getInputValues(classDoc);

    // Get data about this particular subtest
    let curriculumId = classRegistration.curriculum;
    let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    const container = this.container.nativeElement
    let curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml, container);
    let subtest = curriculumFormsList.filter(obj => {
      return obj.id === type
    })
    this.classGroupReport.subtestName = subtest[0].title

    this.students = await this.getMyStudents(classId);
    let results = await this.getResultsByClass(classId, curriculumFormsList);
    this.studentsResponses = [];
    for (const response of results as any[] ) {
      // console.log("response: " + JSON.stringify(response))
      // studentsResponses.push();
      let studentId = response.studentId
      let studentReponses = this.studentsResponses[studentId];
      if (typeof studentReponses === 'undefined') {
        studentReponses = {}
      }
      let formId = response.formId;
      studentReponses[formId] = response;
      this.studentsResponses[studentId] = studentReponses
    }
    let allStudentResults = [];
    let studentsAssessed = 0;
    let studentsToWatch:string[] = []

    for (const student of this.students) {
      let studentResults = {};
      studentResults["id"] = student.id
      studentResults["name"] = student.doc.items[0].inputs[0].value
      studentResults["classId"] = student.doc.items[0].inputs[3].value
      studentResults["forms"] = [];
      let aCorrect = 0;
      // studentResults["forms"] = {};
      for (const form of curriculumFormsList) {
        // let formResult = {};
        // formResult["formId"] = form.id
        // // formResult["curriculum"] = this.curriculum
        // formResult["title"] = form.title
        // formResult["src"] = form.src
        if (this.studentsResponses[student.id]) {
          if (form.id === type) {
            studentResults["response"] = this.studentsResponses[student.id][form.id]
            // let pc = studentResults["response"]["percentCorrect"]
            let score = studentResults["response"]["score"]
            console.log("name: "+ studentResults["name"] + " score: "+ score)
            studentResults["score"] = score
            // let index;
            // if (pc >= 80) {
            //   index = 3
            // } else if (pc >= 60 && pc <= 79) {
            //   index = 2
            // } else if (pc >= 30 && pc <= 59) {
            //   index = 1
            // } else {
            //   index = 0
            // }
            // studentResults["status"] = this.status[index]
            studentsAssessed ++
          }
        } else {
          if (form.id === type) {
            studentResults["status"] = this.status[0]
            studentsToWatch.push(studentResults["name"])
          }
        }
        // studentResults["forms"].push(formResult)
        // studentResults["forms"][form.id] = formResult
      }
      allStudentResults.push(studentResults)
    }
    this.classGroupReport.studentsAssessed = studentsAssessed
    this.classGroupReport.studentsToWatch = studentsToWatch.toString()
    this.allStudentResults = allStudentResults;
    this.dataSource = new MatTableDataSource<StudentResult>(this.allStudentResults);
  }

  async getMyStudents(classId: any) {
    try {
      // find which class is selected
      return await this.dashboardService.getMyStudents(classId);
    } catch (error) {
      console.error(error);
    }
  }

  async getResultsByClass(selectedClass: any, curriculumFormsList) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculumFormsList);
    } catch (error) {
      console.error(error);
    }
  }

}
