import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DashboardService} from "../../_services/dashboard.service";
import {AuthenticationService} from "../../../core/auth/_services/authentication.service";
import {_TRANSLATE} from "../../../shared/translation-marker";
import {MatTableDataSource} from "@angular/material";
import {ClassFormService} from "../../_services/class-form.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ClassUtils} from "../../class-utils";


export interface ClassGroupingReport {
  id: string;
  subtestName: string;
  classSize:number;
  studentsAssessed:number;
  aveCorrectPerc:number;
  aveCorrect:number;
  studentsToWatch:string[];
}

export interface StudentResult {
  id: string;
  name: string;
  forms:any;
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
  studentsResponses:any[];
  columnsToDisplay: string[] = ['name', 'score', 'status'];
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
  formList: any[] = []; // used for the user interface - creates Class grouping list
  status:string[] =  [_TRANSLATE('Status.Concerning'), _TRANSLATE('Status.Poor'), _TRANSLATE('Status.Good'), _TRANSLATE('Status.Great')]
  navigationSubscription

  @ViewChild('container') container: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router
  )  {
    // subscribe to the router events - storing the subscription so
    // we can unsubscribe later.
    this.navigationSubscription = this.router.events.subscribe(async (e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        // this.initialiseInvites();
        await this.getReport();
      }
    });
  }

  async ngOnInit() {

    await this.getReport()
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }


  async getReport() {

  // # Used to calculate percentiles
  // # Use indices where Index = Standard Deviation * 100 for negative deviations
    let normalCurve = [0.00000, 0.00399, 0.00798, 0.01197, 0.01595, 0.01994, 0.02392, 0.02790, 0.03188, 0.03586,0.03983, 0.04380, 0.04776, 0.05172, 0.05567, 0.05962, 0.06356, 0.06749, 0.07142, 0.07535,0.07926, 0.08317, 0.08706, 0.09095, 0.09483, 0.09871, 0.10257, 0.10642, 0.11026, 0.11409,0.11791, 0.12172, 0.12552, 0.12930, 0.13307, 0.13683, 0.14058, 0.14431, 0.14803, 0.15173,0.15542, 0.15910, 0.16276, 0.16640, 0.17003, 0.17364, 0.17724, 0.18082, 0.18439, 0.18793,0.19146, 0.19497, 0.19847, 0.20194, 0.20540, 0.20884, 0.21226, 0.21566, 0.21904, 0.22240,0.22575, 0.22907, 0.23237, 0.23565, 0.23891, 0.24215, 0.24537, 0.24857, 0.25175, 0.25490,0.25804, 0.26115, 0.26424, 0.26730, 0.27035, 0.27337, 0.27637, 0.27935, 0.28230, 0.28524,0.28814, 0.29103, 0.29389, 0.29673, 0.29955, 0.30234, 0.30511, 0.30785, 0.31057, 0.31327,0.31594, 0.31859, 0.32121, 0.32381, 0.32639, 0.32894, 0.33147, 0.33398, 0.33646, 0.33891,0.34134, 0.34375, 0.34614, 0.34849, 0.35083, 0.35314, 0.35543, 0.35769, 0.35993, 0.36214,0.36433, 0.36650, 0.36864, 0.37076, 0.37286, 0.37493, 0.37698, 0.37900, 0.38100, 0.38298,0.38493, 0.38686, 0.38877, 0.39065, 0.39251, 0.39435, 0.39617, 0.39796, 0.39973, 0.40147,0.40320, 0.40490, 0.40658, 0.40824, 0.40988, 0.41149, 0.41308, 0.41466, 0.41621, 0.41774,0.41924, 0.42073, 0.42220, 0.42364, 0.42507, 0.42647, 0.42785, 0.42922, 0.43056, 0.43189,0.43319, 0.43448, 0.43574, 0.43699, 0.43822, 0.43943, 0.44062, 0.44179, 0.44295, 0.44408,0.44520, 0.44630, 0.44738, 0.44845, 0.44950, 0.45053, 0.45154, 0.45254, 0.45352, 0.45449,0.45543, 0.45637, 0.45728, 0.45818, 0.45907, 0.45994, 0.46080, 0.46164, 0.46246, 0.46327,0.46407, 0.46485, 0.46562, 0.46638, 0.46712, 0.46784, 0.46856, 0.46926, 0.46995, 0.47062,0.47128, 0.47193, 0.47257, 0.47320, 0.47381, 0.47441, 0.47500, 0.47558, 0.47615, 0.47670,0.47725, 0.47778, 0.47831, 0.47882, 0.47932, 0.47982, 0.48030, 0.48077, 0.48124, 0.48169,0.48214, 0.48257, 0.48300, 0.48341, 0.48382, 0.48422, 0.48461, 0.48500, 0.48537, 0.48574,0.48610, 0.48645, 0.48679, 0.48713, 0.48745, 0.48778, 0.48809, 0.48840, 0.48870, 0.48899,0.48928, 0.48956, 0.48983, 0.49010, 0.49036, 0.49061, 0.49086, 0.49111, 0.49134, 0.49158,0.49180, 0.49202, 0.49224, 0.49245, 0.49266, 0.49286, 0.49305, 0.49324, 0.49343, 0.49361,0.49379, 0.49396, 0.49413, 0.49430, 0.49446, 0.49461, 0.49477, 0.49492, 0.49506, 0.49520,0.49534, 0.49547, 0.49560, 0.49573, 0.49585, 0.49598, 0.49609, 0.49621, 0.49632, 0.49643,0.49653, 0.49664, 0.49674, 0.49683, 0.49693, 0.49702, 0.49711, 0.49720, 0.49728, 0.49736,0.49744, 0.49752, 0.49760, 0.49767, 0.49774, 0.49781, 0.49788, 0.49795, 0.49801, 0.49807,0.49813, 0.49819, 0.49825, 0.49831, 0.49836, 0.49841, 0.49846, 0.49851, 0.49856, 0.49861,0.49865, 0.49869, 0.49874, 0.49878, 0.49882, 0.49886, 0.49889, 0.49893, 0.49896, 0.49900,0.49903, 0.49906, 0.49910, 0.49913, 0.49916, 0.49918, 0.49921, 0.49924, 0.49926, 0.49929,0.49931, 0.49934, 0.49936, 0.49938, 0.49940, 0.49942, 0.49944, 0.49946, 0.49948, 0.49950, 0.49952, 0.49953, 0.49955, 0.49957, 0.49958, 0.49960, 0.49961, 0.49962, 0.49964, 0.49965,0.49966, 0.49968, 0.49969, 0.49970, 0.49971, 0.49972, 0.49973, 0.49974, 0.49975, 0.49976,0.49977, 0.49978, 0.49978, 0.49979, 0.49980, 0.49981, 0.49981, 0.49982, 0.49983, 0.49983,0.49984, 0.49985, 0.49985, 0.49986, 0.49986, 0.49987, 0.49987, 0.49988, 0.49988, 0.49989,0.49989, 0.49990, 0.49990, 0.49990, 0.49991, 0.49991, 0.49992, 0.49992, 0.49992, 0.49992,0.49993, 0.49993, 0.49993, 0.49994, 0.49994, 0.49994, 0.49994, 0.49995, 0.49995, 0.49995,0.49995, 0.49995, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49997, 0.49997,0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49998, 0.49998, 0.49998, 0.49998]
    let colorClass  = ["concerning", "poor", "good", "great"]
    let status      = ["Concerning", "Poor", "Good", "Great"]

    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classFormService = new ClassFormService({databaseName: currentUser});
      this.classFormService = classFormService
      this.classUtils = new ClassUtils();
    }

    const tangyFormItem = this.route.snapshot.paramMap.get('type');
    const classId = this.route.snapshot.paramMap.get('classId');
    let curriculumId = this.route.snapshot.paramMap.get('curriculumId');
    let classDoc = await this.classFormService.getResponse(classId);
    let classRegistration = this.classUtils.getInputValues(classDoc);

    // Get data about this particular subtest
    let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    const container = this.container.nativeElement
    let curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml, container);

    this.formList = [];
    for (const form of curriculumFormsList) {
      let formEl = {
        "title":form.title,
        "id":form.id,
        "classId":classId,
        "curriculumId":curriculumId
      };
      this.formList.push(formEl)
    }

    let subtest = curriculumFormsList.filter(obj => {
      return obj.id === tangyFormItem
    })
    this.classGroupReport.subtestName = subtest[0].title

    this.students = await this.getMyStudents(classId);
    let results = await this.getResultsByClass(classId, curriculumId, curriculumFormsList);
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
    let aveCorrect = 0;
    let aveCorrectPerc = 0;
    let studentsToWatch = [];

    for (const student of this.students) {
      let studentResults = {};
      studentResults["id"] = student.id
      studentResults["name"] = student.doc.items[0].inputs[0].value
      studentResults["classId"] = student.doc.items[0].inputs[3].value
      studentResults["forms"] = [];
      for (const form of curriculumFormsList) {
        if (this.studentsResponses[student.id]) {
          if (form.id === tangyFormItem) {
            let studentResponse = this.studentsResponses[student.id][form.id]
            studentResults["response"] = studentResponse
            if (studentResponse) {
              let score = studentResponse["score"]
              if (score) {
                studentResults["score"] = score
              }
              let totalGridCorrect = studentResponse["totalGridCorrect"]
              let totalGridPercentageCorrect = studentResponse["totalGridPercentageCorrect"]
              if (totalGridPercentageCorrect) {
                studentResults["score"] = totalGridPercentageCorrect
                let index;
                if (totalGridPercentageCorrect >= 80)
                  index = 3
                else if (totalGridPercentageCorrect >= 60 && totalGridPercentageCorrect <= 79)
                  index = 2
                else if (totalGridPercentageCorrect >= 30 && totalGridPercentageCorrect <= 59)
                  index = 1
                else
                  index = 0
                studentResults["index"] = index
                studentResults["status"] = status[index]
                studentResults["colorClass"] = colorClass[index]
                if (index === 0) {
                  studentsToWatch.push(studentResults["name"])
                }
              }
              aveCorrect += totalGridCorrect
              aveCorrectPerc += totalGridPercentageCorrect
              // TODO: calculate percentile and stdDev.
            }
            studentsAssessed ++
          }
        }
        // else {
        //   if (form.id === tangyFormItem) {
        //     studentResults["status"] = this.status[0]
        //     studentsToWatch.push(studentResults["name"])
        //   }
        // }
      }
      allStudentResults.push(studentResults)
    }

    // aveCorrectPerc = this.classUtils.decimals( aveCorrectPerc / this.students.length, 0 )
    // aveCorrect = this.classUtils.decimals( aveCorrect / this.students.length, 2 )
    aveCorrectPerc = this.classUtils.round( aveCorrectPerc / this.students.length, 0 )
    aveCorrect = this.classUtils.round( aveCorrect / this.students.length, 2 )


    function compare(a,b) {
      if (a.score < b.score)
        return 1;
      if (a.score > b.score)
        return -1;
      return 0;
    }
    let allStudentResultsSorted = allStudentResults.sort(compare);
    this.allStudentResults = allStudentResultsSorted;
    this.classGroupReport.studentsAssessed = studentsAssessed
    this.classGroupReport.aveCorrectPerc = aveCorrectPerc
    this.classGroupReport.aveCorrect = aveCorrect
    this.classGroupReport.studentsToWatch = studentsToWatch
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

  async getResultsByClass(selectedClass: any, curriculum, curriculumFormsList) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, curriculumFormsList);
    } catch (error) {
      console.error(error);
    }
  }

  displayReport(item) {
    let url = '/reports/grouping/' + item.id + '/' + item.classId + '/' + item.curriculumId;
    console.log("displaying report for " + url)
    let ts = Date.now();

    this.router.navigate([url]);
    // window.location.replace('/#' + url);
    // window.location.replace = '/#' + url + '?' + ts;
    // window.location.reload();
  }

}
