import { Component, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyFormService } from '../tangy-form-service';
import { _TRANSLATE } from '../../shared/translation-marker';
import { WindowRef } from '../../core/window-ref.service';
import { UserService } from '../../core/auth/_services/user.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  service: TangyFormService;
  formId;
  formEl;
  @ViewChild('container') container: ElementRef;

  constructor() { }

  ngOnInit() {
  }

}
