import './home-component.js'
import './page-1.js'
import './page-2.js'

class CustomApp extends LitElement {

  static get properties() {
    return { route: { type: String } };
  }

  constructor() {
    super()
    window.customApp = this
    this.route = ''
  }

  render() {
    return html`
      ${this.route === '' ? html`
        <home-component></home-component>
      `: ``}
      ${this.route === 'page1' ? html`
        <page-1></page-1>
      `: ``}
      ${this.route === 'page2' ? html`
        <page-2></page-2>
      `: ``}
    `
  }

  open(route) {
    this.route = route
  }

}

customElements.define('custom-app', CustomApp)
