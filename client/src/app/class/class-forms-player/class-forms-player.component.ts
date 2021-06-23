import {AfterContentInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../shared/_services/user.service';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from '../../shared/_services/app-config.service';
import {ClassFormService} from '../_services/class-form.service';
import {ClassUtils} from '../class-utils.js';
import {DashboardService} from '../_services/dashboard.service';
import {_TRANSLATE} from '../../shared/translation-marker';
import {VariableService} from "../../shared/_services/variable.service";

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds));

@Component({
  selector: 'app-class-forms-player',
  templateUrl: './class-forms-player.component.html',
  styleUrls: ['./class-forms-player.component.css']
})
export class ClassFormsPlayerComponent implements AfterContentInit {

  throttledSaveLoaded;
  throttledSaveFiring;
  responseId;
  curriculum;
  studentId;
  formId;
  classId;
  classUtils: ClassUtils;
  viewRecord = false;
  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService,
    private classFormService: ClassFormService,
    private variableService: VariableService
  ) { }

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
      let formResponse;
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // This is either a new subtest or from a stale dashboard, so check using the curriculum and student id
          const responses = await this.classFormService.getResponsesByStudentId(this.studentId);
          for (const response of responses as any[] ) {
            const resp = this.getInputValues(response.doc);
            const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
            const respCurrId = response.doc.form.id;
            if (respClassId === this.classId && respCurrId === this.curriculum) {
              formResponse = response.doc;
            }
          }
        } else {
          formResponse = await this.classFormService.getResponse(this.responseId);
        }
      }

      // enable the requested subform to be viewed
      const container = this.container.nativeElement;
      const formHtml = await this.http.get('./assets/' + this.curriculum + '/form.html', {responseType: 'text'}).toPromise();
      const curriculumFormsList = await this.classUtils.createCurriculumFormsList(formHtml);
      container.innerHTML = formHtml;
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

      const formEl = container.querySelector('tangy-form');
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        formEl.response = formResponse;
        if (this.viewRecord) {
          formEl.enableItemReadOnly();
          formEl.hideItemButtons();
        }
      } else {
        // formEl.store.dispatch({ type: 'FORM_OPEN', response: {} })
        formEl.newResponse();
      }

      formEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        const response = formEl.response;
        if (!formResponse) {
          if (response.form.id !== 'student-registration' && response.form.id !== 'class-registration') {
            const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
            const srValues = this.getInputValues(studentRegistrationDoc);
            srValues['id'] = this.studentId;
            response.metadata = {'studentRegistrationDoc': srValues};
          }
        }
        this.throttledSaveResponse(response);
        // Reset vars and set to this new class-registration
        if (response.form.id === 'class-registration' && !formResponse) {
          await this.variableService.set('class-classIndex', null);
          await this.variableService.set('class-currentClassId', null);
          await this.variableService.set('class-curriculumId', null);
          await this.variableService.set('class-currentItemId', null);
          const classes = await this.dashboardService.getMyClasses();
          const enabledClasses = classes.map(klass => {
            if (!klass.doc.archive) {
              return klass
            }
          });
          const allEnabledClasses = enabledClasses.filter(item => item).sort((a, b) => (a.doc.tangerineModifiedOn > b.doc.tangerineModifiedOn) ? 1 : -1)
          // set classIndex to allEnabledClasses.length
          const classIndex = allEnabledClasses.length - 1
          const currentClass = allEnabledClasses[classIndex]
          const currentClassId = currentClass.id
          await this.variableService.set('class-classIndex', classIndex);
          await this.variableService.set('class-currentClassId', currentClassId);
        }
        this.router.navigate(['dashboard']);
      });
    });
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) { return; }
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true;
      while (this.throttledSaveFiring) { await sleep(200); }
      this.throttledSaveLoaded = false;
    }
    // Fire it.
    this.throttledSaveFiring = true;
    await this.saveResponse(response);
    this.throttledSaveFiring = false;
  }

  async saveResponse(state) {
    state.items = state.items.map(item => {
      return Object.assign({}, item, {open: false});
    });
    let stateDoc = {};
    try {
      stateDoc = await this.classFormService.getResponse(state._id);
    } catch (e) {
      const r = await this.classFormService.saveResponse(state);
      stateDoc = await this.classFormService.getResponse(state._id);
    }

    const newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] });
    const lastModified = Date.now();
    newStateDoc['lastModified'] = lastModified;
    newStateDoc.items = newStateDoc.items.map(item => {
      return item;
    });
    await this.classFormService.saveResponse(newStateDoc);
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
