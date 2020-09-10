import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formMarkup;
  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) { }

  async ngOnInit(): Promise<any> {
    const forms = await this.httpClient.get('./assets/forms.json').toPromise();
    const data = await this.httpClient.get(forms[0].src, {responseType: 'text'}).toPromise();
    this.formMarkup = this.sanitizer.bypassSecurityTrustHtml(data);
  }

}
