import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ClassFormService} from "../../_services/class-form.service";
import {ClassUtils} from "../../class-utils";
import {ActivatedRoute, Router} from "@angular/router";
import {DashboardService} from "../../_services/dashboard.service";
import {AuthenticationService} from "../../../core/auth/_services/authentication.service";
import {StudentResult} from "../student-grouping-report/student-result";
import {ClassGroupingReport} from "../student-grouping-report/class-grouping-report";
import {MatTableDataSource} from "@angular/material";
import {_TRANSLATE} from "../../../shared/translation-marker";

@Component({
  selector: 'app-task-report',
  templateUrl: './task-report.component.html',
  styleUrls: ['./task-report.component.css']
})
export class TaskReportComponent implements OnInit {

  classFormService:ClassFormService;
  classUtils: ClassUtils
  curriculumFormsList;  // list of all curriculum forms
  curriculi:any;
  classId:string;
  totals:Array<TaskTotal> = [];
  dataSourceTotals;
  dataSourceReportCard;
  columnsToDisplay: string[] = ['itemName', 'average', 'studentsAssessed'];
  columnsToDisplayGrouping: string[] = ['name', 'results', 'status'];
  studentReportsCards;
  groupings:Array<GroupingTable>;
  status:string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')]
  curriculumName: null;


  @ViewChild('curriculumSelectDiv') curriculumSelectDiv: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
  ) { }

  async ngOnInit() {
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classFormService = new ClassFormService({databaseName: currentUser});
      this.classFormService = classFormService
    }
    this.classUtils = new ClassUtils();

    this.classId = this.route.snapshot.paramMap.get('classId');

    this.curriculi = []
    let classDoc = await this.classFormService.getResponse(this.classId);
    let classRegistration = this.classUtils.getInputValues(classDoc);
    let allCurriculums = classRegistration.curriculum;
    for (const curriculum of allCurriculums as any[] ) {
      if (curriculum['value'] === 'on') {
        this.curriculi.push(curriculum)
      }
    }
  }

  async onCurriculumSelect(event) {
    if (event.value && event.value !== 'none') {
      console.log("boom!: " + event.value)
      let totals = [];
      let studentReportsCards:StudentReportsCards = {}
      let curriculumId = event.value;
      let curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId)
      this.curriculumName = curriculum.label
      try {
        let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
        this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
        let itemReport = await Promise.all(this.curriculumFormsList.map(async item => {
          let results = await this.dashboardService.getResultsByClass(this.classId, curriculumId, this.curriculumFormsList, item);
          if (results.length > 0) {
            return await this.dashboardService.getClassGroupReport(item, this.classId, curriculumId, results)
          }
        })
        );
        Object.keys(itemReport).forEach(function (item) {
          if (typeof itemReport[item] !== 'undefined') {
            let report:ClassGroupingReport = itemReport[item];
            let allStudentResults:Array<StudentResult> = report.allStudentResults;
            let reduceClassAverage =  ( p, studentResult) => {
              return (typeof studentResult.scorePercentageCorrect !== 'undefined'? p + studentResult.scorePercentageCorrect:p)
            };
            let calcAverage = array => array.reduce(reduceClassAverage, 0 ) / array.length;
            let average = Math.round(calcAverage(allStudentResults));

            // now add array of studentResults to each student's record.
            let collectStudentResults =  (studentResult:StudentResult) => {
              let reportCard = studentReportsCards[studentResult.id]
              if (typeof reportCard === 'undefined' ) {
                reportCard = new StudentResult();
                reportCard.results = new Array<StudentResult>()
                reportCard.name = studentResult.name
                reportCard.id = studentResult.id
              }
              reportCard.results.push(studentResult)
              studentReportsCards[studentResult.id] = reportCard
              // let average = typeof studentResult.scorePercentageCorrect !== 'undefined'? studentAverage.scorePercentageCorrect + studentResult.scorePercentageCorrect:studentAverage.scorePercentageCorrect

              // add studentAverage to studentAverages object.
            }
            allStudentResults.forEach(collectStudentResults)

            totals.push({itemId: report.itemId, itemName: report.subtestName, average: average, classSize: report.classSize, studentsAssessed: report.studentsAssessed})
          }
        },  this);

        let groupings:Array<GroupingTable> = [];
        let colorClass  = ["concerning", "poor", "mediocre", "good", "great"]
        let status      = ["Concerning", "Poor", "Mediocre", "Good", "Great"]
        Object.values(studentReportsCards).forEach((reportCard:StudentResult) => {
          console.log("hey")
          let reduceClassAverage =  ( p, studentResult) => {
            return (typeof studentResult.scorePercentageCorrect !== 'undefined'? p + studentResult.scorePercentageCorrect:p)
          };
          let calcAverage = array => array.reduce(reduceClassAverage, 0 ) / array.length;
          let average = Math.round(calcAverage(reportCard.results));
          reportCard.scorePercentageCorrect = average;
          let percentile = this.dashboardService.calculatePercentile(average);

          let groupingTable = new GroupingTable();
          groupingTable.name = reportCard.name;
          groupingTable.result = reportCard;
          groupingTable.percentile = percentile;
          groupingTable.status = status[percentile]
          groupingTable.colorClass = colorClass[percentile]

          groupings.push(groupingTable)
        });
        this.totals = totals;
        this.studentReportsCards = studentReportsCards;
        this.groupings = groupings.sort(compare);
        this.dataSourceTotals = new MatTableDataSource<TaskTotal>(this.totals);
        this.dataSourceReportCard = new MatTableDataSource<GroupingTable>(this.groupings);
      } catch (error) {
        console.error(error);
      }
    }

    function compare(a,b) {
      if (typeof a.result.scorePercentageCorrect === 'undefined' && b.result.scorePercentageCorrect) {
        return 1;
      }
      if (a.result.scorePercentageCorrect && typeof b.result.scorePercentageCorrect === 'undefined') {
        return -1;
      }
      if (a.result.scorePercentageCorrect < b.result.scorePercentageCorrect)
        return 1;
      if (a.result.scorePercentageCorrect > b.result.scorePercentageCorrect)
        return -1;
      return 0;
    }
  }
}

export class TaskTotal {
  itemId: string;
  itemName: string;
  average: number;
  classSize: number;
  studentsAssessed: number;
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
