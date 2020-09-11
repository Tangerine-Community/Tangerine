import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsServiceService } from '../shared/_services/forms-service.service';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  constructor(private router: ActivatedRoute, private formsService: FormsServiceService) { }

  async ngOnInit(): Promise<any> {
    const formId = this.router.snapshot.paramMap.get('formId');
    const data = await this.formsService.getFormMarkUpById(formId);
    this.container.nativeElement.innerHTML = data;
    const tangyForm = this.container.nativeElement.querySelector('tangy-form');
    tangyForm.addEventListener('submit', async event => {
      event.preventDefault();
      try {
        await this.formsService.uploadFormResponse(event.target.response);
      } catch (error) {
        console.error(error);
      }
    });
  }
}
