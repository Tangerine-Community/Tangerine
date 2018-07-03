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
  results:[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  formList;classes;students;currentClassId;selectedTab;curriculum;curriculumForms;dataSource;
  allStudentResults:StudentResult[];
  formColumns: string[] = [];
  columnsToDisplay: string[] = ["Name"];
  selection = new SelectionModel<StudentResult>(false, []);
  @ViewChild('container') container: ElementRef;

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) { }

  tabChanged = async (tabChangeEvent: MatTabChangeEvent): void => {
    this.selectedTab = tabChangeEvent.tab;
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    let inputs = [];
    this.classes[tabChangeEvent.index].doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
    let input = inputs.find(input => (input.name === 'curriculum') ? true : false)
    if (input) {
      this.curriculum = input.value;
      //todo: persist curricula in memory and find curriculum.name.
      this.curriculumForms = await this.getCurriculaForms(this.curriculum)
    }
    let currentClass = this.classes[tabChangeEvent.index];
    if (typeof currentClass !== 'undefined') {
      this.currentClassId = currentClass.id;
      this.students = await this.getMyStudents(this.currentClassId);
    }
    this.renderGrid();
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  selectCheckbox(column, i) {
    // let el = this.selection.select(row);
    this.selection.toggle()
    let selectedForm = column.forms[i];
    let selectedFormId = selectedForm.formId
    let selectedId = selectedForm.curriculum
    // console.log("boom! " + selectedId)
    this.router.navigate(['tangy-forms-player'], { queryParams: { formId: selectedId } });
  }

  private renderGrid() {
    let allStudentResults:StudentResult = [];
    // re-init the formColumns and columnsToDisplay
    this.formColumns = [];
    this.columnsToDisplay = ["Name"];

    for (const form of this.curriculumForms) {
      this.formColumns.push(form.title)
      this.columnsToDisplay.push(form.title);
    }
    for (const student of this.students) {
      let studentResults = {};
      studentResults["id"] = student.id
      studentResults["name"] = student.doc.items[0].inputs[0].value
      studentResults["forms"] = [];
      for (const form of this.curriculumForms) {
        let formResult = {};
        formResult["formId"] = form.id
        formResult["curriculum"] = this.curriculum
        formResult["src"] = form.src
        formResult["results"] = [];
        studentResults["forms"].push(formResult)
      }
      allStudentResults.push(studentResults)
    }
    this.allStudentResults = allStudentResults;
    this.dataSource = new MatTableDataSource<StudentResult>(allStudentResults);

  }

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
        this.currentClassId = this.classes[0].id;
        this.students = await this.getMyStudents(this.currentClassId);
        let inputs = [];
        this.classes[0].doc.items.forEach(item => inputs = [...inputs, ...item.inputs])
        let input = inputs.find(input => (input.name === 'curriculum') ? true : false)
        if (input) {
          this.curriculum = input.value;
          //todo: persist curricula in memory and find curriculum.name.
          this.curriculumForms = await this.getCurriculaForms(this.curriculum)
        }
        this.renderGrid();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async populateFormList() {
    try {
      this.formList = await this.dashboardService.getFormList();
      console.log("this.formList")
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



}
