import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from '../shared/_services/forms-service.service';

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
  
  constructor(private route: ActivatedRoute, private formsService: FormsService, private router: Router, private httpClient:HttpClient
  ) { 
    this.router.events.subscribe(async (event) => {
        this.formId = this.route.snapshot.paramMap.get('formId');
        this.formResponseId = this.route.snapshot.paramMap.get('formResponseId');
        this.caseId = this.route.snapshot.paramMap.get('caseId');
        this.caseEventId = this.route.snapshot.paramMap.get('caseEventId');
        this.eventFormId = this.route.snapshot.paramMap.get('eventFormId');
    });
  }

  async ngOnInit(): Promise<any> {
    const data = await this.httpClient.get('./assets/form/form.html', {responseType: 'text'}).toPromise();
    this.container.nativeElement.innerHTML = data;
    let tangyForm = this.container.nativeElement.querySelector('tangy-form');

    if (this.caseId) {
      try {
        const caseDoc = await this.formsService.getFormResponse(this.caseId);
        if (caseDoc) {
          let inputs = caseDoc.items[0].inputs;
          if (inputs.length > 0) {
            window.localStorage.setItem('caseVariables', JSON.stringify(inputs));
          }
        }
      } catch (error) {
        console.log('Error loading case variables: ' + error)
      }

      if (this.eventFormId) {
        try {
          // Attempt to load the form response for the event form
          const eventForm = await this.formsService.getEventFormData(this.eventFormId);
          if (eventForm && eventForm.formResponseId) {
            tangyForm.response = await this.formsService.getFormResponse(eventForm.formResponseId);
          }
        } catch (error) {
          //pass
        }
      }
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
