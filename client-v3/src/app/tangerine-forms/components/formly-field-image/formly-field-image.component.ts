import {Component, EventEmitter, Output} from '@angular/core';
import {Field} from "ng-formly";

@Component({
  selector: 'formly-field-image',
  templateUrl: './formly-field-image.component.html',
  styleUrls: ['./formly-field-image.component.css']
})
export class FormlyFieldImageComponent extends Field {

  // @Output() imageValue = new EventEmitter();


  get imageList() {
    if (this.to['imageList']) {
      return this.to['imageList'];
    }
    return null;
  }

  get imageValue() {
    return console.log("hey")
  }

}
