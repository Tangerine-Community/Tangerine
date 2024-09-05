import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './util/html-element-props.js'
import './style/tangy-common-styles.js'
import './style/tangy-element-styles.js'

    /**
     * `tangy-template`
     *
     * This element does not have the separation of concerns you might expect from this component. The life cycle of the element is handled by the `tangy-form-item` element.
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyTemplate extends PolymerElement {
  static get template () {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <div id="container"></div>
    `
  }

  static get is () {
    return 'tangy-template'
  }

  static get properties () {
    return {
      name: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        observer: 'render',
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        observer: 'render',
        reflectToAttribute: true
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    // <tangy-form-item> will evaluate this template in the scope it lives.
    // Note we're not using innerHTML because that will result in expressions like greater than becoming HTML encoded. See note on MDN docs https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
    this.template = this.innerHTML.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  }

}
window.customElements.define(TangyTemplate.is, TangyTemplate)
