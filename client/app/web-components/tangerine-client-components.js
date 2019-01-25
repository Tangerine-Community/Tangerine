import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

//   <!-- Tangy Elements -->
import 'tangy-form/tangy-form.js'
import 'tangy-form/input/tangy-box.js'
import 'tangy-form/input/tangy-input.js'
import 'tangy-form/input/tangy-timed.js'
import 'tangy-form/input/tangy-checkbox.js'
import 'tangy-form/input/tangy-checkboxes.js'
import 'tangy-form/input/tangy-radio-buttons.js'
import 'tangy-form/input/tangy-select.js'
import 'tangy-form/input/tangy-location.js'
import 'tangy-form/input/tangy-gps.js'
import 'tangy-form/input/tangy-acasi.js';
import 'tangy-form/input/tangy-eftouch.js';
import 'tangy-form/input/tangy-photo-capture.js';
import '@polymer/iron-icons/notification-icons.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';





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
