/* eslint-disable */

class TangyInput extends HTMLElement {
  static get observedAttributes() {
    return ['key1', 'key2'];
  }

  constructor() {
    super();
    this.changedAttributes = [];
    // this.innerHTML = ''
    // super.connectedCallback()
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.changedAttributes.push(name);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
            <style>
              
            </style>
            <div id="container"><input type="text" id="input"/> </div>
        `;
  }
  
}

customElements.define('tangy-input', TangyInput);