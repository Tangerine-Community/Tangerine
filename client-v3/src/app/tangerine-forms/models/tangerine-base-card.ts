import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TangerineFormCard} from './tangerine-form-card';
import {safeLoad} from 'js-yaml';
import {TangerineFormDefinitionService} from "../services/tangerine-form-definition-service";

export abstract class TangerineBaseCardComponent implements OnInit {


  //
  // Input.
  //

  // markup can be yaml or json. Currently defaults to yaml. Expect default will be json soon.
  @Input() markup: string = 'yaml'
  // If markup is json, retrieve it from the service using this field identifier
  @Input() field: string

  _tangerineFormCard: TangerineFormCard = new TangerineFormCard();
  @Input() tangerineFormCard: TangerineFormCard = new TangerineFormCard();

  private _tangerineFormModel: any;
  @Input()
  set tangerineFormModel(model) {
    this._tangerineFormCard.model = model;
    this._tangerineFormModel = model;
  }
  get tangerineFormModel() {
    return this._tangerineFormModel;
  }

  //
  // Output.
  //

  @Output() change = new EventEmitter();
  @Output() submit = new EventEmitter();

  //
  // Private.
  //

  form: FormGroup;
  private internalEl: any;
  showHeader = false;
  showSubmitButton = false;
  service = TangerineFormDefinitionService;

  constructor(fb: FormBuilder, el: ElementRef, service: TangerineFormDefinitionService) {
    // Capture the internal element for getting any inline configuration set.
    this.internalEl = el;
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});
    this.service = service
  }

  ngOnInit() {
    debugger;
    let inlineConfig = this.internalEl.nativeElement.innerHTML;
    inlineConfig = inlineConfig.substring(inlineConfig.lastIndexOf('START-CONFIG'), inlineConfig.lastIndexOf('END-CONFIG'));
    if (inlineConfig) {
      if (this.markup == 'yaml') {
        // Look for inline YAML configuration.
        inlineConfig = inlineConfig.split('\n');
        inlineConfig.splice(0, 1);
        inlineConfig.splice(inlineConfig.length - 2, inlineConfig.length);
        inlineConfig = safeLoad(inlineConfig.join('\n'));
        Object.assign(this.tangerineFormCard, inlineConfig);

      } else {
        // it is json
        Object.assign(this.tangerineFormCard, inlineConfig);
      }
    }


    // Save away initial configuration for updating and emitting. Avoid infinite loops.
    this._tangerineFormCard = Object.assign({}, this.tangerineFormCard);

    // If there are any header properties, turn on header.
    if (this._tangerineFormCard.avatarImage || this._tangerineFormCard.title || this._tangerineFormCard.subtitle) {
      this.showHeader = true;
    }

    // Bubble up form changes to the change output.
    this.form.valueChanges.subscribe(model => {
      Object.assign(this._tangerineFormCard, {
        status: this.form.status,
        model: model
      });
      this.change.emit(this._tangerineFormCard);
    });

  }

  onSubmit() {
    this.submit.emit(this._tangerineFormCard);
  }


}
