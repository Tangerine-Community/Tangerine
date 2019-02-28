import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WindowRef } from '../../window-ref.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('form') form: ElementRef;
  translations:any
  window:any
  languageCode = 'en'
  constructor(
    private windowRef: WindowRef,
    private http: HttpClient
  ) { 
    this.languageCode = localStorage.getItem('languageCode')
    this.window = this.windowRef.nativeWindow;
  }

  async ngOnInit() {
    this.translations = await this.http.get('./assets/translations.json').toPromise();
    this.form.nativeElement.addEventListener('submit', (event) => {
      event.preventDefault()
      localStorage.setItem('languageCode', event.target.querySelector('[name=translation]').value)
      this.window.location.reload()
    })
  }

}
