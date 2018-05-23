import { Element } from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/cat.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../tangy-form/tangy-form.js';
import '../tangy-form/tangy-common-styles.js'
import { TangyFormModel } from '../tangy-form/tangy-form-model.js'
import { TangyFormResponseModel } from '../tangy-form/tangy-form-response-model.js'
import { TangyFormService } from '../tangy-form/tangy-form-service.js'

/**
 * `tangy-form-app`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyFormApp extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
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
      #new-response-button {
        position: fixed;
        color: #fff;
        z-index: 999;
        bottom: 0px;
        left: 50%;
        margin-left: -20px;
      }
      #fake-top-bar {
        background: var(--primary-color-dark);
        padding: 8px 0px 0px 8px;
      }
    </style>
    <div class="tangy-form-app--container">

      <div id="form-list">
        <template is="dom-repeat" items="{{forms}}">
            <paper-card class="form-link" alt="[[item.title]]" heading="[[item.title]]">
                <div class="card-actions">
                  <a href="index.html#form_src=[[item.src]]" on-click="reload">
                    <paper-button class="launch-form">
                      <iron-icon icon="icons:launch">
                    </iron-icon></paper-button>
                  </a>
                </div>
            </paper-card>
        </template>
      </div>

      <div id="form-view" hidden="">
        <div id="fake-top-bar">
          <a id="home-button" href="../shell/index.html">
              <img src="../logo.svg" width=45>
          </a>
        </div>
        <div id="form-container"></div>
      </div>

    </div>
`;
  }

  static get is() { return 'tangy-form-app'; }

  async connectedCallback() {
    super.connectedCallback();
    // Prevent accidental back button by filling up the history.
    for (let i = 0; i < 50; i++) { history.pushState({}, "Tangerine", window.location); }
    // Get params from hash.
    let params = window.getHashParams()
    let formSrc = params.hasOwnProperty('form_src') ? params.form_src : undefined
    let responseId = (params.hasOwnProperty('response_id')) ? params.response_id : undefined
    let databaseName = (params.database_name) ? params.database_name : 'tangy-form-app'
    // Prevent accidental form exit.
    this.$['home-button'].addEventListener('click', (ev) => {
      ev.preventDefault()
      let wantsToExit = confirm(t('Are you sure you would like to exit the form?'))
      if (wantsToExit) window.location.href = '../shell/index.html'
    })
    // Set up service.
    this.service = new TangyFormService({ databaseName })
    await this.service.initialize()
    // Load i18n.
    try {
      let src = '../content/translation.json';
      let response = await fetch(src)
      window.translation = await response.json()
    } catch (e) {
      console.log('No translation found.')
    }
    try {
      let appConfigResponse = await fetch('../content/app-config.json')
      window.appConfig = await appConfigResponse.json()
    } catch(e) {
      console.log('No app config found.')
    }
    if (window.appConfig.direction === 'rtl') {
      let styleContainer = document.createElement('div')
      styleContainer.innerHTML = `
        <style>
          * {
              text-align: right;
              direction: rtl;
          }
      </style>
      `
      document.body.appendChild(styleContainer)
    }
      // Load form or form list.
    if (formSrc) {
      this.$['form-view'].hidden = false
      this.$['form-list'].hidden = true
      await this.loadForm(formSrc, responseId)
    } else {
      this.$['form-view'].hidden = true
      this.$['form-list'].hidden = false
      await this.loadFormsList()
    }
    if (params.hasOwnProperty('hide_top_bar')) {
      this.$['fake-top-bar'].hidden = true
    }
    // Remove loading screen.
    window['tangy-form-app-loading'].innerHTML = ''
  }

  async loadFormsList() {
    const url = '../content/forms.json'
    let formsJson = await fetch(url)
    this.forms = await formsJson.json()
  }

  async loadForm(formSrc, responseId) {

    // Put the form markup in the form container.
    let formHtml = await fetch(formSrc)
    this.$['form-container'].innerHTML = await formHtml.text()
    let formEl = this.$['form-container'].querySelector('tangy-form')
    formEl.addEventListener('ALL_ITEMS_CLOSED', () => {
      if (parent && parent.frames && parent.frames.ifr) {
        parent.frames.ifr.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
      }
    })

    // Put a response in the store by issuing the FORM_OPEN action.
    if (responseId) {
      let response = await this.service.getResponse(responseId)
      formEl.store.dispatch({ type: 'FORM_OPEN', response })
    } else {
      let state = formEl.store.getState()
      window.setHashParam('response_id', state._id)
    }
    // Listen up, save in the db.
    formEl.addEventListener('TANGY_FORM_UPDATE', _ => {
      let response = _.target.store.getState()
      this.throttledSaveResponse(response)
    })
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store.
  // Everything else in between we can ignore.
  async throttledSaveResponse(response) {
    // If already loaded, return.
    if (this.throttledSaveLoaded) return
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while (this.throttledSaveFiring) await sleep(200)
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse(response)
    this.throttledSaveFiring = false
  }

  async saveResponse(state) {
    let stateDoc = {}
    try {
      stateDoc = await this.service.getResponse(state._id)
    } catch (e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc._rev })
    await this.service.saveResponse(newStateDoc)
  }

  onClickNewResponseButton() {
    let confirmation = confirm(t('Are you sure you want to start a form response?'))
    if (confirmation) {
      let params = getHashParams()
      this.loadForm(params.form_src)
    }
  }

  reload() {
    window.location.reload()
  }

}

window.customElements.define(TangyFormApp.is, TangyFormApp);
