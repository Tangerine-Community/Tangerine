import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { safeLoad } from 'js-yaml';
import { TangerineFormCard } from '../../models/tangerine-form-card';

@Component({
  selector: 'tangerine-form-card',
  templateUrl: './tangerine-form-card.component.html',
  styleUrls: ['./tangerine-form-card.component.css']
})
export class TangerineFormCardComponent implements OnInit {
  @Input() tangerineFormCard: TangerineFormCard = new TangerineFormCard();
  private _tangerineFormCard: TangerineFormCard = new TangerineFormCard();
  private _tangerineFormModel: any;
  @Input()
  set tangerineFormModel(model) {
    this._tangerineFormCard.model = model;
    this._tangerineFormModel = model;
  }
  get tangerineFormModel() {
    return this._tangerineFormModel;
  }
  @Output() change = new EventEmitter();
  @Output() submit = new EventEmitter();
  set data (data) {
    console.log(data);
  }

  form: FormGroup;
  private internalEl: any;
  private showHeader = false;

  constructor(fb: FormBuilder, el: ElementRef) {
    this.internalEl = el;
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});
  }

  ngOnInit() {
    let inlineConfig = this.internalEl.nativeElement.innerHTML;
    inlineConfig = inlineConfig.substring(inlineConfig.lastIndexOf('START-CONFIG'), inlineConfig.lastIndexOf('END-CONFIG'));
    if (inlineConfig) {
      inlineConfig = inlineConfig.split('\n');
      inlineConfig.splice(0, 1);
      inlineConfig.splice(inlineConfig.length - 2, inlineConfig.length);
      inlineConfig = safeLoad(inlineConfig.join('\n'));
      Object.assign(this.tangerineFormCard, inlineConfig);
    }
    // Save away initial configuration for updating and emitting. Avoid infinite loops.
    this._tangerineFormCard = Object.assign({}, this.tangerineFormCard);
    // Bubble up form changes.
    if (this._tangerineFormCard.avatarImage || this._tangerineFormCard.title || this._tangerineFormCard.subtitle) {
      this.showHeader = true;
    }
    this.form.valueChanges.subscribe(model => {
      console.log('change');
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
