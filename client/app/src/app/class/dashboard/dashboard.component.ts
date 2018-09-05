import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DashboardService} from "../_services/dashboard.service";
import {MatTabChangeEvent, MatPaginator, MatTableDataSource, PageEvent} from "@angular/material";
import {AuthenticationService} from "../../core/auth/_services/authentication.service";
import {ClassFormService} from "../_services/class-form.service";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";
import {tap} from "rxjs/internal/operators";
import {FormControl} from "@angular/forms";

export interface StudentResult {
  id: string;
  name: string;
  forms:any;
}
export interface StudentResponse {
  id: string;
  formId: string;
  columns:any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard-simple.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  classes;students;selectedTab;selectedIndex;curriculum;curriculumTitle; dataSource;columnsToDisplay;selectedReport;
  currentClassId;currentClassIndex;
  curriculumFormsList;  // list of all curriculum forms
  curriculumForms;  // a subset of curriculumFormsList
  studentsResponses:any[];
  allStudentResults:StudentResult[];
  formColumns: string[] = [];
  formIds: string[] = [];
  formList: any[] = [];
  formColumnsDS;
  // columnsToDisplay: string[] = ["Name"];
  selection = new SelectionModel<StudentResult>(false, []);

  // MatPaginator Inputs
  // length = 10;
  pageLength = 10;
  pageSize = 5;
  pageIndex = 0;
  pageStart = 0;
  pageSizeOptions: number[] = [5, 10, 15, 100];
  reportsMenu;
  groupingMenu;
  studentRegistrationCurriculum = "student-registration";
  classRegistrationParams = {
    curriculum:"class-registration"
  }
  isLoading;
  // selected = new FormControl(0);

  // MatPaginator Output
  pageEvent: PageEvent;
  private paginator: MatPaginator;

  @ViewChild('container') container: ElementRef;
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    console.log("Set this.paginator")
    // this.setDataSourceAttributes();
  }

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }


  async ngOnInit() {
    // await this.populateFormList();
    await this.initDashboard();
    (<any>window).Tangy = {}
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classViewService = new ClassFormService({databaseName: currentUser});
      classViewService.initialize();
    }

  }

  async initDashboard() {
    try {
      this.classes = await this.getMyClasses();
      if (this.classes.length > 0) {
        await this.populateGridData(0, 0, 5)
        this.renderGrid();
        this.selectedIndex = 0;
      }
    } catch (error) {
      console.error(error);
    }
  }

  tabChanged = async (tabChangeEvent: MatTabChangeEvent): Promise<void> => {
    // console.log('tabChangeEvent => ', tabChangeEvent);
    // console.log('index => ', tabChangeEvent.index);
    if (this.paginator) {
      this.selectedTab = tabChangeEvent.tab;
      // No need to populate grid if this is the Add Class link.
      if (this.classes.length !== tabChangeEvent.index) {
        await this.populateGridData(tabChangeEvent.index, this.paginator.pageIndex, this.paginator.pageSize);
        this.renderGrid();
      }
    } else {
      this.selectedIndex = 0;
    }
  }

  private async loadGrid() {
    // console.log("this.paginator.pageIndex: " + this.paginator.pageIndex + " this.paginator.pageSize: " + this.paginator.pageSize);
    await this.populateGridData(this.currentClassIndex, this.paginator.pageIndex, this.paginator.pageSize);
    this.renderGrid();
  }

  private async paginate(dir) {
    console.log("this.pageIndex: " + this.pageIndex + " this.pageSize: " + this.pageSize);
    if (dir === 0) {  //prev
      this.pageIndex = --this.pageIndex
    } else {
      this.pageIndex = ++this.pageIndex
    }
    if (dir === 0 && this.pageIndex < 0) {
      console.log("no mas.")
    } else {
      await this.populateGridData(this.currentClassIndex, this.pageIndex, this.pageSize);
      this.renderGrid();
    }
  }

  private async populateGridData(classIndex, pageIndex, pageSize) {
    let inputs = [];
    this.currentClassIndex = classIndex;
    this.classes[this.currentClassIndex].doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
    let input = inputs.find(input => (input.name === 'curriculum') ? true : false)
    if (input) {
      this.curriculum = input.value;
      //todo: persist curricula in memory and find curriculum.name.
      let pi = pageIndex
      let ps = pageSize
      if (pi === null || typeof pi === 'undefined') {
        pi = 0
      }
      if (ps === null || typeof ps === 'undefined') {
        ps = 5
      }
      try {
        this.curriculumForms = await this.getCurriculaForms(this.curriculum, pi, ps)
      } catch (e) {
        console.log("Error fetching this.curriculumForms: " + e)
      }
      if (typeof this.curriculumForms === 'undefined') {
        console.log("This is an error - there are no this.curriculumForms for this curriculum or range.")
      }
    }
    let currentClass = this.classes[this.currentClassIndex];
    if (typeof currentClass !== 'undefined') {
      this.currentClassId = currentClass.id;
      this.students = await this.getMyStudents(this.currentClassId);
      let results = await this.getResultsByClass(this.currentClassId, this.curriculumFormsList);
      this.studentsResponses = [];
      let formsTodisplay = {}
      this.curriculumForms.forEach(form => {
        formsTodisplay[form.id] = form
      })
      for (const response of results as any[] ) {
        // console.log("response: " + JSON.stringify(response))
        // studentsResponses.push();
        if (formsTodisplay[response.formId] !== 'undefined') {
          let studentId = response.studentId
          let studentReponses = this.studentsResponses[studentId];
          if (typeof studentReponses === 'undefined') {
            studentReponses = {}
          }
          let formId = response.formId;
          studentReponses[formId] = response;
          this.studentsResponses[studentId] = studentReponses
          console.log("response id: " + response._id)
        }
      }
      let allStudentResults = [];
      // for (const student of this.students) {
      this.students.forEach((student) => {
        let studentResults = {};
        studentResults["id"] = student.id
        studentResults["name"] = student.doc.items[0].inputs[0].value
        studentResults["classId"] = student.doc.items[0].inputs[3].value
        // studentResults["forms"] = [];
        studentResults["forms"] = {};
        // for (const form of this.curriculumForms) {
        this.curriculumForms.forEach((form) => {
          let formResult = {};
          formResult["formId"] = form.id
          formResult["curriculum"] = this.curriculum
          formResult["title"] = form.title
          formResult["src"] = form.src
          if (this.studentsResponses[student.id]) {
            formResult["response"] = this.studentsResponses[student.id][form.id]
          }
          // studentResults["forms"].push(formResult)
          studentResults["forms"][form.id] = formResult
        })
        allStudentResults.push(studentResults)
      })
      this.allStudentResults = allStudentResults;
    }
  }

  /** Populate the querystring with the form info. */
  selectCheckbox(column, i) {
    // let el = this.selection.select(row);
    this.selection.toggle(column)
    let formsArray = Object.values(column.forms)
    let selectedForm = formsArray[i];
    let studentId = column.id
    let classId = column.classId
    let selectedFormId = selectedForm['formId']
    let curriculum = selectedForm['curriculum']
    let src = selectedForm['src']
    let title = selectedForm['title']
    let responseId = null;
    if (selectedForm['response']) {
      responseId = selectedForm['response']['_id']
    }
    this.router.navigate(['class-forms-player'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId, classId: classId, itemId: selectedFormId, src: src, title: title, responseId: responseId }
    });
  }

  /** Populate the querystring with the form info. */
  selectCheckboxResult(column, i) {
    // let el = this.selection.select(row);
    this.selection.toggle(column)
    let formsArray = Object.values(column.forms)
    let selectedForm = formsArray[i];
    let studentId = column.id
    let classId = column.classId
    let selectedFormId = selectedForm['formId']
    let curriculum = selectedForm['curriculum']
    let src = selectedForm['src']
    let title = selectedForm['title']
    let responseId = selectedForm['response']['_id']
    this.router.navigate(['class-forms-player'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId, classId: classId, itemId: selectedFormId, src: src, title: title, responseId: responseId }
    });
  }

  private renderGrid() {
    // let allStudentResults:StudentResult = [];
    // re-init the formColumns and columnsToDisplay
    this.formColumns = [];
    this.formIds = [];
    this.formList = [];
    this.columnsToDisplay = ["Name"];
    for (const form of this.curriculumForms) {
      let formEl = {
        "title":form.title,
        "id":form.id,
        "classId":this.currentClassId
      };
      this.formList.push(formEl)
      this.formColumns.push(form.title)
      this.formIds.push(form.id)
      // this.formColumns.push(formEl)
      this.columnsToDisplay.push(form.title);
      // this.columnsToDisplay.push(formEl);
    }
    console.log("renderGrid done")
    // this.formColumnsDS = new MatTableDataSource(this.formColumns);
    // if (this.paginator) {
    //   this.paginator.page
    //     .pipe(
    //       tap(() => this.loadGrid())
    //     )
    //     .subscribe();
    // } else {
    //   console.log("this.paginator is not defined.")
    // }

    // this.dataSource = new MatTableDataSource<StudentResult>(this.allStudentResults);
    // this.dataSource.paginator = this.paginator;
  }

  // async populateFormList() {
  //   try {
  //     this.formList = await this.dashboardService.getFormList();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  selectReport(reportId) {
    console.log("reportId: " + reportId)
  }

  /**
   * Fetch ./assets/${curriculum}/form.html, attach to the container, select all tangy-form-item objects
   * and push into a string array, limited by pageIndex and pageSize
   * @param curriculum
   * @param pageIndex
   * @param pageSize
   * @returns {Promise<any[]>}
   */
  async getCurriculaForms(curriculum, pageIndex, pageSize) {
    try {
      let selectedCurriculumForms, start, end, curriculumForms = [];
      let i = 1
      if (pageIndex === 0) {
        start = 0;
        end = pageSize;
      } else {
        this.pageLength = Math.max(this.pageLength, 0);
        start = ((pageIndex * pageSize) > this.pageLength) ?
          (Math.ceil(this.pageLength / pageSize) - 1) * pageSize:
          pageIndex * pageSize;
        this.pageStart = start
        end = Math.min(start + pageSize, this.pageLength);
        console.log( start + 1 + ' - ' + end + '  of  ' + this.pageLength)
      }

      // this only needs to happen once.
      let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculum);
      const container = this.container.nativeElement
      container.innerHTML = curriculumFormHtml
      let formEl = container.querySelectorAll('tangy-form-item')
      var output = "";
      for (const el of formEl) {
        var attrs = el.attributes;
        let obj = {}
        for(let i = attrs.length - 1; i >= 0; i--) {
          // output = attrs[i].name + "->" + attrs[i].value;
          obj[attrs[i].name] = attrs[i].value;
          // console.log("this.formEl:" + output )
        }
        curriculumForms.push(obj)
      }
      this.curriculumFormsList = curriculumForms;
      // this.length = this.curriculumFormsList.length
      this.pageLength = this.curriculumFormsList.length
      selectedCurriculumForms  = curriculumForms.slice(start, end);
      return selectedCurriculumForms;
    } catch (error) {
      console.error(error);
    }
  }

  async getMyClasses() {
    try {
      this.classes = await this.dashboardService.getMyClasses();
      // console.log("this.classes:" + JSON.stringify(this.classes))
      return this.classes;
    } catch (error) {
      console.error(error);
    }
  }

  async getMyStudents(selectedClass: any) {
    try {
      // find which class is selected
      return await this.dashboardService.getMyStudents(selectedClass);
    } catch (error) {
      console.error(error);
    }
  }

  async getResultsByClass(selectedClass: any, forms) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, forms);
    } catch (error) {
      console.error(error);
    }
  }



}
