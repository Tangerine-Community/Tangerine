import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tangerine-forms-demo',
  templateUrl: './tangerine-forms-demo.component.html',
  styleUrls: ['./tangerine-forms-demo.component.css']
})
export class TangerineFormsDemoComponent implements OnInit {

  tangerineFormSession = {
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
              status: 'UNSEEN',
              fields: [{
                className: 'row',
                fieldGroup: [
                  {
                    type: 'input',
                    key: 'variable1',
                    templateOptions: {
                      label: 'Variable 1',
                      type: 'text',
                    }
                  }
                ]
              }],
              model: {
                'variable1': '',
              }
            },
            {
              status: 'UNSEEN',
              fields: [
                {
                  type: 'input',
                  key: 'variable2',
                  templateOptions: {
                    label: 'Variable 2',
                    type: 'text',
                    required: true
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

  constructor() { }

  ngOnInit() {
  }
}
