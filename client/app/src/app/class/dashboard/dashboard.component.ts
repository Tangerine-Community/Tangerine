import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DashboardService} from "../_services/dashboard.service";
import {MatTabChangeEvent, MatPaginator, MatTableDataSource, PageEvent} from "@angular/material";
import {AuthenticationService} from "../../core/auth/_services/authentication.service";
import {ClassViewService} from "../_services/class-view.service";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";
import {tap} from "rxjs/internal/operators";

export interface StudentResult {
  id: string;
  name: string;
  forms:any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  formList;classes;students;selectedTab;curriculum;curriculumForms;dataSource;columnsToDisplay;selectedReport;
  currentClassId;currentClassIndex;curriculumFormsList;curriculumFormHtml
  studentsResponses:any[];
  allStudentResults:StudentResult[];
  formColumns: string[] = [];
  formColumnsDS;
  // columnsToDisplay: string[] = ["Name"];
  selection = new SelectionModel<StudentResult>(false, []);

  // MatPaginator Inputs
  // length = 10;
  pageLength = 10;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 15, 100];

  // MatPaginator Output
  // pageEvent: PageEvent;

  @ViewChild('container') container: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }


  async ngOnInit() {
    await this.populateFormList();
    await this.initDashboard();
    (<any>window).Tangy = {}
    const currentUser = await this.authenticationService.getCurrentUser();
    if (currentUser) {
      const classViewService = new ClassViewService({databaseName: currentUser});
      classViewService.initialize();
    }
  }

  async initDashboard() {
    try {
      this.classes = await this.getMyClasses();
      if (this.classes.length > 0) {
        await this.populateGridData(0)
        this.renderGrid();
      }
    } catch (error) {
      console.error(error);
    }
  }

  tabChanged = async (tabChangeEvent: MatTabChangeEvent): void => {
    this.selectedTab = tabChangeEvent.tab;
    // console.log('tabChangeEvent => ', tabChangeEvent);
    // console.log('index => ', tabChangeEvent.index);
    await this.populateGridData(tabChangeEvent.index, this.paginator.pageIndex, this.paginator.pageSize);
    this.renderGrid();
  }

  private async loadGrid() {
    // console.log("this.paginator.pageIndex: " + this.paginator.pageIndex + " this.paginator.pageSize: " + this.paginator.pageSize);
    await this.populateGridData(this.currentClassIndex, this.paginator.pageIndex, this.paginator.pageSize);
    this.renderGrid();
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
      if (typeof pi === 'undefined') {
        pi = 0
      }
      if (typeof ps === 'undefined') {
        ps = 5
      }
      this.curriculumForms = await this.getCurriculaForms(this.curriculum, pi, ps)
    }
    let currentClass = this.classes[this.currentClassIndex];
    if (typeof currentClass !== 'undefined') {
      this.currentClassId = currentClass.id;
      this.students = await this.getMyStudents(this.currentClassId);
      let results = await this.getResultsByClass(this.currentClassId, this.curriculumForms);
      this.studentsResponses = {};
      for (const response of results) {
        // console.log("response: " + JSON.stringify(response))
        // studentsResponses.push();
        let studentId = response.columns.studentId
        let studentReponses = this.studentsResponses[studentId];
        if (typeof studentReponses === 'undefined') {
          studentReponses = {}
        }
        let formId = response.formId;
        studentReponses[formId] = response;
        this.studentsResponses[studentId] = studentReponses
      }
    }
  }

  /** Populate the querystring with the form info. */
  selectCheckbox(column, i) {
    // let el = this.selection.select(row);
    this.selection.toggle()
    let selectedForm = column.forms[i];
    let studentId = column.id
    let classId = column.classId
    let selectedFormId = selectedForm.formId
    let selectedId = selectedForm.curriculum
    let src = selectedForm.src
    let title = selectedForm.title
    // console.log("boom! " + selectedId)
    this.router.navigate(['tangy-forms-player'], { queryParams:
        { formId: selectedId, studentId: studentId, classId: classId, itemId: selectedFormId, src: src, title: title }
    });
  }

  /** Populate the querystring with the form info. */
  selectCheckboxResult(column, i) {
    // let el = this.selection.select(row);
    this.selection.toggle()
    let selectedForm = column.forms[i];
    let studentId = column.id
    let classId = column.classId
    let selectedFormId = selectedForm.formId
    let selectedId = selectedForm.curriculum
    let src = selectedForm.src
    let title = selectedForm.title
    let responseId = selectedForm.response._id
    // console.log("boom! " + selectedId)
    this.router.navigate(['tangy-forms-player'], { queryParams:
        { formId: selectedId, studentId: studentId, classId: classId, itemId: selectedFormId, src: src, title: title, responseId: responseId }
    });
  }

  private renderGrid() {
    // let allStudentResults:StudentResult = [];
    let allStudentResults = [];
    // re-init the formColumns and columnsToDisplay
    this.formColumns = [];
    this.columnsToDisplay = ["Name"];
    for (const form of this.curriculumForms) {
      let formEl = {
        "title":form.title,
        "id":form.id
      };
      this.formColumns.push(form.title)
      // this.formColumns.push(formEl)
      this.columnsToDisplay.push(form.title);
      // this.columnsToDisplay.push(formEl);
    }
    this.formColumnsDS = new MatTableDataSource(this.formColumns);
    this.paginator.page
      .pipe(
        tap(() => this.loadGrid())
      )
      .subscribe();

    for (const student of this.students) {
      let studentResults = {};
      studentResults["id"] = student.id
      studentResults["name"] = student.doc.items[0].inputs[0].value
      studentResults["classId"] = student.doc.items[0].inputs[3].value
      studentResults["forms"] = [];
      // studentResults["forms"] = {};
      for (const form of this.curriculumForms) {
        let formResult = {};
        formResult["formId"] = form.id
        formResult["curriculum"] = this.curriculum
        formResult["title"] = form.title
        formResult["src"] = form.src
        if (this.studentsResponses[student.id]) {
          formResult["response"] = this.studentsResponses[student.id][form.id]
        }
        studentResults["forms"].push(formResult)
        // studentResults["forms"][form.id] = formResult
      }
      allStudentResults.push(studentResults)
    }
    this.allStudentResults = allStudentResults;
    this.dataSource = new MatTableDataSource<StudentResult>(allStudentResults);
    // this.dataSource.paginator = this.paginator;
  }

  async populateFormList() {
    try {
      this.formList = await this.dashboardService.getFormList();
    } catch (error) {
      console.error(error);
    }
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
      // this only needs to happen once.
      if (typeof this.curriculumFormHtml === 'undefined') {
        let curriculumForms = [];
        let curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculum);
        const container = this.container.nativeElement
        container.innerHTML = curriculumFormHtml
        let formEl = container.querySelectorAll('tangy-form-item')
        var output = "";
        for (const el of formEl) {
          var attrs = el.attributes;
          let obj = {}
          for(var i = attrs.length - 1; i >= 0; i--) {
            // output = attrs[i].name + "->" + attrs[i].value;
            obj[attrs[i].name] = attrs[i].value;
            // console.log("this.formEl:" + output )
          }
          curriculumForms.push(obj)
        }
        this.curriculumFormsList = curriculumForms;
        // this.length = this.curriculumFormsList.length
        this.pageLength = this.curriculumFormsList.length
      }
      let selectedCurriculumForms, start, end;
      let i = 1
      if (pageIndex === 0) {
        start = 0;
        end = pageSize;
      } else {
        start = (i*pageIndex) + pageSize;
        end = start + pageSize;
      }
      selectedCurriculumForms  = curriculumForms.slice(start, end);
      // selectedCurriculumForms  = curriculumForms;
      console.log("start: " + start + " end" + end + " this.curriculumFormsList.length: " + this.curriculumFormsList.length + " selectedCurriculumForms:" + JSON.stringify(selectedCurriculumForms) )
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
