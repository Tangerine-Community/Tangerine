class HomeComponent extends LitElement {
  render() {
    return html`
      <ul>
        <li @click="${this.openPage1}">Go to Page 1</li>
        <li @click="${this.openPage2}">Go to Page 2</li>
      </ul>
    `
  }

  openPage1() {
    window.customApp.open('page1')
  }

  openPage2() {
    window.customApp.open('page2')
  }

}

customElements.define('home-component', HomeComponent)
