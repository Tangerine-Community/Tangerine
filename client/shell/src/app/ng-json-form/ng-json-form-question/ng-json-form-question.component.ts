
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionBase } from '../question-base';

@Component({
  selector: 'app-ng-json-form-question',
  templateUrl: './ng-json-form-question.component.html',
  styleUrls: ['./ng-json-form-question.component.css']
})
export class NgJsonFormQuestionComponent {
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  get isValid() { return this.form.controls[this.question.key].valid; }
}
