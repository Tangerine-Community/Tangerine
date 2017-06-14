import { Component, OnInit } from '@angular/core';

import { Validators, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from 'ng-formly';
import { DataService } from './../../core/data-service.service';

@Component({
  selector: 'app-locations-creator',
  templateUrl: './locations-creator.component.html',
  styleUrls: ['./locations-creator.component.css'],
  providers: [DataService],
})
export class LocationsCreatorComponent implements OnInit {

  nodes = [];
  form: FormGroup = new FormGroup({});
  userFields: FormlyFieldConfig;
  constructor(private dataService: DataService) { }

  ngOnInit() {
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
    // alert(node.nodeName);
    this.userFields = [{
      className: 'row',
      fieldGroup: [{
        className: 'col-xs-6',
        key: 'email',
        type: 'input',
        templateOptions: {
          type: 'email',
          label: 'Email address',
          placeholder: 'Enter email'
        },
        validators: {
          validation: Validators.compose([Validators.required])
        }
      }, {
        className: 'col-xs-6',
        key: 'password',
        type: 'input',
        templateOptions: {
          type: 'password',
          label: 'Password',
          placeholder: 'Password',
          pattern: ''
        },
        validators: {
          validation: Validators.compose([Validators.required])
        }
      }]
    }];
  }
}
