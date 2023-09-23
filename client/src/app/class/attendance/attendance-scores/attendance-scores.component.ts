import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DateTime} from "luxon";
import {StudentResult} from "../../dashboard/dashboard.component";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-attendance-scores',
  templateUrl: './attendance-scores.component.html',
  styleUrls: ['./attendance-scores.component.css','../../dashboard/dashboard.component.css']
})
export class AttendanceScoresComponent implements OnInit {

  getValue: (variableName: any, response: any) => any;
  window: any = window
  attendanceList: StudentResult[] = []
  scoreRegister: {
    _id: string,
    timestamp: number,
    classId: string,
    grade: string,
    schoolName: string
    schoolYear: string,
    scoreList: StudentResult[],
    collection: string,
    form: {},
    items: any[],
    complete: boolean,
    type: string,
    testName: string
  }
  scoreList: StudentResult[]
  testName: string = ""
  showScoreList: boolean = true
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    const enabledClasses = await this.dashboardService.getEnabledClasses();

    let classClassIndex = await this.variableService.get('class-classIndex')
    if (classClassIndex !== null) {
      classIndex = parseInt(classClassIndex)
      if (!Number.isNaN(classIndex)) {
        classIndex = 0
      }
    }

    const currentClass = enabledClasses[classIndex]?.doc;
    const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    const curriculumId = await this.variableService.get('class-curriculumId');
    const curriculum = currArray.find(x => x.name === curriculumId);

    const currentClassId = await this.variableService.get('class-currentClassId');
    await this.showScoreListing(currentClass, currentClassId)
  }


  /**
   * Shim attendance into the currArray so it'll appear in the dropdown.
   * Makes attendance the selectedCurriculum.
   * @param cassId
   */
  async showScoreListing(selectedClass, currentClassId) {
    const type = "scores"
    const registerNameForDialog = 'Scoring';
    const students = await this.dashboardService.getMyStudents(currentClassId)

    const timestamp = Date.now()
    const reportDate = DateTime.local().toISODate()
    const grade = this.dashboardService.getClassTitle(selectedClass)
    const schoolName = this.getValue('school_name', selectedClass)
    const schoolYear = this.getValue('school_year', selectedClass)
    const id = type + '-' + grade + '-' + reportDate
    let doc, listFromDoc
    try {
      doc = await this.dashboardService.getDoc(id)
      listFromDoc = doc.scoreList
      this.testName = doc.testName
    } catch (e) {
    }

    this.scoreList =  await this.dashboardService.getAttendanceList(students, listFromDoc)
    if (!doc) {
      this.scoreRegister = {
        _id: id,
        timestamp: timestamp,
        classId: selectedClass.id,
        grade: grade,
        schoolName: schoolName,
        schoolYear: schoolYear,
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
      const startRegister = confirm(_TRANSLATE('Begin ' + registerNameForDialog + ' record for today?'))
      if (startRegister) {
        // const curriculum = {
        //   'name': type,
        //   'value': 'on',
        //   'label': _TRANSLATE(registerNameForDialog)
        // }
        // this.currArray.push(curriculum)
        // this.selectedCurriculum = this.currArray.find(x => x.name === type)
        // this.showScoreList = true
        await this.saveStudentScore(null)
      } else {
        // this.showScoreList = false
        // if (!this.currentItemId || this.currentItemId === '') {
        //   const initialForm = this.curriculumFormsList[0]
        //   this.currentItemId = initialForm.id
        // }
        // await this.selectSubTask(this.currentItemId, this.currentClassId, this.curriculumId)
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
  
  async updateScore(student) {
    // student['score'] = score
    if (student['score'] < 0 || student['score'] > 100) {
      alert(_TRANSLATE('Score must be between 0 and 100'))
      student['score'] = 0
      return
    }
    await this.saveStudentScore(student)
  }

  private async saveStudentScore(student) {
    console.log('saved student score: ' + JSON.stringify(student))
    this.scoreRegister.scoreList = this.scoreList
    // update testName in case user updated it.
    this.scoreRegister.testName = this.testName
    // save scoreRegister
    let doc
    try {
      doc = await this.dashboardService.getDoc(this.scoreRegister._id)
      this.scoreRegister['_rev'] = doc._rev
    } catch (e) {
    }
    await this.dashboardService.saveDoc(this.scoreRegister)
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
