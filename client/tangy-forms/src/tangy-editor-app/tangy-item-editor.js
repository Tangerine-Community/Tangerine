import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../tangy-ckeditor/tangy-ckeditor.js';
import '../tangy-form/tangy-common-styles.js'

/**
 * `tangy-item-editor`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyItemEditor extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
        font-size: medium;
      }
      paper-icon-button.small {
      width: 30px;
      height: 30px;
      }
      paper-button {
        font-family: 'Roboto', 'Noto', sans-serif;
        font-weight: normal;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }
      paper-button.indigo {
        background-color: var(--paper-indigo-500);
        color: white;
        --paper-button-raised-keyboard-focus: {
          background-color: var(--paper-pink-a200) !important;
          color: white !important;
        };
      }
      paper-button.indigo:hover {
        background-color: var(--paper-indigo-400);
      }
      paper-button.green {
        background-color: var(--paper-green-500);
        color: white;
      }
      paper-button.green[active] {
        background-color: var(--paper-red-500);
      }
      juicy-ace-editor {
        height: 100vh;
      }
    </style>
    <div id="container"></div> 
    <slot></slot>

    `;
  }

  static get is() { return 'tangy-item-editor'; }

  static get properties() {
    return {
      item: {
        type: Object,
        value: undefined,
        observer: 'render'
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    this.$.container.innerHTML = `
      <div style="text-align: center">
      <paper-card style="text-align: left; margin: 0 auto; width:100%; max-width: 650px;">
        <div class="card-content">
          <paper-input id="itemTitle" value="${this.item.title}" label="title" always-float-label></paper-input>
          <paper-button id="switchEditorButton" raised class="indigo">switch editor</paper-button>
          <slot></slot>
        </div>
        <div class="card-actions">
          <paper-icon-button
            data-item-src="[[itemFilename]]"
            data-item-id="[[itemId]]"
            id="close"
            icon="icons:arrow-back"/>
            >
          </paper-icon-button>
          <paper-icon-button
              data-item-src="[[itemFilename]]"
              data-item-id="[[itemId]]"
              id="save"
              icon="icons:save"
              >
          </paper-icon-button>
        </div>
      </paper-card>
      </div>
    `
    this.innerHTML = `
      <tangy-ckeditor>
        ${this.item.fileContents}
      </tangy-ckeditor>
    `
    this.$.container.querySelector('#close').addEventListener('click', this.onCloseClick.bind(this))
    this.$.container.querySelector('#save').addEventListener('click', this.onSaveClick.bind(this))
  }

  onCloseClick(event) {
    this.dispatchEvent(new CustomEvent('close'))
  }
  onSaveClick(event) {
    this.dispatchEvent(new CustomEvent('save', {
      detail: Object.assign({}, this.item, {
        title: this.$.container.querySelector('#itemTitle').value,
        fileContents: this.querySelector('tangy-ckeditor').value 
    })}))
  }
}

window.customElements.define(TangyItemEditor.is, TangyItemEditor);
