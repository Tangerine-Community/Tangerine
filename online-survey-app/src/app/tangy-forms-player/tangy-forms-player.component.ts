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
  caseEventFormId: string;
  
  constructor(private route: ActivatedRoute, private formsService: FormsService, private router: Router, private httpClient:HttpClient
  ) { 
    this.router.events.subscribe(async (event) => {
        this.formId = this.route.snapshot.paramMap.get('formId');
        this.formResponseId = this.route.snapshot.paramMap.get('formResponseId');
        this.caseEventFormId = this.route.snapshot.paramMap.get('caseEventFormId');
    });
  }

  async ngOnInit(): Promise<any> {
    const data = await this.httpClient.get('./assets/form/form.html', {responseType: 'text'}).toPromise();
    this.container.nativeElement.innerHTML = data;
    let tangyForm = this.container.nativeElement.querySelector('tangy-form');

    if (this.caseEventFormId) {
      try {
        const eventForm = await this.formsService.getEventFormData(this.caseEventFormId);
        if (eventForm && eventForm.formResponseId) {
          tangyForm.response = await this.formsService.getFormResponse(eventForm.formResponseId);
        }
      } catch (error) {
        //pass
      }
    }

    tangyForm.addEventListener('after-submit', async (event) => {
      event.preventDefault();
      try {
        if (this.caseEventFormId) {
          if (await this.formsService.uploadFormResponseForCase(event.target.response, this.caseEventFormId)) {
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
