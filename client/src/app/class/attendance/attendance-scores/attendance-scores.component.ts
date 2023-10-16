import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DateTime} from "luxon";
import {StudentResult} from "../../dashboard/dashboard.component";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";
import {AppConfigService} from "../../../shared/_services/app-config.service";

@Component({
  selector: 'app-attendance-scores',
  templateUrl: './attendance-scores.component.html',
  styleUrls: ['./attendance-scores.component.css','../../dashboard/dashboard.component.css']
})
export class AttendanceScoresComponent implements OnInit {

  getValue: (variableName: any, response: any) => any;
  window: any = window
  scoreList: StudentResult[] = []
  scoreRegister: {
    _id: string,
    timestamp: number,
    classId: string,
    grade: string,
    schoolName: string
    schoolYear: string,
    reportDate:string,
    testName: string
    scoreList: StudentResult[],
    collection: string,
    type: string,
    form: {},
    items: any[],
    complete: boolean
  }
  testName: string = ""
  showScoreList: boolean = true
  units: string[] = []
  selectedClass: any
  curriculum: any
  saveSuccess: boolean;
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    const enabledClasses = await this.dashboardService.getEnabledClasses();

    let classClassIndex = await this.variableService.get('class-classIndex')
    if (classClassIndex !== null) {
      classIndex = parseInt(classClassIndex)
      if (Number.isNaN(classIndex)) {
        classIndex = 0
      }
    }

    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units

    const currentClass = enabledClasses[classIndex]?.doc;
    this.selectedClass = currentClass;
    const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    const curriculumId = await this.variableService.get('class-curriculumId');
    this.curriculum = currArray.find(x => x.name === curriculumId);

    const currentClassId = await this.variableService.get('class-currentClassId');
    await this.showScoreListing(currentClass, currentClassId)
  }


  /**
   * Shim attendance into the currArray so it'll appear in the dropdown.
   * Makes attendance the selectedCurriculum.
   * @param cassId
   */
  async showScoreListing(currentClass, currentClassId) {
    const type = "scores"
    const registerNameForDialog = 'Scoring';
    const students = await this.dashboardService.getMyStudents(currentClassId)
    const schoolName = this.getValue('school_name', currentClass)
    const schoolYear = this.getValue('school_year', currentClass)
    const timestamp = Date.now()
    const curriculumLabel = this.curriculum.label
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, curriculumLabel, type);
    let doc, listFromDoc
    try {
      // doc = await this.dashboardService.getDoc(id)
      // listFromDoc = doc.scoreList
      // this.testName = doc.testName
      const docArray = await this.dashboardService.searchDocs(type, currentClass, null, curriculumLabel)
      doc = docArray? docArray[0]?.doc : null
      listFromDoc = doc?.scoreList
    } catch (e) {
    }

    this.scoreList =  await this.dashboardService.getScoreList(students, listFromDoc)
    if (!doc) {
      this.scoreRegister = {
        _id: id,
        timestamp: timestamp,
        classId: currentClass.id,
        grade: grade,
        schoolName: schoolName,
        schoolYear: schoolYear,
        reportDate: reportDate,
        testName: this.testName,
        scoreList: this.scoreList,
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
      const startRegister = confirm(_TRANSLATE('Begin ' + registerNameForDialog + ' record?'))
      if (startRegister) {
        await this.saveStudentScore(null)
      } else {
        this.router.navigate(['/attendance-dashboard/'], { queryParams:
            { curriculum: 'student-registration' }
        });
      }
    } else {
      this.showScoreList = true
      doc.scoreList = this.scoreList
      this.scoreRegister = doc
    }
  }
  
  async updateScore(student, unitIndex: string) {
    if (student['score_'+unitIndex] < 0 || student['score_'+unitIndex] > 100) {
      alert(_TRANSLATE('Score must be between 0 and 100'))
      student['score_'+unitIndex] = 0
      return
    }
    await this.saveStudentScore(student)
  }

  private async saveStudentScore(student) {
    console.log('saved student score: ' + JSON.stringify(student))
    this.scoreRegister.scoreList = this.scoreList
    // update testName in case user updated it.
    // this.scoreRegister.testName = this.testName
    // save scoreRegister
    let doc
    try {
      doc = await this.dashboardService.getDoc(this.scoreRegister._id)
      this.scoreRegister['_rev'] = doc._rev
    } catch (e) {
    }
    const result = await this.dashboardService.saveDoc(this.scoreRegister)
    if (result.ok) {
      this.saveSuccess = true
      setTimeout(() => {
        this.saveSuccess = false
      }, 2000);
    }
  }

  async saveStudentScores() {
    console.log('saved student scores ')
    this.scoreRegister.scoreList = this.scoreList
    // update testName in case user updated it.
    // this.scoreRegister.testName = this.testName
    // save scoreRegister
    let doc
    try {
      doc = await this.dashboardService.getDoc(this.scoreRegister._id)
      this.scoreRegister['_rev'] = doc._rev
    } catch (e) {
    }
    const result = await this.dashboardService.saveDoc(this.scoreRegister)
    if (result.ok) {
      this.saveSuccess = true
      setTimeout(() => {
        this.saveSuccess = false
      }, 2000);
    }
  }

  /** Navigate to the student registration form */
  selectStudentName(column) {
    const formsArray = Object.values(column.forms);
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { curriculum: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
    });
  }
}
