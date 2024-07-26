import { html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../util/html-element-props.js'
import { TangyRadioBlocks} from './tangy-radio-blocks.js'
import './tangy-radio-block.js'
import '../style/tangy-element-styles.js';
import '../style/tangy-common-styles.js'
import { TangyInputBase } from '../tangy-input-base.js';

/**
 * `tangy-prompt-box`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyPrmoptBox extends TangyRadioBlocks {

  static get is() { return 'tangy-prompt-box'; }

  constructor() {
    super()
    this.value = []
  }

  static get template() {
    return html`
      <style include="tangy-element-styles"></style>
      <style include="tangy-common-styles"></style>

      <style>
        #blockContainer.columns {
          flex-direction: column;
          justify-content: normal;
        }
        .columns tangy-radio-block {
          --width: 100%;
          --height: 4rem;
          --justify-content: left;
          width: 100%;
          margin: .2rem 0;
          padding: 0px;
        }
        #blockContainer {
          display: flex;
          font-size: 4rem;
          font-weight: 700;
          text-align: center;
          flex-grow: 1;
          align-items: left;
          position: relative;
        }
      </style>

      ${super.template}
    `;
  }

  static get properties() {
    let properties = super.properties
    properties.justifyContent = {
      type: String,
      value: 'flex-end',
      reflectToAttribute: true
    }
    return properties;
  }

  ready() {
    super.ready()
  }

  reflect() {
    super.reflect()
  }

  render() {
    this.$.blockContainer.style.justifyContent = this.hasAttribute('justify-content') ? 
      this.getAttribute('justify-content') : 'flex-end';
    super.render()
  }

}
window.customElements.define(TangyPrmoptBox.is, TangyPrmoptBox);
