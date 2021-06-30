import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TangyFormsPlayerComponent} from "../../tangy-forms/tangy-forms-player/tangy-forms-player.component";
import {ClassUtils} from "../class-utils";
import {TangyFormResponseModel} from "tangy-form/tangy-form-response-model";
import {DashboardService} from "../_services/dashboard.service";
import {ClassFormService} from "../_services/class-form.service";
import {TangyFormService} from "../../tangy-forms/tangy-form.service";
import {Subject} from "rxjs";
import {VariableService} from "../../shared/_services/variable.service";
import {_TRANSLATE} from "../../shared/translation-marker";
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
  @ViewChild('formPlayer', {static: true}) formPlayer: TangyFormsPlayerComponent
  responseId;
  curriculum;
  studentId;
  classId;
  classUtils: ClassUtils;
  viewRecord = false;
  formHtml;
  formResponse;

  throttledSaveLoaded;
  throttledSaveFiring;

  constructor(
    private route: ActivatedRoute,
    private hostElementRef: ElementRef,
    private router: Router,
    private dashboardService: DashboardService,
    private classFormService: ClassFormService,
    private tangyFormService: TangyFormService,
    private variableService: VariableService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.classFormService.initialize();
    this.classUtils = new ClassUtils();
    setTimeout(() => this.hostElementRef.nativeElement.classList.add('hide-spinner'), 3000)
    this.route.queryParams.subscribe(async params => {
      this.responseId = params['responseId'];
      this.formId = params['formId']; // corresponds to the form_item.id
      this.classId = params['classId'];
      this.curriculum = params['curriculum']; // corresponds to form.id
      this.studentId = params['studentId'];
      this.viewRecord = params['viewRecord'];
      if (typeof this.formId === 'undefined') {
        // this is student reg or class reg.
        this.formId = this.curriculum;
      }
      const formHtml = await this.tangyFormService.getFormMarkup(this.curriculum)
      if (typeof this.studentId !== 'undefined') {
        if (typeof this.responseId === 'undefined') {
          // This is either a new subtest or from a stale dashboard, so check using the curriculum and student id
          const responses = await this.classFormService.getResponsesByStudentId(this.studentId);
          for (const response of responses as any[]) {
            // const resp = this.getInputValues(response.doc);
            const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
            const respCurrId = response.doc.form.id;
            if (respClassId === this.classId && respCurrId === this.curriculum) {
              this.formResponse = response.doc;
            }
          }
        } else {
          this.formResponse = await this.classFormService.getResponse(this.responseId);
        }
        if (typeof this.formResponse !== 'undefined') {
        //   let formItems = []
        //   this.formResponse.items = this.formResponse.items.forEach(item => {
        //     if (itemsToDisable.includes(item.id)) {
        //       // return Object.assign({}, item, {disabled: true});
        //     } else {
        //       // return Object.assign({}, item, {disabled: false});
        //       const formItem = Object.assign({}, item, {disabled: false});
        //       formItems.push(formItem)
        //     }
        //   });
        //   this.formResponse.items = formItems
        //   this.formResponse.complete = false
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
        this.formPlayer.formId = this.formId
      }
      await this.formPlayer.render()
      

      this.formPlayer.formEl.addEventListener('TANGY_FORM_UPDATE', async (event) => {
        let state = event.target.store.getState()
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
            // console.log("Why is this.formResponse.items null?")
          }
        }
        {
          if (state.form.id !== 'student-registration' && state.form.id !== 'class-registration') {
            const studentRegistrationDoc = await this.classFormService.getResponse(this.studentId);
            const srValues = this.getInputValues(studentRegistrationDoc);
            srValues['id'] = this.studentId;
            state.metadata = {'studentRegistrationDoc': srValues};
          }
        }
        await this.throttledSaveResponse(state)
        // Reset vars and set to this new class-registration
        if (state.form.id === 'class-registration' && !this.formResponse) {
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
      })

      // this.formPlayer.$submit.subscribe(async () => {
      //   setTimeout(async () => {
      //     this.router.navigate([`../`], { relativeTo: this.route })
      //   }, 500)
      // })
      
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
        _rev: stateDoc['_rev'],
        location: this.formPlayer.location || state.location,
        ...this.formPlayer.metadata
      })
    }
    this.response = state
    this.$saved.next(state)
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
    const container = this.formPlayer.container.nativeElement;
    const formEl = container.querySelector('tangy-form');
    formEl.disableItemReadOnly();
  }

}
