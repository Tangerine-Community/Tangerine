import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/shared/_services/forms-service.service';
import { CaseService } from 'src/app/case/services/case.service';
import { TangyFormService } from '../tangy-form.service';

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  @Input('response') response;

  @Input('templateId') templateId:string
  @Input('location') location:any
  @Input('skipSaving') skipSaving = false
  @Input('preventSubmit') preventSubmit = false
  @Input('metadata') metadata:any

  formId: string;
  formResponseId: string;
  caseId: string;
  caseEventId: string;
  eventFormId: string;
  window: any;

  throttledSaveLoaded
  throttledSaveFiring
  
  constructor(
    private route: ActivatedRoute, 
    private formsService: FormsService, 
    private router: Router, 
    private httpClient:HttpClient,
    private caseService: CaseService,
    private tangyFormService: TangyFormService
  ) { 
    this.router.events.subscribe(async (event) => {
        this.formId = this.route.snapshot.paramMap.get('formId');
        this.formResponseId = this.route.snapshot.paramMap.get('formResponseId');
        this.caseId = this.route.snapshot.paramMap.get('case');
        this.caseEventId = this.route.snapshot.paramMap.get('event');
        this.eventFormId = this.route.snapshot.paramMap.get('form');
    });
  }

  async ngOnInit(): Promise<any> {
    this.window = window;

    // Loading the formResponse from a case must happen before rendering the innerHTML
    let formResponse;
    if (this.caseId && this.caseEventId && this.eventFormId) {
      // Store the caseUrlHash in localStorage so that we can redirect to the correct page after logout -> login
      localStorage.setItem('caseUrlHash', `/case/event/form/${this.caseId}/${this.caseEventId}/${this.eventFormId}`);

      try {
        const groupId = window.location.pathname.split('/')[4];
        this.tangyFormService.initialize(groupId);

        await this.caseService.load(this.caseId);
        this.caseService.setContext(this.caseEventId, this.eventFormId)

        this.window.T = {
          case: this.caseService,
          tangyForms: this.tangyFormService
        }
        this.window.caseService = this.caseService

        this.metadata = {
          caseId: this.caseId,
          caseEventId: this.caseEventId,
          eventFormId: this.eventFormId
        }

        try {
          // Attempt to load the form response for the event form
          const event = this.caseService.case.events.find(event => event.id === this.caseEventId);
          if (event.id) {
            const eventForm = event.eventForms.find(eventForm => eventForm.id === this.eventFormId);
              if (eventForm && eventForm.id === this.eventFormId && eventForm.formResponseId) {
                formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId);
            }
          }
        } catch (error) {
          //pass
        }

      } catch (error) {
        console.log('Error loading case: ' + error)
      }
    }

    const data = await this.httpClient.get('./assets/form/form.html', {responseType: 'text'}).toPromise();
    this.container.nativeElement.innerHTML = data;
    let tangyForm = this.container.nativeElement.querySelector('tangy-form');

    if (formResponse) {
      tangyForm.response = formResponse;
    }

    if (this.caseService) {
      tangyForm.addEventListener('TANGY_FORM_UPDATE', async (event) => {
        let response = event.target.store.getState()
        this.throttledSaveResponse(response)
  
        if (this.caseService.eventForm && !this.caseService.eventForm.formResponseId) {
          this.caseService.eventForm.formResponseId = tangyForm.response._id;
          await this.caseService.save();
          await this.caseService.load(this.caseId);
        }
      })

      tangyForm.addEventListener('after-submit', async (event) => {
        event.preventDefault();

        let response = event.target.store.getState()
        await this.throttledSaveResponse(response)

        if (this.caseService && this.caseService.caseEvent && this.caseService.eventForm) {
          this.caseService.markEventFormComplete(this.caseService.caseEvent.id, this.caseService.eventForm.id)
          await this.caseService.save()
        }
        
        // first route to form-submitted, then redirect to the url in window['eventFormRedirect']
        this.router.navigate(['/form-submitted-success']);
        if (window['eventFormRedirect']) {
          try {
            // this.router.navigateByUrl(window['eventFormRedirect']) -- TODO figure this out later
            this.window['location'] = window['eventFormRedirect']
            window['eventFormRedirect'] = ''
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      tangyForm.addEventListener('after-submit', async (event) => {
        event.preventDefault();
        try {
          if (await this.formsService.uploadFormResponse(event.target.response)){
            this.router.navigate(['/form-submitted-success']);
          } else {
            alert('Form could not be submitted. Please retry');
          }
        } catch (error) {
          console.error(error);
        }
      });
    }
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
    let stateDoc = await this.tangyFormService.getResponse(state._id)
    const archiveStateChange = state.archived === stateDoc['archived']
    if (stateDoc && stateDoc['complete'] && state.complete && stateDoc['form'] && !stateDoc['form'].hasSummary && archiveStateChange) {
      // Since what is in the database is complete, and it's still complete, and it doesn't have 
      // a summary where they might add some input, don't save! They are probably reviewing data.
    } else {
      // add metadata
      stateDoc = {
        ...state,
        location: this.location || state.location,
        ...this.metadata
      }   
      await this.tangyFormService.saveResponse(stateDoc)
    }
    this.response = state
  }

  async saveFormResponse(formResponse) {

    try {
      if (!await this.formsService.uploadFormResponse(formResponse)) {
        alert('Form could not be saved. Please retry');
        return false;
      }
    } catch (error) {
      console.error(error);
    }
  }

}
