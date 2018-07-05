import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DashboardService} from "../_services/dashboard.service";
import {MatTabChangeEvent, MatTableDataSource} from "@angular/material";
import {AuthenticationService} from "../../core/auth/_services/authentication.service";
import {ClassViewService} from "../_services/class-view.service";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";

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

  formList;classes;students;currentClassId;selectedTab;curriculum;curriculumForms;dataSource;columnsToDisplay;
  studentsResponses:any[];
  allStudentResults:StudentResult[];
  formColumns: string[] = [];
  // columnsToDisplay: string[] = ["Name"];
  selection = new SelectionModel<StudentResult>(false, []);
  @ViewChild('container') container: ElementRef;

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }



  async ngOnInit() {
    await this.populateFormList();
    this.initDashboard();
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
        // let inputs = [];
        // this.classes[0].doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
        // let input = inputs.find(input => (input.name === 'curriculum') ? true : false)
        // if (input) {
        //   this.curriculum = input.value;
        //   //todo: persist curricula in memory and find curriculum.name.
        //   this.curriculumForms = await this.getCurriculaForms(this.curriculum)
        // }
        //
        // this.currentClassId = this.classes[0].id;
        // this.students = await this.getMyStudents(this.currentClassId);
        // let results = await this.getResultsByClass(this.currentClassId, this.curriculumForms);
        // this.studentsResponses = {};
        // for (const response of results) {
        //   console.log("response: " + JSON.stringify(response))
        //   // studentsResponses.push();
        //   let studentId = response.columns.studentId
        //   let studentReponses = this.studentsResponses[studentId];
        //   if (typeof studentReponses === 'undefined') {
        //     studentReponses = {}
        //   }
        //   let formId = response.formId;
        //   studentReponses[formId] = response;
        //   this.studentsResponses[studentId] = studentReponses
        // }
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
    await this.populateGridData(tabChangeEvent.index);
    this.renderGrid();
  }

  private async populateGridData(index) {
    let inputs = [];
    this.classes[index].doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
    let input = inputs.find(input => (input.name === 'curriculum') ? true : false)
    if (input) {
      this.curriculum = input.value;
      //todo: persist curricula in memory and find curriculum.name.
      this.curriculumForms = await this.getCurriculaForms(this.curriculum)
    }
    let currentClass = this.classes[index];
    if (typeof currentClass !== 'undefined') {
      this.currentClassId = currentClass.id;
      this.students = await this.getMyStudents(this.currentClassId);
      let results = await this.getResultsByClass(this.currentClassId, this.curriculumForms);
      this.studentsResponses = {};
      for (const response of results) {
        console.log("response: " + JSON.stringify(response))
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

  }

  async populateFormList() {
    try {
      this.formList = await this.dashboardService.getFormList();
    } catch (error) {
      console.error(error);
    }
  }
  async getCurriculaForms(curriculum) {
    try {
      let formHtml = await this.dashboardService.getCurriculaForms(curriculum);
      const container = this.container.nativeElement
      container.innerHTML = formHtml
      let formEl = container.querySelectorAll('tangy-form-item')
      var output = "";
      let curriculumForms = [];
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

      // console.log("this.curriculumForms:" + JSON.stringify(curriculumForms) )
      return curriculumForms;
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
