import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsServiceService } from '../shared/_services/forms-service.service';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(private route: ActivatedRoute, private formsService: FormsServiceService, private router: Router,
    private httpClient:HttpClient
  ) { }

  async ngOnInit(): Promise<any> {
    const formId = this.route.snapshot.paramMap.get('formId');
    const data = await this.httpClient.get('./assets/form/form.html', {responseType: 'text'}).toPromise();
    this.container.nativeElement.innerHTML = data;
    const tangyForm = this.container.nativeElement.querySelector('tangy-form');
    tangyForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        if (await this.formsService.uploadFormResponse(event.target.response, formId)){
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
