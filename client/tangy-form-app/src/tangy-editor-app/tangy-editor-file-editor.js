import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';

/**
 * `tangy-editor-file-editor`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyEditorFileEditor extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        background: #CCC;
        color: var(--primary-text-color);
        font-size: medium;
      }
      paper-card {
        padding: 15px;
        margin: 15px;
      }
      juicy-ace-editor {
        height: 100vh;
      }
      #file-path {
        font-size: 2em;
        color: #777;
      }
      #buttons {
      }
      #top-bar {
        padding: 5px;
        position: relative;
      }
    </style>
    <div id="container"></div>
    `
  }

  static get is() { return 'tangy-editor-file-editor'; }

  static get properties() {
    return {
      filePath: {
        type: String,
        value: ''
      },
      useOverlay: {
        type: Boolean,
        value: false
      },
      groupId: {
        type: String,
        value: ''
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

  async render() {
    this.$.container.innerHTML = `
      <div id="top-bar">
        <span id="file-path"> ${this.filePath} </span>
        <span id="buttons">
          <paper-button class="save-button">
            <iron-icon icon="icons:save"/>
          </paper-button>
        </span>
      </div>
      <juicy-ace-editor> </juicy-ace-editor>
    `
    if (this.useOverlay) {
        this.setAttribute('style', `
          position: fixed;
          height: 100vh;
          width: 100%;
          top: 0px;
          left: 0px;
        `)
    }
    // Set the ace editor contents.
    let res = await fetch(`../content/${this.filePath}`, {credentials: 'include'})
    const formHtml = await res.text()
    this.$.container.querySelector('juicy-ace-editor').value = formHtml
    // Listen for save.
    this.$.container.querySelector('.save-button').addEventListener('click', async ev => {
      await fetch("/editor/file/save", {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          fileContents: this.$.container.querySelector('juicy-ace-editor').value,
          filePath: this.filePath,
          groupId: this.groupId
        }),
        credentials: 'include'
      })
      if (this.useOverlay) this.remove()
    })
  }

}

window.customElements.define(TangyEditorFileEditor.is, TangyEditorFileEditor);
