import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from
  '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TangerineFormCard} from './tangerine-form-card';
import {safeLoad} from 'js-yaml';

export abstract class TangerineBaseCardComponent implements OnInit {


  //
  // Input.
  //

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
  @Output() click = new EventEmitter();
  @Output() submit = new EventEmitter();

  //
  // Private.
  //

  form: FormGroup;
  private internalEl: any;
  showHeader = false;
  showSubmitButton = false;
  displaySound = null;
  transitionSound = null;

  constructor(fb: FormBuilder, el: ElementRef) {
    // Capture the internal element for getting any inline configuration set.
    this.internalEl = el;
    // Instantiate a Reactive Angular Form.
    this.form = fb.group({});
  }

  ngOnInit() {

    // Look for inline YAML configuration.
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
      if (typeof((<any>Object).values(model)[0]) !== 'undefined') {
        // console.log("changed " + (<any>Object).keys(model)[0] + " to " + (<any>Object).values(model)[0])
        if (this.displaySound) {
          var isPlaying = this.displaySound.currentTime > 0 && !this.displaySound.paused && !this.displaySound.ended
            && this.displaySound.readyState > 2;
          // if (!isPlaying) {
          //   this.displaySound.load();
          // }
          // if (!isPlaying) {
          //   this.displaySound.play();
          // } else {
          //   console.log("I'm still playing!")
          //   this.displaySound.pause();
          //   this.displaySound.play();
          // }

          var playPromise = this.displaySound.play();

          if (playPromise !== undefined) {
            playPromise.then(_ => {
              console.log("I'm still playing! ")
              this.displaySound.stop();
              this.displaySound.play();
            })
              .catch(error => {
                console.log("Play! ")
                this.displaySound.play();
                // Auto-play was prevented
                // Show paused UI.
              });
          }

        }
      }

      this.change.emit(this._tangerineFormCard);
    });

    if (this.tangerineFormCard.media) {
      if (this.tangerineFormCard.media.transitionSound) {
        this.transitionSound = new Audio(this.tangerineFormCard.media.transitionSound);
      }
      this.transitionSound.play();
      if (this.tangerineFormCard.media.displaySound) {
        this.displaySound = new Audio(this.tangerineFormCard.media.displaySound);
      }
      this.displaySound.load();
    }
  }

  onSubmit() {
    this.submit.emit(this._tangerineFormCard);
  }


}
