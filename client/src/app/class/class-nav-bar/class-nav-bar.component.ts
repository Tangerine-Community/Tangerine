import {Component, OnInit} from '@angular/core';
import {TangyFormResponse} from "../../tangy-forms/tangy-form-response.class";
import {DashboardService} from "../_services/dashboard.service";
import {ClassUtils} from '../class-utils';
import {VariableService} from "../../shared/_services/variable.service";
import {StudentResult} from "../dashboard/dashboard.component";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {AppConfigService} from "../../shared/_services/app-config.service";
import { AppInfo, DeviceService } from 'src/app/device/services/device.service';

@Component({
  selector: 'app-class-nav-bar',
  templateUrl: './class-nav-bar.component.html',
  styleUrls: ['./class-nav-bar.component.css']
})
export class ClassNavBarComponent implements OnInit {
  formList = [];
  selectedClass: any
  selectedClassSubscription: Subscription;
  studentRegistrationFormId = 'student-registration';
  classRegistrationParams = {
    formId: 'class-registration'
  };
  
  window: any;
  classUtils: ClassUtils = new ClassUtils();
  currentClassIndex
  currArray
  allStudentResults: StudentResult[];
  getValue: (variableName, response) => any;
  getCurriculumObject: (variableName, response) => any;
  enabledClasses = [];
  enabledClassesSubscription: Subscription;
  curriculums = {}
  integrateWithOriginalDashboard: boolean = false;
  useAttendanceFeature: boolean = false;
  linkToDashboardUrl: boolean = false;
  classTitle: string;
  deviceInfo: AppInfo;
  curriculumInputValues: any[]; // array of curriculum input values
  
  constructor(
    private dashboardService: DashboardService,
    private appConfigService: AppConfigService,
    private deviceService: DeviceService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.window = window;
    const appConfig = await this.appConfigService.getAppConfig()
    this.deviceInfo = await this.deviceService.getAppInfo()
    this.useAttendanceFeature = appConfig.teachProperties?.useAttendanceFeature
    const homeUrl = appConfig.homeUrl
    if (homeUrl === 'dashboard') {
      // Enables display of 'Dashboard' button in menu to link to homeUrl 'dashboard'.
      this.linkToDashboardUrl = true;
    }
    this.selectedClassSubscription = this.dashboardService.selectedClass$.subscribe((selectedClass) => {
      this.selectedClass = selectedClass
      this.classTitle = this.getClassTitle(selectedClass)
      const curriculumInputValues = selectedClass.items[0].inputs.filter(input => input.name === 'curriculum')[0].value;
      this.curriculumInputValues = curriculumInputValues;
      })
    this.getValue = this.dashboardService.getValue
    this.getCurriculumObject = this.dashboardService.getCurriculumObject
    this.enabledClassesSubscription = this.dashboardService.enabledClasses$.subscribe(async (enabledClasses) => {
      this.enabledClasses = enabledClasses
      for (const enabledClass of this.enabledClasses) {
        const ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', enabledClass.doc)
        if (ignoreCurriculumsForTracking) {
          enabledClass['ignoreCurriculumsForTracking'] = true
        }
        // await this.dashboardService.populateCurrentCurriculums(enabledClass.doc);
      }
    })
  }

  getClassTitle(classResponse: TangyFormResponse) {
    const gradeInput = classResponse?.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput?.value
  }

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.enabledClassesSubscription) {
      this.enabledClassesSubscription.unsubscribe();
    }
    if (this.selectedClassSubscription) {
      this.selectedClassSubscription.unsubscribe();
    }
  }

}
