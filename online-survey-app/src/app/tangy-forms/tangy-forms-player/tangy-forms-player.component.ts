import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/shared/_services/forms-service.service';
import { CaseService } from 'src/app/case/services/case.service';
import { TangyFormService } from '../tangy-form.service';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;

  formId: string;
  formResponseId: string;
  caseId: string;
  caseEventId: string;
  eventFormId: string;
  window: any;
  
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
    const groupId = window.location.pathname.split('/')[4]; 
    this.tangyFormService.initialize(groupId);

    this.window = window;

    // Loading the formResponse must happen before rendering the innerHTML
    let formResponse;
    if (this.caseId && this.caseEventId && this.eventFormId) {
      try {
        await this.caseService.load(this.caseId);
        this.caseService.setContext(this.caseEventId, this.eventFormId)

        this.window.T = {
          case: this.caseService,
          tangyForms: this.tangyFormService
        }
        this.window.caseService = this.caseService

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

    tangyForm.addEventListener('after-submit', async (event) => {
      event.preventDefault();
      const formResponse = event.target.response;
      try {
        if (!await this.formsService.uploadFormResponse(formResponse)) {
          alert('Form could not be submitted. Please retry');
          return;
        }
      } catch (error) {
        console.error(error);
      }

      if (this.caseId && this.caseEventId && this.eventFormId) {
        try {
          const caseEvent = this.caseService.case.events.find(event => event.id === this.caseEventId);
          if (caseEvent.id) {
            const eventForm = caseEvent.eventForms.find(eventForm => eventForm.id === this.eventFormId);
              if (eventForm && eventForm.id === this.eventFormId) {
                eventForm.formResponseId = formResponse._id
                eventForm.complete = true
                await this.caseService.save();
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
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
  }
}
