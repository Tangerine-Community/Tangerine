import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TangyFormService} from "../../tangy-forms/tangy-form-service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../core/auth/_services/user.service";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "../../shared/_services/app-config.service";
import {DashboardService} from "../_services/dashboard.service";
import {ClassFormService} from "../_services/class-form.service";
import {ClassUtils} from "../class-utils.js";

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-class-forms-player',
  templateUrl: './class-forms-player.component.html',
  styleUrls: ['./class-forms-player.component.css']
})
export class ClassFormsPlayerComponent implements AfterContentInit {

  service: ClassFormService;
  throttledSaveLoaded;
  throttledSaveFiring;
  responseId;
  curriculum;
  studentId;
  formId;
  classId;
  classUtils: ClassUtils;
  @ViewChild('container') container: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) { }

  async ngAfterContentInit() {
    this.route.queryParams.subscribe(async params => {
      this.classUtils = new ClassUtils();
      this.responseId = params['responseId'];
      this.formId = params['formId'];
      this.classId = params['classId'];
      this.curriculum = params['curriculum'];
      this.studentId = params['studentId'];
      if (typeof this.formId === 'undefined') {
        // this is student reg or class reg.
        this.formId = this.curriculum
      }
      const appConfig = await this.appConfigService.getAppConfig();
      const userDbName = await this.userService.getUserDatabase();
      const classFormService = new ClassFormService({databaseName: userDbName});
      this.service = classFormService
      let formResponse;
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // might have come from a stale dashboard, so check using the curriculum and student id
          const responses = await classFormService.getResponsesByStudentId(this.studentId);
          for (const response of responses as any[] ) {
            const resp = this.getInputValues(response.doc)
            if (resp['classId'] === this.classId) {
              formResponse = response.doc
            }
          }
        } else {
          formResponse = await classFormService.getResponse(this.responseId);
        }
      }

      // enable the requested subform to be viewed
      const container = this.container.nativeElement
      let formHtml = await this.http.get('./assets/'+ this.curriculum + '/form.html', {responseType: 'text'}).toPromise();
      let curriculumFormsList = await this.classUtils.createCurriculumFormsList(formHtml, container);
      container.innerHTML = formHtml
      // let formItems = container.querySelectorAll('tangy-form-item')
      let itemsToDisable = []
      // disable all tangy-form-items except for the one you want to view.
      for(const el of curriculumFormsList) {
        if (el['id'] !== this.formId) {
          itemsToDisable.push(el['id'])
          container.querySelector('#' + el['id']).disabled = true
        }
      }
      if (typeof formResponse !== 'undefined') {
        formResponse.items = formResponse.items.map(item => {
          if (itemsToDisable.indexOf(item.id) !== -1) {
            return Object.assign({}, item, {disabled: true})
          }
          else {
            return Object.assign({}, item, {disabled: false})
          }
        })
      }

      let formEl = container.querySelector('tangy-form')
      // Put a response in the store by issuing the FORM_OPEN action.
      if (formResponse) {
        // formEl.store.dispatch({ type: 'FORM_OPEN', response: formResponse })
        formEl.response = formResponse
      } else {
        // formEl.store.dispatch({ type: 'FORM_OPEN', response: {} })
        formEl.newResponse()
      }

      formEl.addEventListener('submit', async (event) => {
        event.preventDefault()
        let response = formEl.response;
        if (!formResponse) {
          if (response.form.id !== "student-registration" && response.form.id !== "class-registration") {
            const studentRegistrationDoc = await classFormService.getResponse(this.studentId);
            const srValues = this.getInputValues(studentRegistrationDoc);
            srValues['id'] = this.studentId;
            response.metadata = {"studentRegistrationDoc":srValues}
          }
        }
        this.throttledSaveResponse(response)
        this.router.navigate(['dashboard']);
      })
    });
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
    state.items = state.items.map(item => {
      return Object.assign({}, item, {open: false})
    })
    let stateDoc = {}
    try {
      stateDoc = await this.service.getResponse(state._id)
    } catch (e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }

    let newStateDoc = Object.assign({}, state, { _rev: stateDoc['_rev'] })
    newStateDoc.items = newStateDoc.items.map(item => {
      if (item.disabled === false) {
        let lastModified = Date.now()
        // get the metadata field
        if (typeof item.metadata !== 'undefined') {
          item.metadata.lastModified = lastModified
        } else {
          let metadata = {};
          metadata['lastModified'] = lastModified
          item.metadata = metadata
        }
        return item
      } else {
        return item
      }
      // if (itemsToDisable.indexOf(item.id) !== -1) {
      //   return Object.assign({}, item, {disabled: true})
      // }
      // else {
      //   return Object.assign({}, item, {disabled: false})
      // }
    })
    await this.service.saveResponse(newStateDoc)
  }

  getInputValues(doc) {
    let inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], [])
    let obj = {}
    for (const el of inputs) {
      var attrs = inputs.attributes;
      for(let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    return obj;
  }

}
