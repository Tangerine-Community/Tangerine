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
    this.tangyFormService.initialize(window.location.pathname.split('/')[4]);
    this.window = window;
    this.window.T = {
      case: this.caseService,
      tangyForms: this.tangyFormService
    }

    let formResponse;
    if (this.caseId) {
      try {
        await this.caseService.load(this.caseId);
      } catch (error) {
        console.log('Error loading case: ' + error)
      }

      if (this.eventFormId) {
        try {
          // Attempt to load the form response for the event form
          const eventForm = await this.formsService.getEventFormData(this.eventFormId);
          if (eventForm && eventForm.formResponseId) {
            formResponse = await this.formsService.getFormResponse(eventForm.formResponseId);
          }
        } catch (error) {
          //pass
        }
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
      try {
        if (this.eventFormId) {
          if (await this.formsService.uploadFormResponseForCase(event.target.response, this.eventFormId)) {
            this.router.navigate(['/form-submitted-success']);
          } else {
            alert('Form could not be submitted. Please retry');
          }
        } else {
          if (await this.formsService.uploadFormResponse(event.target.response)) {
            this.router.navigate(['/form-submitted-success']);
          } else {
            alert('Form could not be submitted. Please retry');
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}
