import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `tangerine-client-components`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangerineClientComponents extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'tangerine-client-components',
      },
    };
  }
}

window.customElements.define('tangerine-client-components', TangerineClientComponents);
