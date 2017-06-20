import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tangerine-forms-demo',
  templateUrl: './tangerine-forms-demo.component.html',
  styleUrls: ['./tangerine-forms-demo.component.css']
})
export class TangerineFormsDemoComponent implements OnInit {

  tangerineFormSession: any;

  constructor() { }

  ngOnInit() {
    this.tangerineFormSession = {
      id: 'tangerineFormSessionId1',
      formId: 'form1',
      sectionIndex: 0,
      pageIndex: 0,
      markedDone: false,
      sections: [
        {
          status: 'UNSEEN',
          path: '/a',
          pages: [
            {
              status: 'VALID',
              fields: [
                {
                  required: true,
                  key: 'variable1',
                  templateConfig: {
                    type: 'text'
                  }
                }
              ],
              model: {
                'variable1': '',
              }
            },
            {
              status: 'VALID',
              fields: [
                {
                  required: true,
                  key: 'variable2',
                  templateConfig: {
                    type: 'text'
                  }
                }
              ],
              model: {
                'variable2': ''
              }
            }
          ]
        }
      ]
    };
  }
}
