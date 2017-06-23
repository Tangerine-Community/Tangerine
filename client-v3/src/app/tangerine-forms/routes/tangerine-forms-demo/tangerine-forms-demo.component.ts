import { Component, OnInit } from '@angular/core';
import { safeLoad } from 'js-yaml';

@Component({
  selector: 'app-tangerine-forms-demo',
  templateUrl: './tangerine-forms-demo.component.html',
  styleUrls: ['./tangerine-forms-demo.component.css']
})
export class TangerineFormsDemoComponent implements OnInit {

  _basicForm = safeLoad(`

    id: 'tangerineFormSessionId1'
    formId: 'form1'
    sectionIndex: 0
    pageIndex: 0
    markedDone: false
    isOnLastPage: false
    model: 
      variable1: ''
      variable2: ''
    sections: 
      - status: 'UNSEEN'
        path: '/a'
        pages: 
          - status: 'UNSEEN'
            fields: 
                - type: 'input'
                  key: 'variable1'
                  templateOptions: 
                    label: 'Variable 1'
                    type: 'text'
                - type: 'input'
                  key: 'variable2'
                  templateOptions: 
                    label: 'Variable 2'
                    type: 'text'
          - status: 'UNSEEN'
            fields: 
                - type: 'input'
                  key: 'variable3'
                  templateOptions: 
                    label: 'Variable 3'
                    type: 'text'
                - type: 'input'
                  key: 'variable4'
                  templateOptions: 
                    label: 'Variable 4'
                    type: 'text'

  `);

  _advancedForm = safeLoad(`

    id: 'tangerineFormSessionId1'
    formId: 'form1'
    pageIndex: 0
    markedDone: false
    model: 
    pages:
      - status: 'UNSEEN'
        section: '/Cat Survey/'
        skip: ''
        fields: 
          - type: 'radio'
            key: 'cat_survey_confirmation'
            templateOptions: 
              label: 'Would you like to answer a survey about cats?'
              options: 
                - key: 'yes'
                  value: 'yes'
                - key: 'no'
                  value: 'no'
      - status: 'UNSEEN'
        skip: 'if(model.cat_survey_confirmation === "no") skip = true'
        section: '/Cat Survey/'
        fields: 
          - type: 'radio'
            key: 'cat_hair_preference'
            templateOptions: 
              label: 'Do you prefer short haired or fluffy cats?'
              options: 
                - key: 'fluffy'
                  value: 'fluffy'
                - key: 'short'
                  value: 'short'
      - status: 'UNSEEN'
        skip: ''
        section: '/Conclusion/'
        fields: 
          - type: 'radio'
            key: 'thank_you'
            templateOptions: 
              label: 'Thank you for taking our survey.'
              options: 
  `);

  tangerineFormSession: any;

  constructor() { }

  ngOnInit() {
    this.tangerineFormSession = this._advancedForm;
  }
}
