import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../question-base';
import { TextboxQuestion } from '../question-textbox';
import { DropdownQuestion } from '../question-dropdown';
import { QuestionControlService } from '../question-control.service';

@Component({
  selector: 'app-ng-json-form',
  templateUrl: './ng-json-form.component.html',
  styleUrls: ['./ng-json-form.component.css'],
  providers: [ QuestionControlService ]
})
export class NgJsonFormComponent implements OnInit {
  private _config: Array<any> = [];
  @Output() jsonFormSubmit: EventEmitter<Object> = new EventEmitter();
  questions: QuestionBase<any>[] = [];
  form: FormGroup;

  constructor(private qcs: QuestionControlService) {  }

  ngOnInit() { }

  @Input()
  set config(config: Array<any>) {
    this._config = config;
    // Populate this.questions from this.config with appropriately casted Question Classes.
    this.questions = [];
    this._config.forEach(element => {
      switch (element.questionClass) {
        case 'DropdownQuestion':
          this.questions.push(new DropdownQuestion(element));
          break;
        case 'TextboxQuestion':
          this.questions.push(new TextboxQuestion(element));
          break;
      }
    });
    this.form = this.qcs.toFormGroup(this.questions);
  }

  get config(): Array<any> { return this._config; }

  onSubmit() {
    this.jsonFormSubmit.emit(this.form.value);
  }

}
