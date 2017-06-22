import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
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

  // tangerineFormSession = [{
  //   className: 'row',
  //   fieldGroup: [{
  //     key: 'name',
  //     type: 'input',
  //     templateOptions: {
  //       type: 'text',
  //       label: 'Group Name'
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
                    label: 'Group Name',
                    type: 'text',
                  }
                }
              ]
            }],
            model: {
              'name': 'boop',
            }
          }
        ]
      }
    ]
  };

  onUpdate(datum) {
    // debugger
    console.log("groupModel: " + JSON.stringify(datum))
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

  constructor(private dataService: GroupDataService) { }

  ngOnInit() {

    if (!this.result) {
      this.result = new GroupResult();
    }
  }

}
