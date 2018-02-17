import { Element } from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/cat.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../tangy-form/tangy-form.js';
import '../tangy-form/tangy-common-styles.js'
import { tangyFormReducer } from '../tangy-form/tangy-form-reducer.js'
import {tangyReduxMiddlewareLogger, tangyReduxMiddlewareCrashReporter, tangyReduxMiddlewareTangyHook} from '../tangy-form/tangy-form-redux-middleware.js'
import { TangyFormModel } from '../tangy-form/tangy-form-model.js'
import { TangyFormResponseModel } from '../tangy-form/tangy-form-response-model.js'
import { TangyFormService } from '../tangy-form/tangy-form-service.js'
import {FORM_OPEN, formOpen, FORM_RESPONSE_COMPLETE, FOCUS_ON_ITEM, focusOnItem, ITEM_OPEN, itemOpen, ITEM_CLOSE, itemClose,
  ITEM_DISABLE, itemDisable, ITEM_ENABLE, itemEnable, ITEMS_INVALID, ITEM_CLOSE_STUCK, ITEM_NEXT,
  ITEM_BACK,ITEM_CLOSED,ITEM_DISABLED, inputDisable, ITEM_ENABLED, inputEnable, ITEM_VALID, inputInvalid, INPUT_ADD,
  INPUT_VALUE_CHANGE, INPUT_DISABLE, INPUT_ENABLE, INPUT_INVALID, INPUT_VALID, INPUT_HIDE, inputHide, INPUT_SHOW, inputShow,
  NAVIGATE_TO_NEXT_ITEM, NAVIGATE_TO_PREVIOUS_ITEM, TANGY_TIMED_MODE_CHANGE, tangyTimedModeChange, TANGY_TIMED_TIME_SPENT,
  tangyTimedTimeSpent, TANGY_TIMED_LAST_ATTEMPTED, tangyTimedLastAttempted, TANGY_TIMED_INCREMENT, tangyTimedIncrement} from '../tangy-form/tangy-form-actions.js'

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

  constructor() {
    super()
    // Create Redux Store.
    window.tangyFormStore = Redux.createStore(
      tangyFormReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
      Redux.applyMiddleware(tangyReduxMiddlewareTangyHook)
    )
    this.store = window.tangyFormStore
  }

  async connectedCallback() {
    super.connectedCallback();
    // Get params from hash.
    let params = window.getHashParams()
    let formSrc = params.hasOwnProperty('form_src') ? params.form_src : undefined
    let responseId = (params.hasOwnProperty('response_id')) ? params.response_id : undefined
    let databaseName = (params.database_name) ? params.database_name : 'tangy-form-app' 
    // Set up service.
    this.service = new TangyFormService({ databaseName })
    await this.service.initialize()
    // Save store when it changes.
    this.store.subscribe(this.throttledSaveResponse.bind(this))
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
    if (params.hasOwnProperty('hide_new_response_button')) {
      this.$['new-response-button'].hidden = true
    }
    // Remove loading screen.
    window['tangy-form-app-loading'].innerHTML = ''
  }

  async loadFormsList() {
    let formsJson = await fetch('../content/forms.json')
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
      formOpen(response)
    } else {
      // Create new form response from the props on tangy-form and children tangy-form-item elements.
      let form = this.$['form-container'].querySelector('tangy-form').getProps()
      let items = []
      this.$['form-container']
        .querySelectorAll('tangy-form-item')
        .forEach((element) => items.push(element.getProps()))
      let response = new TangyFormResponseModel({ form, items })
      window.setHashParam('response_id', response._id)
      formOpen(response)
    }
  }

  // Prevent parallel saves which leads to race conditions. Only save the first and then last state of the store. 
  // Everything else in between we can ignore.
  async throttledSaveResponse() {
    // If already loaded, return.
    if (this.throttledSaveLoaded) return
    // Throttle this fire by waiting until last fire is done.
    if (this.throttledSaveFiring) {
      this.throttledSaveLoaded = true
      while(this.throttledSaveFiring) await sleep(200)
      this.throttledSaveLoaded = false
    }
    // Fire it.
    this.throttledSaveFiring = true
    await this.saveResponse()
    this.throttledSaveFiring = false
  }

  async saveResponse() {
    const state = this.store.getState()
    let stateDoc = {}
    try {
      stateDoc = await this.service.getResponse(state._id)
    } catch(e) {
      let r = await this.service.saveResponse(state)
      stateDoc = await this.service.getResponse(state._id)
    }
    let newStateDoc = Object.assign({}, state, { _rev: stateDoc._rev })
    await this.service.saveResponse(newStateDoc)
  }

  onClickNewResponseButton() {
    let confirmation = confirm("Are you sure you want to start a form response?")
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
