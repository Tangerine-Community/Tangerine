import {AfterContentInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../shared/_services/user.service';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from '../../shared/_services/app-config.service';
import {ClassFormService} from '../_services/class-form.service';
import {ClassUtils} from '../class-utils.js';
import {DashboardService} from '../_services/dashboard.service';
import {_TRANSLATE} from '../../shared/translation-marker';
import {VariableService} from "../../shared/_services/variable.service";
import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";
import {Subject} from "rxjs";
import {FormInfo, FormTemplate} from "../../tangy-forms/classes/form-info.class";
import {TangyFormsInfoService} from "../../tangy-forms/tangy-forms-info-service";
import {TangyFormService} from "../../tangy-forms/tangy-form.service";
import {environment} from "../../../environments/environment";

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds));

@Component({
  selector: 'app-class-forms-player',
  templateUrl: './class-forms-player.component.html',
  styleUrls: ['./class-forms-player.component.css']
})
export class ClassFormsPlayerComponent implements AfterContentInit {

  // Use one of three to do different things.
  // 1. Use this to have the component load the response for you. 
  @Input('formResponseId') formResponseId:string
  // 2. Use this if you want to attach the form response yourself.
  @Input('response') response:TangyFormResponseModel
  // 3. Use this is you want a new form response.
  @Input('formId') formId:string

  @Input('templateId') templateId:string
  @Input('location') location:any
  @Input('skipSaving') skipSaving = false
  @Input('preventSubmit') preventSubmit = false
  @Input('metadata') metadata:any

  $rendered = new Subject()
  $submit = new Subject()
  $afterSubmit = new Subject()
  $resubmit = new Subject()
  $afterResubmit = new Subject()
  $saved = new Subject()
  rendered = false

  formInfo:FormInfo
  formTemplatesInContext:Array<FormTemplate>
  formEl:any

  throttledSaveLoaded;
  throttledSaveFiring;

  window:any;
  
  responseId;
  curriculum;
  studentId;
  classId;
  classUtils: ClassUtils;
  viewRecord = false;
  formHtml;
  formResponse;
  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService,
    private classFormService: ClassFormService,
    private variableService: VariableService,
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService: TangyFormService,
  ) {
    this.window = window
  }

  isDirty() {
    if (this.formEl) {
      const state = this.formEl.store.getState()
      const isDirty = state.items.some((acc, item) => item.isDirty)
      return isDirty
    } else {
      return true
    }
  }

  isComplete() {
    if (this.formEl) {
      return this.formEl.store.getState().form.complete
    } else {
      return true
    }
  }

  unlock() {
    this.formEl.unlock()
  }

  async render() {
    // Get form ingredients.
    // Already have this.formResponse
   const formResponse = this.formResponse
    this.formId = this.formId
      ? this.formId
      : formResponse['form']['id']
    this.formInfo = await this.tangyFormsInfoService.getFormInfo(this.formId)
    // this.formTemplatesInContext = this.formInfo.templates ? this.formInfo.templates.filter(template => template.appContext === environment.appContext) : []
    if (this.templateId) {
      let  templateMarkup =  await this.tangyFormsInfoService.getFormTemplateMarkup(this.formId, this.templateId)
      eval(`this.container.nativeElement.innerHTML = \`${templateMarkup}\``)
    } else {
      // CEKelley: removed formVersion code - not using it for Class
      // let  formHtml =  await this.tangyFormService.getFormMarkup(this.formId, formVersionId)
      // Put the form on the screen.
      const container = this.container.nativeElement
      container.innerHTML = this.formHtml

      const curriculumFormsList = await this.classUtils.createCurriculumFormsList(this.formHtml);
      // container.innerHTML = this.formHtml;
      // let formItems = container.querySelectorAll('tangy-form-item')
      const itemsToDisable = [];
      // disable all tangy-form-items except for the one you want to view.
      for (const el of curriculumFormsList) {
        if (el['id'] !== this.formId) {
          itemsToDisable.push(el['id']);
          container.querySelector('#' + el['id']).disabled = true;
        }
      }
      if (typeof formResponse !== 'undefined') {
        formResponse.items = formResponse.items.map(item => {
          if (itemsToDisable.includes(item.id)) {
            return Object.assign({}, item, {disabled: true});
          } else {
            return Object.assign({}, item, {disabled: false});
          }
        });
      }
      
      let formEl = container.querySelector('tangy-form')
      this.formEl = formEl;
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        formEl.response = formResponse
      } else {
        formEl.newResponse()
        this.formResponseId = formEl.response._id
        formEl.response.formVersionId = this.formInfo.formVersionId
        this.throttledSaveResponse(formEl.response)
      }
      this.response = formEl.response
      // Listen up, save in the db.
      if (!this.skipSaving && !this.response.complete) {
        formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
          let response = _.target.store.getState()
          this.throttledSaveResponse(response)
        })
      }
      formEl.addEventListener('submit', (event) => {
        if (this.preventSubmit) event.preventDefault()
        this.$submit.next(true)
      })
      formEl.addEventListener('after-submit', async (event) => {
        if (this.preventSubmit) event.preventDefault()
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$afterSubmit.next(true)
      })
      formEl.addEventListener('resubmit', async (event) => {
        if (this.preventSubmit) event.preventDefault()
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$resubmit.next(true)
      })
      formEl.addEventListener('after-resubmit', async (event) => {
        if (this.preventSubmit) event.preventDefault()
        while (this.throttledSaveFiring === true) {
          await sleep(1000)
        }
        this.$afterResubmit.next(true)
      })
    }
    this.$rendered.next(true)
    this.rendered = true
  }

  setTemplate(templateId) {
    this.templateId = templateId
    this.render()
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) { return; }
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
    let stateDoc = {};
    // state.items = state.items.map(item => {
    //   return Object.assign({}, item, {open: false});
    // });

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
        _rev: stateDoc['_rev'],
        location: this.location || state.location,
        ...this.metadata
      })
    }
    this.response = state
    this.$saved.next(state)
  }

  async ngAfterContentInit() {
    await this.classFormService.initialize();
    this.route.queryParams.subscribe(async params => {
      this.classUtils = new ClassUtils();
      this.responseId = params['responseId'];
      this.formId = params['formId'];
      this.classId = params['classId'];
      this.curriculum = params['curriculum'];
      this.studentId = params['studentId'];
      this.viewRecord = params['viewRecord'];
      if (typeof this.formId === 'undefined') {
        // this is student reg or class reg.
        this.formId = this.curriculum;
      }
      const appConfig = await this.appConfigService.getAppConfig();
      const userDbName = await this.userService.getUserDatabase();
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // This is either a new subtest or from a stale dashboard, so check using the curriculum and student id
          const responses = await this.classFormService.getResponsesByStudentId(this.studentId);
          for (const response of responses as any[] ) {
            const resp = this.getInputValues(response.doc);
            const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
            const respCurrId = response.doc.form.id;
            if (respClassId === this.classId && respCurrId === this.curriculum) {
              this.formResponse = response.doc;
            }
          }
        } else {
          this.formResponse = await this.classFormService.getResponse(this.responseId);
        }
      }

      // enable the requested subform to be viewed
      const container = this.container.nativeElement;
      this.formHtml = await this.http.get('./assets/' + this.curriculum + '/form.html', {responseType: 'text'}).toPromise();
      // const curriculumFormsList = await this.classUtils.createCurriculumFormsList(this.formHtml);
      // // container.innerHTML = this.formHtml;
      // // let formItems = container.querySelectorAll('tangy-form-item')
      // const itemsToDisable = [];
      // // disable all tangy-form-items except for the one you want to view.
      // for (const el of curriculumFormsList) {
      //   if (el['id'] !== this.formId) {
      //     itemsToDisable.push(el['id']);
      //     container.querySelector('#' + el['id']).disabled = true;
      //   }
      // }
      // if (typeof formResponse !== 'undefined') {
      //   formResponse.items = formResponse.items.map(item => {
      //     if (itemsToDisable.includes(item.id)) {
      //       return Object.assign({}, item, {disabled: true});
      //     } else {
      //       return Object.assign({}, item, {disabled: false});
      //     }
      //   });
      // }

      // const formEl = container.querySelector('tangy-form');
      // // Put a response in the store by issuing the FORM_OPEN action.
      // if (formResponse) {
      //   formEl.response = formResponse;
      //   if (this.viewRecord) {
      //     formEl.enableItemReadOnly();
      //     formEl.hideItemButtons();
      //   }
      // } else {
      //   // formEl.store.dispatch({ type: 'FORM_OPEN', response: {} })
      //   formEl.newResponse();
      // }
      //
      // formEl.addEventListener('submit', async (event) => {
      //   event.preventDefault();
      //   const response = formEl.response;
      //   if (!formResponse) {
      //     if (response.form.id !== 'student-registration' && response.form.id !== 'class-registration') {
      //       const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
      //       const srValues = this.getInputValues(studentRegistrationDoc);
      //       srValues['id'] = this.studentId;
      //       response.metadata = {'studentRegistrationDoc': srValues};
      //     }
      //   }
      //   this.throttledSaveResponse(response);
      //   // Reset vars and set to this new class-registration
      //   if (response.form.id === 'class-registration' && !formResponse) {
      //     await this.variableService.set('class-classIndex', null);
      //     await this.variableService.set('class-currentClassId', null);
      //     await this.variableService.set('class-curriculumId', null);
      //     await this.variableService.set('class-currentItemId', null);
      //     const classes = await this.dashboardService.getMyClasses();
      //     const enabledClasses = classes.map(klass => {
      //       if (!klass.doc.archive) {
      //         return klass
      //       }
      //     });
      //     const allEnabledClasses = enabledClasses.filter(item => item).sort((a, b) => (a.doc.tangerineModifiedOn > b.doc.tangerineModifiedOn) ? 1 : -1)
      //     // set classIndex to allEnabledClasses.length
      //     const classIndex = allEnabledClasses.length - 1
      //     const currentClass = allEnabledClasses[classIndex]
      //     const currentClassId = currentClass.id
      //     await this.variableService.set('class-classIndex', classIndex);
      //     await this.variableService.set('class-currentClassId', currentClassId);
      //   }
      //   this.router.navigate(['dashboard']);
      // });
      this.setTemplate('')
    });
  }



  getInputValues(doc) {
    const inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], []);
    const obj = {};
    for (const el of inputs) {
      const attrs = inputs.attributes;
      for (let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    return obj;
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
    const container = this.container.nativeElement;
    const formEl = container.querySelector('tangy-form');
    formEl.disableItemReadOnly();
  }

}
