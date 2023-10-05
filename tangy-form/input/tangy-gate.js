import {LitElement, html} from 'lit';

class TangyGate extends LitElement {

  static get properties() {
    return { 
      name: { type: String },
      value: { type: Boolean },
      inProgress: { type: String },
      success: { type: String },
      invisible: { type: Boolean }
    }
  }

  constructor() {
    super()
    this.value = false
    this.invisible = false
  }

  validate() {
    return !!this.value
  }

  render() {
    return html`
      ${!this.invisible ? html`
        ${!this.value ? html`
          <mwc-icon>crop_square</mwc-icon>
          ${this.inProgress ? `
            ${this.inProgress}
          `
          : `
            Working...
          `}
        `
        : html`
          <mwc-icon>done</mwc-icon>
          ${this.success ? `
            ${this.success}
          `
          : `
            Done.
          `}
        `}
      `: ``}
    `;
  }
}

// Register your element to custom elements registry, pass it a tag name and your class definition
// The element name must always contain at least one dash
customElements.define('tangy-gate', TangyGate);
