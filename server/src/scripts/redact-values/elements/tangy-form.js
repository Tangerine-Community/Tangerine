/* eslint-disable */

class TangyForm extends HTMLElement {
  static get observedAttributes() {
    return ['items'];
  }

  constructor() {
    super();
    this.changedAttributes = [];
    // this.attachShadow({ mode: 'closed' });
    this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChangedCallback tangy-form. element: ' + name);
    this.changedAttributes.push(name);
  }

  adoptedCallback() {
    console.log('Instantiated tangy-form in another place.');
  }

  connectedCallback() {
    console.log('connectedCallback tangy-form.');
    this.innerHTML = `
            <style>
                :host {
                    display: block;
                }
            </style>
            <div id="items"><slot></slot></div>
        `;
  }

  // Get an array of all inputs across items.
  get inputs() {
    return this.response.items.reduce((acc, item) => [...acc, ...item.inputs], [])
  }

  // Get an object where object properties are input names and object property values are corresponding input values.
  get values() {
    return this.inputs.reduce((acc, input) => Object.assign({}, acc, {[input.name]: input.value}), {})
  }
  
}

customElements.define('tangy-form', TangyForm);