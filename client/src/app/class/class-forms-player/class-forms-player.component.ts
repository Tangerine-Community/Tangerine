import {AfterContentInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../shared/_services/user.service';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from '../../shared/_services/app-config.service';
import {ClassFormService} from '../_services/class-form.service';
import {ClassUtils} from '../class-utils.js';
import {DashboardService} from '../_services/dashboard.service';
import {_TRANSLATE} from '../../shared/translation-marker';
import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";

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
  curriculumFormsList: any[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService,
    private classFormService: ClassFormService
  ) { }

  async ngAfterContentInit() {

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
      // const appConfig = await this.appConfigService.getAppConfig();
      // const userDbName = await this.userService.getUserDatabase();
      let formResponse;
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // This is either a new subtest or from a stale dashboard, so check using the curriculum and student id
          const responses = await this.classFormService.getResponsesByStudentId(this.studentId);
          for (const response of responses as any[] ) {
            // const resp = this.getInputValues(response.doc);
            const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
            const respCurrId = response.doc.form.id;
            if (respClassId === this.classId && respCurrId === this.curriculum) {
              formResponse = new TangyFormResponseModel(response.doc);
            }
          }
        } else {
          formResponse = new TangyFormResponseModel(await this.classFormService.getResponse(this.responseId));
        }
      }

      // enable the requested subform to be viewed
      const container = this.container.nativeElement;
      const formHtml = await this.http.get('./assets/' + this.curriculum + '/form.html', {responseType: 'text'}).toPromise();
      this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(formHtml);
      container.innerHTML = formHtml;
      // let formItems = container.querySelectorAll('tangy-form-item')
      
      const formEl = container.querySelector('tangy-form');
      
      // add next events
      formEl.querySelectorAll('tangy-form-item').forEach((el) => {
        // if (el['id'] !== this.formId) {
        //   // container.querySelector('#' + el['id']).disabled = true;
        //   // el.setAttribute('disabled', true)
        //   return Object.assign({}, el, {disabled: true});
        // } else {
        //   return Object.assign({}, el, {disabled: false});
        // }
      })

      // formEl.addEventListener('FORM_RESPONSE_COMPLETE', async (event) => {
      //   await this.saveClassResponse(event, formEl, formResponse);
      // })

      formEl.addEventListener('ITEM_NEXT', async (event) => {
        await this.saveClassResponse(event, formEl, formResponse);
      })
      
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        let updatedItems = this.updateFormItems(formEl, formResponse);
        formResponse.items = updatedItems
        this.disableFormItems(formResponse);
        formEl.response = formResponse;
        if (this.viewRecord) {
          formEl.enableItemReadOnly();
          formEl.hideItemButtons();
        }
      } else {
        // formEl.store.dispatch({ type: 'FORM_OPEN', response: {} })
        formEl.newResponse();
        const response = formEl.response;
        this.disableFormItems(response);
      }

      // formEl.addEventListener('submit', async (event) => {
      //   // event.preventDefault() - this prevents locking of form
      //   event.preventDefault(); 
      //   const response = formEl.response;
      //   if (!formResponse) {
      //     if (response.form.id !== 'student-registration' && response.form.id !== 'class-registration') {
      //       const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
      //       const srValues = this.getInputValues(studentRegistrationDoc);
      //       srValues['id'] = this.studentId;
      //       response.metadata = {'studentRegistrationDoc': srValues};
      //     }
      //   // } else {
      //   //   let updatedItems = this.updateFormItems(formEl, formResponse);
      //   //   response.items = updatedItems
      //   }
      //   this.throttledSaveResponse(response);
      //   this.router.navigate(['dashboard']);
      // });
    });
  }
  
  async saveClassResponse(event, formEl, formResponse) {
    // event.preventDefault() - this prevents locking of form
    event.preventDefault();
    const response = formEl.response;
    // TODO: check that all form-items are complete.
    // TODO can we use unlock() somehow to unlock incomplete form-items?
    // try formEl.unlock()
    if (!formResponse) {
      if (response.form.id !== 'student-registration' && response.form.id !== 'class-registration') {
        const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
        const srValues = this.getInputValues(studentRegistrationDoc);
        srValues['id'] = this.studentId;
        response.metadata = {'studentRegistrationDoc': srValues};
      }
      // } else {
      //   let updatedItems = this.updateFormItems(formEl, formResponse);
      //   response.items = updatedItems
    }
    // loop through response and unset the iputs disabled property
    // props.inputs = response.items.inputs.map(input => {
    //   if (input.tagName === 'TANGY-TIMED') {
    //     return Object.assign({}, input, {disabled: true, mode: 'TANGY_TIMED_MODE_DISABLED'})
    //   } else if (input.tagName === 'TANGY-UNTIMED-GRID') {
    //     return Object.assign({}, input, {disabled: true, mode: 'TANGY_UNTIMED_GRID_MODE_DISABLED'})
    //   } else {
    //     return Object.assign({}, input, {disabled: true})
    //   }
    // })
    await this.throttledSaveResponse(response);
    await this.router.navigate(['dashboard']);
  }

  private  disableFormItems(response) {
    response.items = response.items.map(item => {
      // Filter out empty inputs.
      const modifiedInputs = item.inputs.filter(input => {
        if (input) {
          return input
        }
      })
      item.inputs = modifiedInputs
      const itemsToDisable = [];
      // disable all tangy-form-items except for the one you want to view.
      for (const el of this.curriculumFormsList) {
        if (el['id'] !== this.formId) {
          itemsToDisable.push(el['id']);
          // container.querySelector('#' + el['id']).disabled = true;
        }
      }
      // if (itemsToDisable.includes(item.id)) {
      //   return Object.assign({}, item, {disabled: true});
      // } else {
      //   return Object.assign({}, item, {disabled: false});
      // }
    });
  }

  /**
   * Compare current items in formResponse with potentially updated items in formHtml
   * @param formEl
   * @param formResponse
   * @private
   */
  private updateFormItems(formEl, formResponse) {
    let formItems = []
    // const tangyFormItems = formEl.querySelectorAll('tangy-form-item')
    for (let formItem of this.curriculumFormsList) {
      // formItems.push(formItem.getProps())
      formItems.push(formItem)
    }
    // updatedItems only contains updated items. No support for re-named items.
    let updatedItems = []
    for (let formItem of formItems) {
      let foundResponseItem
      if (formResponse) {
        foundResponseItem = formResponse.items.find(responseItem => {
          if (responseItem.id === formItem.id) {
            return responseItem
          }
        })
      }
      if (foundResponseItem) {
        // copy all responseItem inputs to the formItem's inputs
        // First copy all foundResponseItem.inputs whose id's match formItem.inputs
        const foundResponseInputs = foundResponseItem.inputs
        // const formItemInputs = formItem.inputs
        const formItemInputs = formItem.children
        const combinedInputs = formItemInputs.map((formInput) => {
          const foundResponseInput = foundResponseInputs.find(responseInput => responseInput.name === formInput.name)
          if (foundResponseInput) {
            return foundResponseInput
          } else {
            return formInput
          }
        });
        // Next, add any foundResponseItem.inputs that are missing from combinedInputs
        let missingInputs = []
        formItemInputs.forEach((formInput) => {
          const foundFormItemInput = combinedInputs.find(combinedInput => combinedInput.name === formInput.name)
          if (!foundFormItemInput) {
            missingInputs.push(formInput) 
          }
        });
        const mergedInputs = [...combinedInputs, ...missingInputs]
        foundResponseItem.inputs = mergedInputs
        updatedItems.push(foundResponseItem)
      } else {
        updatedItems.push(formItem)
      }
    }
    return updatedItems;
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
    //unset any complete flag
    // TODO: Make sure that there is at least one incomplete form-item.
    delete(newStateDoc.complete)
    await this.classFormService.saveResponse(newStateDoc);
  }

  getInputValues(doc) {
    const inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], []);
    const obj = {};
    for (const el of inputs) {
      for (let i = inputs.length - 1; i >= 0; i--) {
        if (typeof inputs[i] !== 'undefined') {
          obj[inputs[i].name] = inputs[i].value;
        }
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
        const result = await this.dashboardService.archiveStudentRegistration(studentId);
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
