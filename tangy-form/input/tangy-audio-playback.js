import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import { t } from "../util/t.js";
import "../style/tangy-common-styles.js";
import "../style/tangy-element-styles.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/paper-button/paper-button.js";
import { TangyInputBase } from "../tangy-input-base.js";

export class TangyAudioPlayback extends TangyInputBase {
  static get template() {
    return html`
    <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
      :host {
        display: block;
      }
     </style>
    <div id="qnum-number"></div>
    <div id="qnum-content">
      <label id="label"></label>
      <label id="hintText" class="hint-text"></label>
      <audio src="[[src]]" controls></audio>
      <label id="error-text"></label>
    </div>
    `;
  }
  static get is() {
    return 'tangy-audio-playback'
}
  static get properties() {
    return {
      name: {
        type: String,
        value: "",
      },
      hintText: {
        type: String,
        value: "",
      },
      label: {
        type: String,
        observer: "reflect",
        value: "",
      },
      errorText: {
        type: String,
        value: "",
      },
      private: {
        type: Boolean,
        value: false,
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: "onDisabledChange",
        reflectToAttribute: true,
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: "onSkippedChange",
        reflectToAttribute: true,
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: "onInvalidChange",
        reflectToAttribute: true,
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true,
      },
      value: {
        type: String,
        value: "",
      },
      src: {
        type: String,
        value: "",
        reflectToAttribute: true,
      },
      controls: {
        type: Boolean,
        value: true,
        reflectToAttribute: true,
      },
    };
  }

  constructor() {
    super();
    this.src = "";
  }

  reflect() {
    this.shadowRoot.querySelector("#qnum-number").innerHTML = this.hasAttribute(
      "question-number"
    )
      ? `<label>${this.getAttribute("question-number")}</label>`
      : "";
    this.shadowRoot.querySelector("#hintText").innerHTML = this.hintText;
    this.shadowRoot.querySelector("#label").innerHTML = this.label;
  }
  onInvalidChange(value) {
    if (this.shadowRoot.querySelector('#error-text')) {
      this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
        ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
        : ''
    }
  }
  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }
  onDisabledChange(value) {
    if (this.shadowRoot.querySelector('audio')) {
      this.shadowRoot.querySelector('audio').disabled = this.disabled;
    }
  }
  validate() {
    return true
  }
}

window.customElements.define("tangy-audio-playback", TangyAudioPlayback);
