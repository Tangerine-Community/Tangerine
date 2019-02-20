import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {DashboardService} from "../../_services/dashboard.service";
import {AuthenticationService} from "../../../core/auth/_services/authentication.service";
import {_TRANSLATE} from "../../../shared/translation-marker";
import {MatTableDataSource} from "@angular/material";
import {ClassFormService} from "../../_services/class-form.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ClassUtils} from "../../class-utils";
import {ClassGroupingReport} from "./class-grouping-report";
import {StudentResult} from "./student-result";
import {Feedback} from "../../feedback";

export interface StudentResult {
  id: string;
  name: string;
  classId:string;
  forms:[];
  response:any;
  score:any;
  max:any;
  totalGridPercentageCorrect:number;
  percentile: string;
  maxValueAnswer: number;
}
@Component({
  selector: 'app-student-grouping-report',
  templateUrl: './student-grouping-report.component.html',
  styleUrls: ['./student-grouping-report.component.css']
})
export class StudentGroupingReportComponent implements OnInit {

  students;dataSource;
  // allStudentResults:StudentResult[] = [];
  allStudentResults = [];
  // studentsResponses:any[];
  columnsToDisplay: string[] = ['name', 'calculatedScore', 'score', 'status'];
  classFormService:ClassFormService;
  classUtils: ClassUtils
  formList: any[] = []; // used for the user interface - creates Class grouping list
  status:string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')]
  navigationSubscription
  feedbackViewInited:boolean = false
  curriculumFormsList;  // list of all curriculum forms
  classGroupReport:ClassGroupingReport;

  @ViewChild('container') container: ElementRef;
  @ViewChild('feedback') feedbackElement: ElementRef;
  @ViewChild('feedbackMessage') feedbackMessage: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private renderer: Renderer2
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
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classFormService = new ClassFormService({databaseName: currentUser});
      this.classFormService = classFormService
    }
    this.classUtils = new ClassUtils();

    const itemId = this.route.snapshot.paramMap.get('type');
    const classId = this.route.snapshot.paramMap.get('classId');
    let curriculumId = this.route.snapshot.paramMap.get('curriculumId');

    // Get data about this particular subtest
    let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);

    this.formList = [];
    for (const form of this.curriculumFormsList) {
      let formEl = {
        "title":form.title,
        "id":form.id,
        "classId":classId,
        "curriculumId":curriculumId
      };
      this.formList.push(formEl)
    }

    let subtest = this.curriculumFormsList.filter(obj => {
      return obj.id === itemId
    })
    let item = subtest[0]
    let results = await this.getResultsByClass(classId, curriculumId, this.curriculumFormsList, item);

    this.classGroupReport = await this.dashboardService.getClassGroupReport(item, classId, curriculumId, results)
    // console.log("this.classGroupReport item: " + item + " classId: " + classId + " curriculumId: " + curriculumId + "results: "  + JSON.stringify(results))
    // console.log("this.classGroupReport feedback: " + JSON.stringify(this.classGroupReport.feedback))
    this.dataSource = new MatTableDataSource<StudentResult>(this.classGroupReport.allStudentResults);
  }

  ngAfterViewChecked() {
    if (!this.feedbackViewInited) {
      let el: HTMLElement = document.querySelector(".feedback-example")
      if (el) {
        el.style.backgroundColor = "lightgoldenrodyellow"
        el.style.margin = "1em"
        el.style.padding = "1em"
        this.feedbackViewInited = true
      }
      el = document.querySelector(".feedback-assignment")
      if (el) {
        el.style.backgroundColor = "lightgoldenrodyellow"
        el.style.margin = "1em"
        el.style.padding = "1em"
        this.feedbackViewInited = true
      }
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
    let feedback:Feedback = await this.dashboardService.getFeedback(percentile, curriculumId, itemId)
    if (feedback) {
      feedback.percentileRange = this.dashboardService.calculatePercentileRange(percentile)
      this.classGroupReport.feedback = feedback
    }

    // let xPosition = event.clientX;
    let yPositionEvent = event.clientY;
    let feedbackPosition = this.getPosition(this.feedbackMessage.nativeElement);
    let parentPositionTop = this.getPosition(this.feedbackElement.nativeElement);
    let parentPositionHeight = this.feedbackElement.nativeElement.clientHeight;
    let feedbackMessageHeight = this.feedbackMessage.nativeElement.clientHeight;
    let parentBottom = parentPositionTop.y + parentPositionHeight
    console.log("feedbackMessageHeight: " + feedbackMessageHeight)
    // let styles = getComputedStyle(this.feedbackMessage.nativeElement);
    // console.log("this.feedbackMessage.nativeElement.offsetHeight: " + this.feedbackMessage.nativeElement.offsetHeight)
    // let yPosition = event.clientY - parentPosition.y - (this.feedbackMessage.nativeElement.offsetHeight / 2);
    // let yPosition = event.clientY - parentPosition.y
    // let yPosition = event.clientY
    let clickPosition = this.getPosition(event.target);
    let yPosition = clickPosition.y
    // let finalPosition = parentBottom - feedbackMessageHeight - (clickPosition.y - parentPositionTop.y)
    let finalPosition =  (clickPosition.y - parentPositionTop.y) - feedbackMessageHeight;
    if (finalPosition < 0) {
      finalPosition = 0
    }
    // console.log("yPositionEvent: " + yPositionEvent + " parentPosition: " + parentPositionTop.y + " clickPosition.y: " + clickPosition.y + " yPosition: " + yPosition + " finalPosition: " + finalPosition)
    this.renderer.setStyle(this.feedbackMessage.nativeElement, 'position',  "relative")
    this.renderer.setStyle(this.feedbackMessage.nativeElement, 'top',  finalPosition + "px")
    // console.log("Get feedback for " + JSON.stringify(feedback))
  }

  // Helper function to get an element's exact position
  getPosition(el) {
    var xPos = 0;
    var yPos = 0;

    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;

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
