class Page2 extends LitElement {

  render() {
    return html`
      <style>
        p {
          margin: 25px;
        }
        paper-button {
          background: #CCC;
        }
      </style>
      <paper-button @click="${this.goBack}"><mwc-icon>chevron_left</mwc-icon>Go back</paper-button>
      <p>
        This is page 2.
      </p>
    `
  }

  goBack() {
    window.customApp.open('')
  }

}

customElements.define('page-2', Page2)
