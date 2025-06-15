import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/shared/_services/forms-service.service';
import { CaseService } from 'src/app/case/services/case.service';
import { TangyFormService } from '../tangy-form.service';
import { XapiService } from 'src/app/case/services/xapi.service';
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
  startTime!: Date;
  formSubmitted: boolean = false;
  lang = localStorage.getItem('tangerine-language') || 'en';
   

  throttledSaveLoaded
  throttledSaveFiring
  
  constructor(
    private route: ActivatedRoute, 
    private formsService: FormsService,
    private xapiService: XapiService,
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

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.formSubmitted && this.startTime) {
      const endTime = new Date();
      const duration = this.msToISO8601Duration(endTime.getTime() - this.startTime.getTime());
      const statement = {
        actor: {
          name: "John Doe",
          mbox: "mailto:john.doe@example.com",
          objectType: "Agent"
        },
        verb: {
          id: "http://adlnet.gov/expapi/verbs/attempted",
          display: { lang: "attempted" }
        },
        object: {
          id: `http://example.com/forms/${this.formId}`,
          objectType: "Activity",
          definition: {
            name: { lang: "Tangy Survey Form Response" },
            description: { lang: "Survey Form Assessment" }
          }
        },
        result: {
          completion: false,
          success: false,
          duration: duration,
          response: "Form was started but not submitted",
        },
        timestamp: endTime.toISOString()
      };

      this.xapiService.sendStatement(statement).then(() => {
        console.log('xAPI statement sent successfully');
      }).catch((error) => {
        console.error('Error sending xAPI statement:', error);
      });
    }
  }


  msToISO8601Duration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `PT${hours > 0 ? hours + 'H' : ''}${minutes > 0 ? minutes + 'M' : ''}${seconds > 0 ? seconds + 'S' : ''}`;
  }

 extractTangyResponseForXAPI(tangyResponse: any) {
  const responses: any = {};  
  tangyResponse.items.forEach((item: any) => {
    item.inputs.forEach((input: any) => {
      if (input.value) {
        if (Array.isArray(input.value)) {
          if (input.value.length > 0 && typeof input.value[0] === 'object') {
            const extractedValues = input.value
              .filter((obj: any) => obj.value && obj.value.toString().trim() !== '')
              .map((obj: any) => ({
                name: obj.name,
                value: obj.value
              }));
            
            if (extractedValues.length > 0) {
              responses[input.name] = extractedValues;
            }
          } 
          else {
            const filteredArray = input.value.filter((val: any) => 
              val !== null && val !== undefined && val.toString().trim() !== ''
            );
            
            if (filteredArray.length > 0) {
              responses[input.name] = filteredArray;
            }
          }
        } 
        else if (input.value.toString().trim() !== '') {
          responses[input.name] = input.value;
        }
      }
    });
  });
  return responses;
}

  async send(response:any) {
    const endTime = new Date();
    const duration = this.msToISO8601Duration(endTime.getTime() - this.startTime.getTime());
    const tangyResult = this.extractTangyResponseForXAPI(response);
    const result = {
      response: "Form submitted successfully",
      duration: duration,
      completion: this.formSubmitted,
      extensions: {
        "https://tangerine.lrs.io/xapi/survey-response": tangyResult
      }
    }
    const statement = this.xapiService.buildXapiStatementFromForm(result, {name: "John Doe", email:"john.doe@example.com"}, response.formId,
  response.collection,
  'Tangy Forms Submission');
    await this.xapiService.sendStatement(statement);
  }

  async ngOnInit(): Promise<any> {
    this.startTime = new Date();
    this.formSubmitted = false;  
    this.window = window;

    // Loading the formResponse from a case must happen before rendering the innerHTML
    let formResponse;
    if (this.caseId && this.caseEventId && this.eventFormId) {
      // Store the caseUrlHash in sessionStorage so that we can redirect to the correct page after logout -> login
      sessionStorage.setItem('caseUrlHash', `/case/event/form/${this.caseId}/${this.caseEventId}/${this.eventFormId}`);

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
        let response = event.target.store.getState();
        const res:any = {};
        this.formSubmitted = true;
        res.formId = response._id;
        res.collection = response.collection;
        res.items = response.items.map((item) => {
          return {
            inputs: item.inputs.map((input) => {
              return {
                name: input.name,
                label: input.label,
                value: input.value
              }
            })
          }
        });
        await this.send(res);
        await this.saveResponse(response)
        if (this.caseService && this.caseService.caseEvent && this.caseService.eventForm) {
          this.caseService.markEventFormComplete(this.caseService.caseEvent.id, this.caseService.eventForm.id)
          await this.caseService.save()
        }
        if (window['eventFormRedirect']) {
          try {
            // this.router.navigateByUrl(window['eventFormRedirect']) -- TODO figure this out later
            this.window['location'] = window['eventFormRedirect']
            window['eventFormRedirect'] = ''
          } catch (error) {
            console.error(error);
          }
        } else {
          this.router.navigate(['/form-submitted-success']);
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
      this.response = stateDoc
    } else {
      // add metadata
      stateDoc = {
        ...state,
        location: this.location || state.location,
        ...this.metadata
      }
      const updatedStateDoc = await this.tangyFormService.saveResponse(stateDoc)
      if (updatedStateDoc) {
        this.response = updatedStateDoc
        return true;
      }
    }
    return false;
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
