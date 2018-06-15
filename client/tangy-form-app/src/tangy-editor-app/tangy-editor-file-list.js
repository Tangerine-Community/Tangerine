import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
import './tangy-editor-file-editor.js'
/**
 * `tangy-editor-file-list`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyEditorFileList extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
        font-size: medium;
      }
      paper-card {
        padding: 15px;
        margin: 15px;
      }

      
    </style>
    <div id="container"></div>
    `
  }

  static get is() { return 'tangy-editor-file-list'; }

  static get properties() {
    return {
      items: {
        type: Array,
        value: [
          'app-config.json',
          'location-list.json',
          'translation.json'
        ],
        observer: 'render'
      },
      groupId: {
        type: String,
        value: '',
        observer: 'render'
      }
    };
  }

  constructor() {
    super()
  }

  connectedCallback() {
    super.connectedCallback()
    this.render()
  }

  render() {
    this.$.container.innerHTML = `
      ${this.items.map(item => `
        <paper-card heading="${item}">
          <div class="editor"></div>
          <div class="card-actions">
            <a href="#">
              <paper-button role="button" tabindex="0" animated="" elevation="0" aria-disabled="false">
                  <iron-icon icon="icons:settings">
              </iron-icon></paper-button>
            </a>
          </div>
        </paper-card>
      `).join('')}
    `
    this.$.container.querySelectorAll('paper-card').forEach(card => {
      card.addEventListener('click', () => {
        let containerEl = document.createElement('div')
        containerEl.innerHTML = `
          <tangy-editor-file-editor use-overlay file-path="${card.getAttribute('heading')}" group-id="${this.groupId}"></tangy-editor-file-editor>
        `
        document.body.appendChild(containerEl)
      })
    })
  }

}

window.customElements.define(TangyEditorFileList.is, TangyEditorFileList);
