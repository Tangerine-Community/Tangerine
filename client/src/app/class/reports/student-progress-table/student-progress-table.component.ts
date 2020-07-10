import { UserService } from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ClassFormService} from '../../_services/class-form.service';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DashboardService} from '../../_services/dashboard.service';
import {ClassUtils} from '../../class-utils';
import {AppConfigService} from '../../../shared/_services/app-config.service';

export interface ClassProgressReport {
  id: string;
  subtestName: string;
  classSize: number;
  studentsAssessed: number;
  aveCorrectPerc: number;
  aveCorrect: number;
  attempted: number;
  duration: number;
}

@Component({
  selector: 'app-student-progress-table',
  templateUrl: './student-progress-table.component.html',
  styleUrls: ['./student-progress-table.component.css']
})
export class StudentProgressTableComponent implements OnInit {

  classUtils: ClassUtils;
  curriculumFormsList;
  students: any;
  studentCategorizedResults: any;
  categories: any;
  totals: any;
  curriculums: any;
  subtestReports: any;
  classProgressReport: ClassProgressReport = {
    id: null,
    subtestName: null,
    classSize: null,
    studentsAssessed: null,
    aveCorrectPerc: null,
    aveCorrect: null,
    attempted: null,
    duration: null
  };

  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private userService: UserService,
    private classFormService: ClassFormService
  ) { }

  async ngOnInit() {
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.classUtils = new ClassUtils();
    }
    const classId = this.route.snapshot.paramMap.get('classId');
    this.students = (await this.getMyStudents(classId)).sort((a, b) => a.student_name.localeCompare(b.student_name));
  }

  onStudentSelect(event) {
    if (event.value && event.value !== 'none') {
      this.getReport(event.value);
    }
  }

  async getReport(studentId) {

    const tangyFormItem = this.route.snapshot.paramMap.get('type');
    const classId = this.route.snapshot.paramMap.get('classId');
    const curriculumId = this.route.snapshot.paramMap.get('curriculumId');
    const classDoc = await this.classFormService.getResponse(classId);

    // Get data about this particular subtest
    const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);

    const subtest = curriculumFormsList.filter(obj => {
      return obj.id === tangyFormItem;
    });
    this.classProgressReport.subtestName = subtest[0].title;

    const studentResponses = await this.classFormService.getResponsesByStudentId(studentId);
    // now feed into transform
    const transformedStudentResponses = this.dashboardService.transformResultSet(studentResponses, curriculumFormsList, null);
    // @ts-ignore
    for (const result of transformedStudentResponses) {
      const formTitle = result.formTitle;
      const studentId = result.studentId;
      let category = result.category;
      if (category === '') {
        category = 'Unassigned Category';
      }
      // let score = parseInt(result.score).toString()
      const percentCorrect = result.totalGridPercentageCorrect;
      const score = result.totalGridCorrect;
    }
  }

  generateArray(obj) {
    return Object.keys(obj).map((key) => ({key: key, value: obj[key]}));
  }

  isEmpty(obj) {
    const stringy = JSON.stringify(obj);
    if (Object.keys(obj).length === 0) {
      return true;
    } else {
      return false;
    }
  }

  async getMyStudents(classId: any) {
    const observations = [];
    try {
      // find which class is selected
      const studentResults = await this.dashboardService.getMyStudents(classId);
      for (const result of studentResults) {
        const student = {};
        result.doc['items'][0].inputs.forEach(item => {
          // inputs = [...inputs, ...item.value]
          if (item.value !== '') {
            student[item.name] = item.value;
            // if (item.name === curriculumFormsList[i]['id'] + "_score") {
            //   score = item.value
            // }
          }
        });
        student['id'] = result.doc['_id'];
        observations.push(student);
      }
    } catch (error) {
      console.error(error);
    }
    return observations;
  }

  async getResultsByClass(selectedClass: any, curriculum, curriculumFormsList) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, curriculumFormsList, null);
    } catch (error) {
      console.error(error);
    }
  }

}
