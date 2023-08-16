import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {UserDatabase} from "../../../shared/_classes/user-database.class";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../shared/_services/user.service";
import {ActivatedRoute} from "@angular/router";
import {ClassGroupingReport} from "../student-grouping-report/class-grouping-report";
import {StudentResult} from "../student-grouping-report/student-result";
import {MatTableDataSource} from "@angular/material/table";
import {GroupingTable, StudentReportsCards, TaskTotal} from "../task-report/task-report.component";
import {ClassUtils} from "../../class-utils";
import {ClassFormService} from "../../_services/class-form.service";
import {TangyFormsInfoService} from "../../../tangy-forms/tangy-forms-info-service";
import {DashboardService} from "../../_services/dashboard.service";

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
    private classFormService: ClassFormService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private dashboardService: DashboardService,
  ) { }
  
  classUtils: ClassUtils;
  db: UserDatabase
  attendanceReports: any[]
  attendanceReport: any
  recentVisitsReport: any
  // @ViewChild('numVisits', {static: true}) searchResults: ElementRef
  // @Input()  numVisits!: number | string
  numVisits = '3'
  classId: string;
  curriculi: any;
  curriculumName: string;
  curriculumFormsList;  // list of all curriculum forms
  groupings: Array<GroupingTable>;
  groupingsByCurriculum: any = {}
  allStudentScores: any = {}
  
  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.classId = classId
    this.classUtils = new ClassUtils();
    
    
    this.curriculi = [];
    const classDoc = await this.classFormService.getResponse(classId);
    const classRegistration = this.classUtils.getInputValues(classDoc);
    const allCurriculums = classRegistration.curriculum;
    for (const curriculum of allCurriculums as any[] ) {
      if (curriculum['value'] === 'on') {
        const formId = curriculum.name;
        const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
        curriculum.label = formInfo.title;
        this.curriculi.push(curriculum);
      }
    }

    for (let i = 0; i < this.curriculi.length; i++) {
      const curriculum = this.curriculi[i];
      await this.onCurriculumSelect(curriculum.name)
    }
    
    this.attendanceReports = await this.getAttendanceDocs(classId)
    const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]?.doc
    this.attendanceReports.forEach(this.processAttendanceReport(currentAttendanceReport))
    this.attendanceReport = currentAttendanceReport
    await this.getRecentVisitsReport()
  }

  private processAttendanceReport(currentAttendanceReport) {
    return (attendanceReport) => {
      const attendanceList = attendanceReport.doc.attendanceList
      for (let i = 0; i < attendanceList.length; i++) {
        const student = attendanceList[i]
        const currentStudent = currentAttendanceReport.attendanceList.find((thisStudent) => {
          return thisStudent.id === student.id
        })
        currentStudent.reportCount = currentStudent.reportCount ? currentStudent.reportCount + 1 : 1
        currentStudent.presentCount = currentStudent.presentCount ? currentStudent.presentCount : 0
        const absent = student.absent ? student.absent : false
        if (!absent) {
          currentStudent.presentCount = currentStudent.presentCount + 1
        }
        currentStudent.presentPercentage = Math.round((currentStudent.presentCount / currentStudent.reportCount) * 100)

        currentStudent.moodValues = currentStudent.moodValues ? currentStudent.moodValues : []
        const mood = student.mood
        if (mood) {
          switch (mood) {
            case 'happy':
              currentStudent.moodValues.push(100)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'neutral':
              currentStudent.moodValues.push(66.6)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'sad':
              currentStudent.moodValues.push(33.3)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
          }
        }
        const studentScores = {}
        const curriculi = Object.keys(this.allStudentScores);
        curriculi.forEach((curriculum) => {
          const scores = this.allStudentScores[curriculum]
          const studentScore = scores.find((score) => {
            return score.id === student.id
          })
          studentScores[curriculum] = studentScore
        })
        currentStudent.studentScores = studentScores
      }
    };
  }

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }
  async getAttendanceDocs(selectedClass: any) {
    this.db = await this.getUserDB();
    const result = await this.db.query('tangy-class/responsesForAttendanceByClassId', {
      startkey: [selectedClass],
      endkey: [selectedClass, {}],
      include_docs: true
    });
    return result.rows;
  }

  async getRecentVisitsReport() {
    const recentVisitsReport = {}
    recentVisitsReport['count'] = 3
    // const classId = this.route.snapshot.paramMap.get('classId')
    // const result = await this.db.query('tangy-class/recentVisitsByClassId', {
    //   startkey: [classId],
    //   endkey: [classId, {}],
    //   include_docs: true
    // });
    // return result.rows;
    const recentVisitReports = this.attendanceReports.slice(0 - parseInt(this.numVisits, 10))
    // const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]
    // recentVisitReports.forEach(this.processAttendanceReport())

    // do a deep clone
    const recentVisitDoc = recentVisitReports[recentVisitReports.length - 1]?.doc
    const currentAttendanceReport = JSON.parse(JSON.stringify(recentVisitDoc))
    recentVisitReports.forEach(this.processAttendanceReport(currentAttendanceReport))
    this.recentVisitsReport = currentAttendanceReport
  }

  async onNumberVisitsChange(event: any) {
    console.log('onNumberVisitsChange', event)
    console.log('numVisits: ', this.numVisits)
    if (this.numVisits) {
      await this.getRecentVisitsReport()
    }
  }

  /**
   * Grafted from task-report.component.ts
   * @param curriculumId
   */
  async onCurriculumSelect(curriculumId) {
    console.log('boom!: ' + curriculumId);
    const totals = [];
    const studentReportsCards: StudentReportsCards = {};
    const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    // this.curriculumName = curriculum.label;
    // // this.curriculumName = "Student Evaluation";
    try {
      const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
      this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
      const itemReport = await Promise.all(this.curriculumFormsList.map(async item => {
          const results = await this.dashboardService.getResultsByClass(this.classId, curriculumId, this.curriculumFormsList, item);
          if (results.length > 0) {
            return await this.dashboardService.getClassGroupReport(item, this.classId, curriculumId, results);
          }
        })
      );
      Object.keys(itemReport).forEach(function (item) {
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
            // let average = typeof studentResult.scorePercentageCorrect !== 'undefined'? studentAverage.scorePercentageCorrect + studentResult.scorePercentageCorrect:studentAverage.scorePercentageCorrect

            // add studentAverage to studentAverages object.
          };
          allStudentResults.forEach(collectStudentResults);

          totals.push({
            itemId: report.itemId,
            itemName: report.subtestName,
            average: average,
            classSize: report.classSize,
            studentsAssessed: report.studentsAssessed
          });
        }
      }, this);

      const groupings: Array<GroupingTable> = [];
      const colorClass = ['concerning', 'poor', 'mediocre', 'good', 'great'];
      const status = ['Concerning', 'Poor', 'Mediocre', 'Good', 'Great'];
      Object.values(studentReportsCards).forEach((reportCard: StudentResult) => {
        console.log('hey');
        const reduceClassAverage = (p, studentResult) => {
          return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
        };
        const calcAverage = array => array.reduce(reduceClassAverage, 0) / array.length;
        const average = Math.round(calcAverage(reportCard.results));
        reportCard.scorePercentageCorrect = average;
        const percentile = this.dashboardService.calculatePercentile(average);

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
      this.groupings = groupings.sort(compare);
      // this.dataSourceTotals = new MatTableDataSource<TaskTotal>(this.totals);
      // this.dataSourceReportCard = new MatTableDataSource<GroupingTable>(this.groupings);
      this.groupingsByCurriculum[curriculumId] = this.groupings
      this.allStudentScores[curriculumId] = this.groupings.map((grouping) => {
        return {
          id: grouping.result.id,
          curriculum: grouping.result.curriculum,
          score: grouping.result.scorePercentageCorrect
        }
      })
      console.log("done")
    } catch (error) {
      console.error(error);
    }

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
  }

}
