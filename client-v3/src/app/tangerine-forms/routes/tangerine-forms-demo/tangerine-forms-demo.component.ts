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
            model: 
              'variable1': ''
              'variable2': ''
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
            model: 
              'variable1': ''
              'variable2': ''
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
            model: 
              'variable1': ''
              'variable2': ''
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
            model: 
              'variable1': ''
              'variable2': ''
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
      - status: 'UNSEEN'
        path: '/b'
        pages: 
          - status: 'UNSEEN'
            model: 
              'variable1': ''
              'variable2': ''
            fields: 
                - type: 'input'
                  key: 'variable5'
                  templateOptions: 
                    label: 'Variable 5'
                    type: 'text'
                - type: 'input'
                  key: 'variable6'
                  templateOptions: 
                    label: 'Variable 6'
                    type: 'text'
          - status: 'UNSEEN'
            model: 
              'variable1': ''
              'variable2': ''
            fields: 
                - type: 'input'
                  key: 'variable7'
                  templateOptions: 
                    label: 'Variable 7'
                    type: 'text'
                - type: 'input'
                  key: 'variable8'
                  templateOptions: 
                    label: 'Variable 8'
                    type: 'text'                    

  `);

  tangerineFormSession: any;

  constructor() { }

  ngOnInit() {
    this.tangerineFormSession = this._advancedForm;
  }
}
