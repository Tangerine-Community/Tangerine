import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ClassUtils} from "../class-utils";
import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";
import {DashboardService} from "../_services/dashboard.service";
import {ClassFormService} from "../_services/class-form.service";
import {TangyFormService} from "../../tangy-forms/tangy-form.service";
import {Subject} from "rxjs";
import {VariableService} from "../../shared/_services/variable.service";
import {_TRANSLATE} from "../../shared/translation-marker";
import {ClassFormsPlayerComponent} from "../class-forms-player.component";
import {AppConfigService} from "../../shared/_services/app-config.service";

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-class-form',
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css']
})
export class ClassFormComponent implements OnInit {

  formResponseId:string
  response:TangyFormResponseModel
  formId:string
  
  $saved = new Subject()
  
  @ViewChild('buildContainer', {static: true}) buildContainer: ElementRef;
  @ViewChild('container', {static: true}) container: ElementRef;
  @ViewChild('formPlayer', {static: true}) formPlayer: ClassFormsPlayerComponent
  responseId;
  curriculum;
  curriculumLabel: string;
  studentId;
  classId;
  classUtils: ClassUtils;
  viewRecord = false;
  formHtml;
  formResponse;
  reportDate: string;
  throttledSaveLoaded;
  throttledSaveFiring;
  
  hasEventFormRedirect = false
  eventFormRedirectUrl = ''
  eventFormRedirectBackButtonText = ''
  
  newForm = false;
  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private dashboardService: DashboardService,
    private classFormService: ClassFormService,
    private tangyFormService: TangyFormService,
    private variableService: VariableService,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.classFormService.initialize();
    this.classUtils = new ClassUtils();
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 3000)
    
    this.hasEventFormRedirect = window['eventFormRedirect'] ? true : false
    this.eventFormRedirectUrl = window['eventFormRedirect']
    
    this.route.queryParams.subscribe(async params => {
      this.responseId = params['responseId'];
      this.formId = params['formId']; // corresponds to the form_item.id
      this.classId = params['classId'];
      this.curriculum = params['curriculum']; // corresponds to form.id
      this.curriculumLabel = params['curriculumLabel']; // corresponds to form.id
      this.studentId = params['studentId'];
      this.viewRecord = params['viewRecord'];
      this.reportDate = params['reportDate'];
      this.newForm = params['newForm'];
      if (typeof this.formId === 'undefined') {
        // this is student reg or class reg.
        this.formId = this.curriculum;
      }
      const formHtml = await this.tangyFormService.getFormMarkup(this.curriculum)
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // work-around for attendance records, which differ from usual class records.
          // Only the selectCheckbox function in class-forms-player.component.ts sets this param.
          if (!this.newForm) {
            // This is either a new subtest or from a stale dashboard, so check using the curriculum and student id
            const responses = await this.classFormService.getResponsesByStudentId(this.studentId);
            for (const response of responses as any[]) {
              const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
              const respCurrId = response.doc.form.id;
              if (respClassId === this.classId && respCurrId === this.curriculum) {
                this.formResponse = response.doc;
              }
            }
          }
        } else {
          this.formResponse = await this.classFormService.getResponse(this.responseId);
        }
        if (typeof this.formResponse !== 'undefined') {
          this.formResponse.form.complete = false
        }
        this.formPlayer.response = this.formResponse
        // const buildContainer = this.buildContainer.nativeElement
        let templateEl = document.createElement('template');
        templateEl.innerHTML = formHtml
        const buildContainer = templateEl.content
        const curriculumFormsList = await this.classUtils.createCurriculumFormsList(formHtml);
        const itemsToDisable = [];
        // disable all tangy-form-items except for the one you want to view.
        for (const el of curriculumFormsList) {
          if (el['id'] !== this.formId) {
            itemsToDisable.push(el['id']);
            buildContainer.querySelector('#' + el['id']).remove()
          }
        }
        // const container = this.container.nativeElement
        // container.innerHTML = buildContainer.innerHTML
        this.formPlayer.formHtml = templateEl.innerHTML
      } else {
        // For new student-registration etc.
        this.formPlayer.formHtml = formHtml
      }
      await this.formPlayer.render()

      // this.formPlayer.formEl.addEventListener('TANGY_FORM_UPDATE', async (event) => {
      this.formPlayer.$afterSubmit.subscribe(async (state:any) => {
        state.complete = false
        if (typeof this.formResponse !== 'undefined') {
          // let formItems = []
          if (this.formResponse.items) {
            this.formResponse.items = this.formResponse.items.forEach(item => {
              if (item.id !== this.formId) {
                state.items.push(item)
              }
            });
          } else {
            // this.formResponse.items may be null because this is a new response that formerly had no items.
            // This can happen when a user views a form but does not enter anything.
          }
        }
        if (state.form.id === 'class-registration') {
          if (typeof state.metadata?.randomId === 'undefined') {
            if (typeof state.metadata === 'undefined') {
              state.metadata = {};
            }
            state.metadata['randomId'] = this.classUtils.makeId(6);
          }
        }
        if (state.form.id !== 'student-registration' && state.form.id !== 'class-registration') {
          const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
          const srValues = this.classUtils.getInputValues(studentRegistrationDoc);
          srValues['id'] = this.studentId;
          state.metadata = {'studentRegistrationDoc': srValues};
        }
        await this.throttledSaveResponse(state)
        // Reset vars and set to this new class-registration
        if (state.form.id === 'class-registration' && !this.formResponse) {
          await this.dashboardService.setCurrentClass();
        }
        
        if (state.form.id === 'form-internal-behaviour' && !this.formResponse) {
          // Look up today's behaviour scores form and add this score to it
          let currentBehaviorReport, savedBehaviorList = null;
          try {
            const type = "behavior"
            const enabledClasses = await this.dashboardService.getEnabledClasses();
            let classClassIndex = await this.variableService.get('class-classIndex')
            const classIndex = parseInt(classClassIndex)
            const currentClass = this.dashboardService.getSelectedClass(enabledClasses, classIndex)
            // const reportDate = DateTime.local().toISODate()
            // const formInfo = await this.tangyFormsInfoService.getFormInfo(this.curriculum)
            // const curriculumLabel = formInfo.title
            const ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)
            let curriculumLabel = this.curriculumLabel
            if (ignoreCurriculumsForTracking) {
              curriculumLabel = null
            }
            const randomId = currentClass.metadata?.randomId
            const docArray = await this.dashboardService.searchDocs(type, currentClass, this.reportDate, curriculumLabel, randomId)
            currentBehaviorReport = docArray? docArray[0]?.doc : null
            // savedBehaviorList = currentBehaviorReport?.studentBehaviorList
            const currentStudent = currentBehaviorReport.studentBehaviorList.find((thisStudent) => {
              return thisStudent.id === this.studentId
            })
            if (currentStudent) {
              currentStudent['behavior'] = {}
              const usingScorefield = state.items[0].inputs.find(input => input.name === state['form']['id'] + '_score');
              const intScore = usingScorefield.value
              currentStudent['behavior']['formResponseId'] = state._id
              currentStudent['behavior']['internal'] = intScore
              currentStudent['behavior']['internalPercentage'] = Math.round((intScore / 36) * 100)
              await this.dashboardService.saveDoc(currentBehaviorReport)
            }
          } catch (e) {
          }
        }
        const appConfig = await this.appConfigService.getAppConfig()
        const url = appConfig.homeUrl
        
        if (window['eventFormRedirect']) {
          // await this.router.navigate(['case', 'event', this.caseService.case._id, this.caseEvent.id])
          this.router.navigateByUrl(window['eventFormRedirect'])
          window['eventFormRedirect'] = ''
        } else {
          this.router.navigate([url]);
        }
      })
    })
  }
  
  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) return
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while (this.throttledSaveFiring) await sleep(200)
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse(response)
    this.throttledSaveFiring = false
  }
  
  async saveResponse(state) {
    let stateDoc = {}
    stateDoc = await this.tangyFormService.getResponse(state._id)
    if (stateDoc && stateDoc['complete'] && state.complete && stateDoc['form'] && !stateDoc['form'].hasSummary) {
      // Since what is in the database is complete, and it's still complete, and it doesn't have 
      // a summary where they might add some input, don't save! They are probably reviewing data.
    } else {
      if (!stateDoc) {
        let r = await this.tangyFormService.saveResponse(state)
        stateDoc = await this.tangyFormService.getResponse(state._id)
      }
      await this.tangyFormService.saveResponse({
        ...state,
        _rev: stateDoc['_rev']
      })
    }
    this.response = state
    this.$saved.next(state)
  }

  async archiveStudent(studentId) {
    // let studentId = studentId
    console.log('Archiving student:' + studentId);
    const deleteConfirmed = confirm(_TRANSLATE('Delete this student?'));
    if (deleteConfirmed) {
      try {
        const responses = await this.classFormService.getResponsesByStudentId(studentId);
        for (const response of responses as any[] ) {
          response.doc.archive = true;
          const lastModified = Date.now();
          response.doc.lastModified = lastModified;
          const archiveResult = await this.classFormService.saveResponse(response.doc);
          console.log('archiveResult: ' + archiveResult);
        }
        const result = await this.dashboardService.archiveDoc(studentId);
      } catch (e) {
        console.log('Error deleting student: ' + e);
        return false;
      }
    }
  }

  enableEditing(studentId, classId, event) {
    const container = this.formPlayer.container.nativeElement;
    const formEl = container.querySelector('tangy-form');
    formEl.disableItemReadOnly();
  }

}
