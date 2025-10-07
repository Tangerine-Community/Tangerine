import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DateTime} from "luxon";
import {StudentResult} from "../../dashboard/dashboard.component";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import { TangySnackbarService } from 'src/app/shared/_services/tangy-snackbar.service';
@Component({
  selector: 'app-attendance-scores',
  templateUrl: './attendance-scores.component.html',
  styleUrls: ['../../dashboard/dashboard.component.css', './attendance-scores.component.css']
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
  currArray: any;
  formId:string
  ignoreCurriculumsForTracking: boolean = false
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
    private appConfigService: AppConfigService,
    private tangySnackbarService: TangySnackbarService
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
    this.units = appConfig.teachProperties?.units

    const currentClass = this.dashboardService.getSelectedClass(enabledClasses, classIndex)
    this.selectedClass = currentClass;

    this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)

    const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    this.formId = await this.variableService.get('class-formId');
    this.curriculum = currArray.find(x => x.name === this.formId);
    this.currArray = currArray;

    const currentClassId = this.selectedClass._id
    await this.showScoreListing(currentClass, currentClassId)
  }

  
  async showScoreListing(currentClass, currentClassId) {
    const type = "scores"
    const students = await this.dashboardService.getMyStudents(currentClassId)
    const schoolName = this.getValue('school_name', currentClass)
    const schoolYear = this.getValue('school_year', currentClass)
    const randomId = currentClass.metadata?.randomId
    const timestamp = Date.now()
    const curriculumLabel = this.curriculum.labelSafe
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, curriculumLabel, type, randomId);
    let doc, listFromDoc
    try {
      const docArray = await this.dashboardService.searchDocs(type, currentClass, null, null, curriculumLabel, randomId, true)
      doc = docArray? docArray[0]?.doc : null
      listFromDoc = doc?.scoreList
    } catch (e) {
    }

    this.scoreList =  await this.dashboardService.getScoreList(students, listFromDoc)
    if (!doc) {
      this.scoreRegister = {
        _id: id,
        timestamp: timestamp,
        classId: currentClassId,
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

      
      await this.saveStudentScore()
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
    await this.saveStudentScore()
  }

  private async saveStudentScore() {
    this.scoreRegister.scoreList = this.scoreList

    let doc
    try {
      doc = await this.dashboardService.getDoc(this.scoreRegister._id)
      this.scoreRegister['_rev'] = doc._rev
    } catch (e) {
    }

    const result = await this.dashboardService.saveDoc(this.scoreRegister)
    if (result.ok) {
      this.saveSuccess = true
      this.tangySnackbarService.showText(_TRANSLATE('Saved'))
      setTimeout(() => {
        this.saveSuccess = false
      }, 2000);
    } else {
      this.tangySnackbarService.showText(_TRANSLATE('Error saving. Please try again.'));
    }
  }

  async saveStudentScores() {
    this.scoreRegister.scoreList = this.scoreList
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
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { formId: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
    });
  }

  getClassTitle = this.dashboardService.getClassTitle

  async changeCurriculum(formId) {
    this.formId = formId
    await this.variableService.set('class-formId', formId);
    this.curriculum = this.currArray.find(x => x.name === this.formId);
    await this.showScoreListing(this.selectedClass, this.selectedClass._id)
  }
}
