/* eslint-disable */

class TangyFormItem extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'id','inputs'];
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
            <div class="card-content">
              <label class="heading"></label>
              <slot></slot>
            </div>
        `;
  }
}

customElements.define('tangy-form-item', CustomElement);
