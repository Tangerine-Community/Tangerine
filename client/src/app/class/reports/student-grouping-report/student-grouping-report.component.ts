import { UserService } from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {DashboardService} from '../../_services/dashboard.service';
import {_TRANSLATE} from '../../../shared/translation-marker';
import { MatTableDataSource } from '@angular/material/table';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {ClassUtils} from '../../class-utils';
import {ClassGroupingReport} from './class-grouping-report';
import {StudentResult} from './student-result';
import {Feedback} from '../../feedback';

@Component({
  selector: 'app-student-grouping-report',
  templateUrl: './student-grouping-report.component.html',
  styleUrls: ['./student-grouping-report.component.css']
})
export class StudentGroupingReportComponent implements OnInit {

  students; dataSource;
  // allStudentResults:StudentResult[] = [];
  allStudentResults = [];
  // studentsResponses:any[];
  columnsToDisplay: string[] = ['name', 'calculatedScore', 'score', 'status'];
  classUtils: ClassUtils;
  formList: any[] = []; // used for the user interface - creates Class grouping list
  status: string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')];
  navigationSubscription;
  feedbackViewInited = false;
  curriculumFormsList;  // list of all curriculum forms
  classGroupReport: ClassGroupingReport;
  checkFeedbackMessagePosition = false;
  clickPosition;
  ready = false

  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('feedback') feedbackElement: ElementRef;
  @ViewChild('feedbackMessage') feedbackMessage: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private userService: UserService,
    private router: Router,
    private renderer: Renderer2,
  )  {
    // subscribe to the router events - storing the subscription so
    // we can unsubscribe later.
    this.navigationSubscription = this.router.events.subscribe(async (e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        await this.ngOnInit();
      }
    });
  }

  async ngOnInit() {
    this.classUtils = new ClassUtils();
    const itemId = this.route.snapshot.paramMap.get('type');
    const classId = this.route.snapshot.paramMap.get('classId');
    const curriculumId = this.route.snapshot.paramMap.get('curriculumId');

    // Get data about this particular subtest
    const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);

    this.formList = [];
    for (const form of this.curriculumFormsList) {
      const formEl = {
        'title': form.title,
        'id': form.id,
        'classId': classId,
        'curriculumId': curriculumId
      };
      this.formList.push(formEl);
    }

    const subtest = this.curriculumFormsList.filter(obj => {
      return obj.id === itemId;
    });
    const item = subtest[0];
    const results = await this.getResultsByClass(classId, curriculumId, this.curriculumFormsList, item);
    this.classGroupReport = await this.dashboardService.getClassGroupReport(item, classId, curriculumId, results);
    // console.log("this.classGroupReport item: " + item + " classId: " + classId + " curriculumId: " + curriculumId + "results: "  + JSON.stringify(results))
    // console.log("this.classGroupReport feedback: " + JSON.stringify(this.classGroupReport.feedback))
    this.dataSource = new MatTableDataSource<StudentResult>(this.classGroupReport.allStudentResults);
    this.ready = true
  }

  ngAfterViewChecked() {
    // if (!this.feedbackViewInited) {
      this.initFeedbackStyles();
      // this.feedbackViewInited = true
    // }
    if (this.checkFeedbackMessagePosition) {
      const feedbackMessageHeight = this.feedbackMessage.nativeElement.clientHeight;
      const parentPositionTop = this.getPosition(this.feedbackElement.nativeElement);
      // console.log("feedbackMessageHeight: " + feedbackMessageHeight + " parentPositionTop y: " + parentPositionTop.y)
      let finalPosition =  (this.clickPosition.y - parentPositionTop.y) - feedbackMessageHeight;
      if (finalPosition < 0) {
        finalPosition = 0;
      }
      // console.log("yPositionEvent: " + yPositionEvent + " parentPosition: " + parentPositionTop.y + " clickPosition.y: " + clickPosition.y + " yPosition: " + yPosition + " finalPosition: " + finalPosition)
      this.renderer.setStyle(this.feedbackMessage.nativeElement, 'position',  'relative');
      this.renderer.setStyle(this.feedbackMessage.nativeElement, 'top',  finalPosition + 'px');
      this.initFeedbackStyles();
      this.checkFeedbackMessagePosition = false;
    }
  }

  private initFeedbackStyles() {
    let el: HTMLElement = document.querySelector('.feedback-example');
    if (el) {
      el.style.backgroundColor = 'lightgoldenrodyellow';
      el.style.margin = '1em';
      el.style.padding = '1em';
      // this.feedbackViewInited = true
    }
    el = document.querySelector('.feedback-assignment');
    if (el) {
      el.style.backgroundColor = 'lightgoldenrodyellow';
      el.style.margin = '1em';
      el.style.padding = '1em';
      // this.feedbackViewInited = true
    }
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  async getMyStudents(classId: any) {
    try {
      // find which class is selected
      return await this.dashboardService.getMyStudents(classId);
    } catch (error) {
      console.error(error);
    }
  }

  async getResultsByClass(selectedClass: any, curriculum, curriculumFormsList, item) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, curriculumFormsList, item);
    } catch (error) {
      console.error(error);
    }
  }

  async getFeedbackForPercentile(event, percentile, curriculumId, itemId) {
    // console.log("Get feedback for " + JSON.stringify(element))
    const feedback: Feedback = await this.dashboardService.getFeedback(percentile, curriculumId, itemId);
    if (feedback) {
      feedback.percentileRange = this.dashboardService.calculatePercentileRange(percentile);
      this.classGroupReport.feedback = feedback;
    }
    this.clickPosition = this.getPosition(event.target);
    this.checkFeedbackMessagePosition = true;
  }

  // Helper function to get an element's exact position
  getPosition(el) {
    let xPos = 0;
    let yPos = 0;

    while (el) {
      if (el.tagName == 'BODY') {
        // deal with browser quirks with body/window/document and page scroll
        const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        const yScroll = el.scrollTop || document.documentElement.scrollTop;

        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }

      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }

}
