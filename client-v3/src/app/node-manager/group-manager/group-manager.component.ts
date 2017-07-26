import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Group } from './group';
import { GroupResult } from './group-result';
import { GroupDataService } from './group-data-service.service';
import { TangerineFormSession } from '../../tangerine-forms/models/tangerine-form-session';

@Component({
  selector: 'app-group-manager',
  templateUrl: './group-manager.component.html',
  styleUrls: ['./group-manager.component.css'],
  providers: [GroupDataService]
})
export class GroupManagerComponent implements OnInit {

  // IO.
  @Input() groupModel: Group;
  @Input() result: GroupResult;

  session: TangerineFormSession = new TangerineFormSession({
    '_id': 'bc82cf48-b394-3053-6759-c36dec144460',
    'formId': 'tangerine-group-demo',
    'model': {
      'name': 'Rambo'
    }
  });

  onSubmit(tangerineFormCard) {
    console.log(tangerineFormCard.model);
    Object.assign(this.result.variables, tangerineFormCard.model);
    this.save(this.result.variables);
  }

  save(datum) {
    console.log('Saving to pouch - datum: ' + JSON.stringify(datum));
    this.dataService.createNode(datum);
    // this.jsonFormSubmit.emit(this.form.value);
  }

  constructor(private dataService: GroupDataService) { }

  ngOnInit() {

    if (!this.result) {
      this.result = new GroupResult();
    }
  }

}
