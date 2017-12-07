import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
/**
 * `tangy-editor-app`
 * ...
 *
 * @customElement
 * @polymer
 */

class TangyEditorApp extends Element {
  static get template() {
    return `
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
      }
      .form-link {
        padding: 15px;
        margin: 15px;
      }
      .launch-form {
        position: relative;
        left: 45px;
        top: 8px;
      }
      #form-view--nav {
        font-weight: heavy;
        font-size: 1.2em;
        padding: 15px;
      }
    </style>
    <div class="tangy-editor-app--container">

      <div id="form-list">
        <template is="dom-repeat" items="{{forms}}">
            <paper-card class="form-link" image="images/noun_1018421_cc-small.png" alt="[[item.title]]" heading="[[item.title]]">
                <div class="card-actions">
                  <a href="?form=/content/[[item.src]]">
                    <paper-button class="launch-form">
                      <iron-icon icon="icons:launch">
                    </iron-icon></paper-button>
                  </a>
                </div>
            </paper-card>
        </template>
      </div>

      <div id="form-view" hidden="">
        <div id="form-view--nav">
          <!-- a href="/tangy-editors/index.html"><iron-icon icon="icons:close"></iron-icon></a-->
          [[formTitle]]
        </div>
        <slot></slot>
      </div>

    </div>
`;
  }

  static get is() { return 'tangy-editor-app'; }

  async connectedCallback() {
    super.connectedCallback();
    let query = this.parseQuery(window.location.hash)
    let formPath = query.form
    if (formPath) {
      let formDirectory = formPath.substring(0, formPath.lastIndexOf('\/')) + '/'
      console.log(`Setting <base> path using form directory: ${formDirectory}`)
      window['base-path-loader'].innerHTML = `<base href="${formDirectory}">`
      this.showForm(query.form)
    } else {
      this.showFormsList()
    }
    this.addEventListener('tangy-editor-item-opened', () => window['tangy-editor-app-loading'].innerHTML = '')
    // /editor/project/listAll
    let projects = await fetch('/editor/project/listAll')
  }

  // For parsing window.location.hash parameters.
  parseQuery(qstr) {
    var query = {};
    var a = (qstr[0] === '#' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
      var b = a[i].split('=');
      query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
  }

  async showFormsList() {
    this.$['form-view'].hidden = true
    this.$['form-list'].hidden = false
    // Load forms list.
    let formsJson = await fetch('../content/forms.json')
    this.forms = await formsJson.json()
  }

  onFormSrcChange(newValue, oldValue) {
    if (newValue !== '') this.showForm(newValue)
  }

  async showFormListener(event) {
    window.location.hash = event.currentTarget.dataFormSrc
    this.formSrc = event.currentTarget.dataFormSrc
  }

  async showForm(formSrc) {
    let query = this.parseQuery(window.location.hash)
    this.$['form-view'].hidden = false
    this.$['form-list'].hidden = true
    // Load the form into the DOM.
    let formHtml = await fetch(formSrc)
    // Put the formHtml in a template first so element do not initialize connectedCallback
    // before we modify them.
    let formTemplate = document.createElement('div')
    formTemplate.innerHTML = await formHtml.text()
    let formEl = formTemplate.querySelector('tangy-editor')
    if (query.database) formEl.setAttribute('database-name', query.database)
    if (query['linear-mode']) formEl.setAttribute('linear-mode', true)
    if (query['response-id']) formEl.setAttribute('response-id', query['response-id'])
    if (query['hide-closed-items']) formEl.setAttribute('hide-closed-items', true)
    if (query['hide-nav']) formEl.setAttribute('hide-nav', true)
    if (query['hide-responses']) formEl.setAttribute('hide-responses', true)
    this.innerHTML = formTemplate.innerHTML
    let tangyForm = this.querySelector('tangy-editor')
    tangyForm.addEventListener('ALL_ITEMS_CLOSED', () => {
      if (parent && parent.frames && parent.frames.ifr) {
        parent.frames.ifr.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
      }
    })
  }
}

window.customElements.define(TangyEditorApp.is, TangyEditorApp);
