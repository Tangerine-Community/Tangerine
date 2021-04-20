/* eslint-disable */
// import { Window } from 'happy-dom';
import pkg from 'happy-dom';
const { Window } = pkg;

export class TangyForm extends new Window().HTMLElement {
  static get observedAttributes() {
    return ['title', 'key2'];
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
            <div id="items"><slot></slot></div>
        `;
  }
}

// customElements.define('tangy-form', TangyForm);
