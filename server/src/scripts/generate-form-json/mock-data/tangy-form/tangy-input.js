/* eslint-disable */
// import { Window } from 'happy-dom';
import pkg from 'happy-dom';
const { Window } = pkg;

export class TangyInput extends new Window().HTMLElement {
  static get observedAttributes() {
    return ['name', 'private','label','type','disabled','hidden','skipped','incomplete','value','identifier'];
  }

  constructor() {
    super();
    this.changedAttributes = [];
    this.attachShadow({ mode: 'closed' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.changedAttributes.push(name);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
          :host {
              display: block;
          }
          
      </style>
      <div class="flex-container m-y-25">
        <div id="content">
          <div id="container"></div>
      </div>
    `;
  }
}

// customElements.define('tangy-input', TangyInput);
