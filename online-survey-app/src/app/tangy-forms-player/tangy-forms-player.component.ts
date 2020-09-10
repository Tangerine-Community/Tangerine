import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormsServiceService } from '../shared/_services/forms-service.service';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formMarkup;
  constructor(private router: ActivatedRoute, private sanitizer: DomSanitizer, private formsService: FormsServiceService) { }

  async ngOnInit(): Promise<any> {
    const formId = this.router.snapshot.paramMap.get('formId');
    const data = await this.formsService.getFormMarkUpById(formId);
    this.formMarkup = this.sanitizer.bypassSecurityTrustHtml(data);
  }
}
