import { UserService } from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ClassFormService} from '../../_services/class-form.service';
import {ClassUtils} from '../../class-utils';
import {ActivatedRoute, Router} from '@angular/router';
import {DashboardService} from '../../_services/dashboard.service';
import {StudentResult} from '../student-grouping-report/student-result';
import {ClassGroupingReport} from '../student-grouping-report/class-grouping-report';
import { MatTableDataSource } from '@angular/material/table';
import {_TRANSLATE} from '../../../shared/translation-marker';
import {TangyFormService} from '../../../tangy-forms/tangy-form.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';

@Component({
  selector: 'app-task-report',
  templateUrl: './task-report.component.html',
  styleUrls: ['./task-report.component.css']
})
export class TaskReportComponent implements OnInit {

  classUtils: ClassUtils;
  curriculumFormsList;  // list of all curriculum forms
  curriculi: any;
  classId: string;
  totals: Array<TaskTotal> = [];
  dataSourceTotals;
  dataSourceReportCard;
  columnsToDisplay: string[] = ['itemName', 'average', 'studentsAssessed'];
  columnsToDisplayGrouping: string[] = ['name', 'results', 'status'];
  studentReportsCards;
  groupings: Array<GroupingTable>;
  status: string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')];
  curriculumName: null;


  @ViewChild('curriculumSelectDiv', {static: true}) curriculumSelectDiv: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private userService: UserService,
    private classFormService: ClassFormService,
    private tangyFormService: TangyFormService,
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  async ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
    }
    this.classUtils = new ClassUtils();

    this.classId = this.route.snapshot.paramMap.get('classId');

    this.curriculi = [];
    const classDoc = await this.classFormService.getResponse(this.classId);
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
  }

  async onCurriculumSelect(event) {
    if (event.value && event.value !== 'none') {
      console.log('boom!: ' + event.value);
      const totals = [];
      const studentReportsCards: StudentReportsCards = {};
      const curriculumId = event.value;
      const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
      this.curriculumName = curriculum.label;
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
            const reduceClassAverage =  ( p, studentResult) => {
              return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
            };
            const calcAverage = array => array.reduce(reduceClassAverage, 0 ) / array.length;
            const average = Math.round(calcAverage(allStudentResults));

            // now add array of studentResults to each student's record.
            const collectStudentResults =  (studentResult: StudentResult) => {
              let reportCard = studentReportsCards[studentResult.id];
              if (typeof reportCard === 'undefined' ) {
                reportCard = new StudentResult();
                reportCard.results = new Array<StudentResult>();
                reportCard.name = studentResult.name;
                reportCard.id = studentResult.id;
              }
              reportCard.results.push(studentResult);
              studentReportsCards[studentResult.id] = reportCard;
              // let average = typeof studentResult.scorePercentageCorrect !== 'undefined'? studentAverage.scorePercentageCorrect + studentResult.scorePercentageCorrect:studentAverage.scorePercentageCorrect

              // add studentAverage to studentAverages object.
            };
            allStudentResults.forEach(collectStudentResults);

            totals.push({itemId: report.itemId, itemName: report.subtestName, average: average, classSize: report.classSize, studentsAssessed: report.studentsAssessed});
          }
        },  this);

        const groupings: Array<GroupingTable> = [];
        const colorClass  = ['concerning', 'poor', 'mediocre', 'good', 'great'];
        const status      = ['Concerning', 'Poor', 'Mediocre', 'Good', 'Great'];
        Object.values(studentReportsCards).forEach((reportCard: StudentResult) => {
          console.log('hey');
          const reduceClassAverage =  ( p, studentResult) => {
            return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
          };
          const calcAverage = array => array.reduce(reduceClassAverage, 0 ) / array.length;
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
        this.totals = totals;
        this.studentReportsCards = studentReportsCards;
        this.groupings = groupings.sort(compare);
        this.dataSourceTotals = new MatTableDataSource<TaskTotal>(this.totals);
        this.dataSourceReportCard = new MatTableDataSource<GroupingTable>(this.groupings);
      } catch (error) {
        console.error(error);
      }
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
