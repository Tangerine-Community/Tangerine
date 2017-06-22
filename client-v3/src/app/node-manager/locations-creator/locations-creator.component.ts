import {Component, Input, OnInit} from '@angular/core';

import { Validators, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from 'ng-formly';
import { DataService } from './../../core/data-service.service';
// import {TangerinePageConfig} from "../../tangerine-forms/tangerine-page/tangerine-page-config";
import {NodeValue} from "../node-value";
import {NodeResult} from "../node-result";


@Component({
  selector: 'app-locations-creator',
  templateUrl: './locations-creator.component.html',
  styleUrls: ['./locations-creator.component.css'],
  providers: [DataService],
})
export class LocationsCreatorComponent implements OnInit {

  // IO.
  @Input() model:NodeValue;
  @Input() result: NodeResult;

  nodes = [];
  // form: FormGroup = new FormGroup({});
  // userFields: FormlyFieldConfig;
  constructor(private dataService: DataService) { }

  // tangerineFormSession = [{
  //   className: 'row',
  //   fieldGroup: [{
  //     key: 'name',
  //     type: 'input',
  //     templateOptions: {
  //       type: 'text',
  //       label: 'Name'
  //     },
  //     validators: {
  //       validation: Validators.compose([Validators.required])
  //     }
  //   },{
  //     key: '_id',
  //     type: 'input',
  //     templateOptions: {
  //       type: 'hidden',
  //     },
  //     validators: {
  //       validation: Validators.compose([Validators.required])
  //     }
  //   }]
  // }];

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
                  key: 'name',
                  templateOptions: {
                    label: 'Name',
                    type: 'text',
                  }
                }
              ]
            }],
            model: {
              'name': '',
            }
          }
        ]
      }
    ]
  };

  ngOnInit() {
      if (!this.result) {
        this.result = new NodeResult();
      }
    this.getNodes();
  }

  getNodes(): void {
    this.dataService.getParentNodes().then((data) => {
      data.map(i => {
        this.nodes.push({
          nodeName: i.doc.nodeName,
          parentID: i.doc.parent,
        });
      });
    });
  }
  clickNode(node): void {
    console.log(node.nodeName);
    // this.userFields = [{
    //   className: 'row',
    //   fieldGroup: [{
    //     className: 'col-xs-6',
    //     key: 'email',
    //     type: 'input',
    //     templateOptions: {
    //       type: 'email',
    //       label: 'Email address',
    //       placeholder: 'Enter email'
    //     },
    //     validators: {
    //       validation: Validators.compose([Validators.required])
    //     }
    //   }, {
    //     className: 'col-xs-6',
    //     key: 'password',
    //     type: 'input',
    //     templateOptions: {
    //       type: 'password',
    //       label: 'Password',
    //       placeholder: 'Password',
    //       pattern: ''
    //     },
    //     validators: {
    //       validation: Validators.compose([Validators.required])
    //     }
    //   }]
    // }];
  }

  onUpdate(datum) {
    // debugger
    console.log("datum: " + JSON.stringify(datum))
    // let name = groupModel.variables["name"]
    // this.groupModel = groupModel.variables;
    Object.assign(this.result.variables, datum.variables);
    console.log("this.result.variables: " + JSON.stringify(this.result.variables))
  }

  save(datum) {
    console.log("Saving to pouch - this.result.variables: " + JSON.stringify(this.result.variables))
    this.dataService.createNode(this.result.variables);
    // this.jsonFormSubmit.emit(this.form.value);
  }
}
