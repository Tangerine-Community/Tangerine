/* eslint-disable */

class TangyFormItem extends HTMLElement {
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
              :host {
                margin: 15px;
              }
            </style>
            <div class="card-content">
              <label class="heading"></label>
              <slot></slot>
            </div>
        `;
  }
  
  
}

customElements.define('tangy-form-item', TangyFormItem);