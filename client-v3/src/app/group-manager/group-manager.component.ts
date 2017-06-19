import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TangerinePageComponent} from "../tangerine-forms/tangerine-page/tangerine-page.component";
import {FormBuilder, Validators} from "@angular/forms";
import {TangerineFormContext} from "../tangerine-forms/tangerine-form-context";
import {TangerinePageConfig} from "../tangerine-forms/tangerine-page/tangerine-page-config";
import {Group} from "./group";
import {GroupResult} from "./group-result";
import {GroupDataService} from "./group-data-service.service";

@Component({
  selector: 'app-group-manager',
  templateUrl: './group-manager.component.html',
  styleUrls: ['./group-manager.component.css'],
  providers: [GroupDataService]
})
export class GroupManagerComponent implements OnInit {

  // IO.
  @Input() groupModel:Group;
  @Input() result: GroupResult;

  // TODO: If result used a setter, that setter could be in charge of emitting these events instead of having to remember to that
  // manually every time result is updated.
  // @Output() resultUpdate: EventEmitter<Object> = new EventEmitter();  // assign result of update to model

  config:TangerinePageConfig = [{
    className: 'row',
    fieldGroup: [{
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Group Name'
      },
      validators: {
        validation: Validators.compose([Validators.required])
      }
    },{
      key: '_id',
      type: 'input',
      templateOptions: {
        type: 'hidden',
      },
      validators: {
        validation: Validators.compose([Validators.required])
      }
    }]
  }];

  onTangerinePageUpdate(datum) {
    // debugger
    console.log("groupModel: " + JSON.stringify(datum))
    // let name = groupModel.variables["name"]
    // this.groupModel = groupModel.variables;
    this.result.variables = Object.assign(this.result.variables, datum.variables);
  }

  createGroup(datum) {
    console.log("this.result.variables: " + JSON.stringify(this.result.variables))
    this.dataService.createNode(this.result.variables);
    // this.jsonFormSubmit.emit(this.form.value);
  }

  constructor(private dataService: GroupDataService) { }

  ngOnInit() {

    if (!this.result) {
      this.result = new GroupResult();
    }
  }

}
