import {Component, OnInit} from '@angular/core';
import {UserDatabase} from "../../../shared/_classes/user-database.class";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../shared/_services/user.service";
import {ActivatedRoute} from "@angular/router";
import {ClassUtils} from "../../class-utils";
import {ClassFormService} from "../../_services/class-form.service";
import {TangyFormsInfoService} from "../../../tangy-forms/tangy-forms-info-service";
import {DashboardService} from "../../_services/dashboard.service";
import {AppConfigService} from "../../../shared/_services/app-config.service";

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
    private appConfigService: AppConfigService
  ) {
  }

  classUtils: ClassUtils;
  db: UserDatabase
  attendanceReports: any[]
  scoreReports: any[]
  attendanceReport: any
  scoreReport: any
  recentVisitsReport: any
  // @ViewChild('numVisits', {static: true}) searchResults: ElementRef
  // @Input()  numVisits!: number | string
  numVisits = '5'
  classId: string;
  curriculi: any;
  curriculumName: string;
  curriculumFormsList;  // list of all curriculum forms
  // groupingsByCurriculum: any = {}
  allStudentScores: any = {}
  units: string[] = []

  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.classId = classId
    this.classUtils = new ClassUtils();

    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
    
    this.curriculi = [];
    const currentClass = await this.classFormService.getResponse(classId);
    const classRegistration = this.classUtils.getInputValues(currentClass);
    const allCurriculums = classRegistration.curriculum;
    for (const curriculum of allCurriculums as any[]) {
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
    
    //TODO: placeholder until we find out if we need to run this report per curriculum.
    const curriculumLabel = null
    const randomId = currentClass.metadata?.randomId
    this.scoreReports = await this.dashboardService.searchDocs('scores', currentClass, null, curriculumLabel, randomId)
      this.scoreReport = this.scoreReports[this.scoreReports.length - 1]?.doc

    this.attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null, curriculumLabel, randomId)
      const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]?.doc

    const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, null, curriculumLabel, randomId)
      const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc
    
    for (let i = 0; i < this.attendanceReports.length; i++) {
      const attendanceReport = this.attendanceReports[i];
      const attendanceList = attendanceReport.doc.attendanceList
      await this.dashboardService.processAttendanceReport(attendanceList, currentAttendanceReport, this.scoreReport, this.allStudentScores, null, this.units, currentBehaviorReport)
    }
    
    this.attendanceReport = currentAttendanceReport
    const mostRecentAttendanceReport = this.attendanceReports.slice(0 - parseInt(this.numVisits, 10))
    this.recentVisitsReport = await this.dashboardService.getRecentVisitsReport(mostRecentAttendanceReport, this.scoreReport, this.allStudentScores, this.units)
  }

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }


  async onNumberVisitsChange(event: any) {
    console.log('onNumberVisitsChange', event)
    console.log('numVisits: ', this.numVisits)
    if (this.numVisits) {
      const mostRecentAttendanceReport = this.attendanceReports.slice(0 - parseInt(this.numVisits, 10))
      this.recentVisitsReport = await this.dashboardService.getRecentVisitsReport(mostRecentAttendanceReport, this.scoreReport, this.allStudentScores, this.units)
    }
  }

  

  /**
   * Grafted from task-report.component.ts
   * @param curriculumId
   */
  async onCurriculumSelect(curriculumId) {
    console.log('boom!: ' + curriculumId);
    // // const totals = [];
    // const studentReportsCards: StudentReportsCards = {};
    // const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    // // this.curriculumName = curriculum.label;
    // // // this.curriculumName = "Student Evaluation";
    // try {
    //   const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    //   this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    //   const itemReport = await Promise.all(this.curriculumFormsList.map(async item => {
    //       const results = await this.dashboardService.getResultsByClass(this.classId, curriculumId, this.curriculumFormsList, item);
    //       if (results.length > 0) {
    //         return await this.dashboardService.getClassGroupReport(item, this.classId, curriculumId, results);
    //       }
    //     })
    //   );
    //   Object.keys(itemReport).forEach((item) => {
    //     if (typeof itemReport[item] !== 'undefined') {
    //       const report: ClassGroupingReport = itemReport[item];
    //       const allStudentResults: Array<StudentResult> = report.allStudentResults;
    //       const reduceClassAverage = (p, studentResult) => {
    //         return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
    //       };
    //       const calcAverage = array => array.reduce(reduceClassAverage, 0) / array.length;
    //       const average = Math.round(calcAverage(allStudentResults));
    //
    //       // now add array of studentResults to each student's record.
    //       const collectStudentResults = (studentResult: StudentResult) => {
    //         let reportCard = studentReportsCards[studentResult.id];
    //         if (typeof reportCard === 'undefined') {
    //           reportCard = new StudentResult();
    //           reportCard.results = new Array<StudentResult>();
    //           reportCard.curriculum = curriculum;
    //           reportCard.name = studentResult.name;
    //           reportCard.id = studentResult.id;
    //         }
    //         reportCard.results.push(studentResult);
    //         studentReportsCards[studentResult.id] = reportCard;
    //         // let average = typeof studentResult.scorePercentageCorrect !== 'undefined'? studentAverage.scorePercentageCorrect + studentResult.scorePercentageCorrect:studentAverage.scorePercentageCorrect
    //
    //         // add studentAverage to studentAverages object.
    //       };
    //       allStudentResults.forEach(collectStudentResults);
    //
    //       // totals.push({
    //       //   itemId: report.itemId,
    //       //   itemName: report.subtestName,
    //       //   average: average,
    //       //   classSize: report.classSize,
    //       //   studentsAssessed: report.studentsAssessed
    //       // });
    //     }
    //   });

    const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    const studentReportsCards = await this.dashboardService.generateStudentReportsCards(curriculum, this.classId)

    const rankedStudentScores = this.dashboardService.rankStudentScores(studentReportsCards);
    // this.groupingsByCurriculum[curriculumId] = rankedStudentScores
    this.allStudentScores[curriculumId] = rankedStudentScores.map((grouping) => {
      return {
        id: grouping.result.id,
        curriculum: grouping.result.curriculum,
        score: grouping.result.scorePercentageCorrect
      }
    })
    console.log("done")
  }
}
