import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from './util/t.js'
import './util/html-element-props.js'
import '@polymer/paper-card/paper-card.js'
import './style/tangy-common-styles.js'
import { TangyFormItemHelpers } from './tangy-form-item-callback-helpers.js'

/**
 * `tangy-form-item`
 * An element used to encapsulate form elements for multipage forms with a response in PouchDB.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

export class TangyFormItem extends PolymerElement {

  static get is() { return 'tangy-form-item'; }

  connectedCallback() {
    if (this.querySelector('template')) {
      this.template = this.querySelector('template').innerHTML
    } else {
      this.template = this.innerHTML
    }
    this.innerHTML = ''
    super.connectedCallback()
    this.t = {
      back: t('back'),
      next: t('next'),
      open: t('open'),
      close: t('close'),
      save: t('save'),
      submit: t('submit')
    }
    this.hadDiscrepancies = []
    this.hadWarnings = []
  }

  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style>
        :host {
          margin: 15px;
        }
        :host([disabled]) {
          display: none;
        }
        /*
        * Card
        */
        paper-card {
          background: var(--tangy-form-item--background-color, #FFF);
          -webkit-transition: .4s;
          -moz-transition: .4s;
          -ms-transition: .4s;
          -o-transition: .4s;
          display: block;
          max-width: 325px;
          margin: /*30px*/ auto;
        }
        :host([open]) paper-card {
          -webkit-transition: .4s;
          -moz-transition: .4s;
          -ms-transition: .4s;
          -o-transition: .4s;
          display: block;
          max-width: 920px;
        }
        :host([disabled]) paper-card {
          --paper-card-background-color: gray !important;
          --paper-card-header-color: #CCC;
        }
        :host([hidden]) {
          display: none;
        }

       /*
        * Fullscreen 
        */
        :host([fullscreen-enabled]) paper-card {
          width: 100%;
          max-width: 100% !important;
          height: 100vh;
        }
        :host([fullscreen-enabled]) {
          margin: 0px
        }
        :host([fullscreen-enabled]) paper-card  {
          padding-top: 53px;
          overflow: scroll;
        }
        :host([fullscreen-enabled]) .card-actions {
          position: fixed;
          top: 0px;
          width: 100%;
          right: 0px;
          padding: 0px;
          margin: 0px;
        }
        :host([fullscreen-enabled]) paper-button {
          background: white;
          color: grey;
        }
        :host([fullscreen-enabled]) paper-button#complete {
          float: right;
          margin: 15px;
          background: green;
          color: white; 
        }
        :host([fullscreen-enabled]) paper-button#complete paper-button {
          display: none;
        }
        :host([fullscreen-enabled]) label.heading {
          display: none;
        }
        :host([fullscreen-enabled]) .card-content {
          padding-top: 0px;
        }
        :host(:not([fullscreen])) #enable-fullscreen,
        :host(:not([fullscreen])) #disable-fullscreen,
        :host([fullscreen]:not([fullscreen-enabled])) #disable-fullscreen,
        :host([fullscreen]):host([fullscreen-enabled]) #enable-fullscreen
        {
          display: none;
        }
        #disable-fullscreen,
        #enable-fullscreen 
        {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);  
        }


        /*
        * Action Buttons
        */
        .card-actions {
          height: 45px;
          margin-bottom: 100px;
        }
        :host([open]) #open {
          display: none;
        }
        :host([locked]) #complete {
          display: none;
        }
        :host(:not([open])) #close {
          display: none;
        }
        :host([disabled]) #open {
          display: none;
        }
        label.heading {
          font-size: 21px !important;
          margin-bottom: 20px;
          display: block;
          color: var(--primary-color);
          font-weight: 700;
        }

        #next {
          float: right;
        }
        #next iron-icon {
          margin: 0px 0px 0px 5px;
        }

        #back {
          float: left;
        }
        #back iron-icon {
          margin: 0 5px 0 0;
        }

        .card-actions paper-button {
          font-size: 1.2rem;
          line-height: 1rem;
        }

        paper-card {
          --paper-card-header: {
            @apply --tangy-form-item--paper-card--header;
          };
        }
        paper-card .card-content {
          padding: var(--tangy-form-item--paper-card-content--padding, 15px);
        }

      </style>
      <paper-card id="card" class="shrunk">
        <div class="card-content">
          <label class="heading"></label>
          <slot></slot>
        </div>
        <div class="card-actions">
          <paper-button id="disable-fullscreen" on-click="onExitFullscreenClick" >
            <iron-icon icon="fullscreen-exit"></iron-icon>
          </paper-button>
          <paper-button id="enable-fullscreen" on-click="onEnterFullscreenClick" >
            <iron-icon icon="fullscreen"></iron-icon>
          </paper-button>
          <template is="dom-if" if="{{!hideButtons}}">
            <paper-button id="open" on-click="onOpenButtonPress">[[t.open]]</paper-button>
            <template is="dom-if" if="{{!locked}}">
              <paper-button id="close" on-click="onCloseButtonPress">[[t.save]]</paper-button>
            </template>
            <template is="dom-if" if="{{locked}}">
              <paper-button id="close" on-click="onCloseButtonPress">[[t.close]]</paper-button>
            </template>
          </template>
          <template is="dom-if" if="{{open}}">
            <template is="dom-if" if="{{rightToLeft}}">
              <template is="dom-if" if="{{showCompleteButton}}">
                <paper-button id="complete" on-click="clickedComplete" style="float:left">
                  [[t.submit]]
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideNextButton}}">
                <paper-button id="back" on-click="next" >
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-back"></iron-icon>
                  </template>
                  <template is="dom-if" if="{{!hideNavLabels}}">
                    [[t.next]]
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideBackButton}}">
                <paper-button id="next" on-click="back" >
                 <template is="dom-if" if="{{!hideNavLabels}}">
                    [[t.back]]
                  </template>
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-forward"></iron-icon>
                  </template>
                </paper-button>
              </template>
            </template>
            <template is="dom-if" if="{{!rightToLeft}}">
              <template is="dom-if" if="{{!hideBackButton}}">
                <paper-button id="back" on-click="back" >
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-back"></iron-icon>
                  </template>
                  <template is="dom-if" if="{{!hideNavLabels}}">
                    [[t.back]]
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideNextButton}}">
                <paper-button id="next" on-click="next" >
                 <template is="dom-if" if="{{!hideNavLabels}}">
                    [[t.next]]
                  </template>
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-forward"></iron-icon>
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{showCompleteButton}}">
                <paper-button id="complete" on-click="clickedComplete" style="float:right" >
                  [[t.submit]]
                </paper-button>
              </template>
            </template>
          </template>
          <template is="dom-if" if="{{!incomplete}}">
            <iron-icon style="color: var(--primary-color); float: right; margin-top: 10px" icon="icons:check-circle"></iron-icon>
          </template>
        </div>
      </paper-card>
    `
  }


  static get properties() {
    return {

      // Configuration
      id: {
        type: String,
        value: 'tangy-form-item',
        reflectToAttribute: true
      },
      title: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      summary: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      fullscreen: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      fullscreenEnabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideButtons: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideBackButton: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideNavIcons: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideNavLabels: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      rightToLeft: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideNextButton: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      showCompleteButton: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      inputs: {
        type: Array,
        observer: 'reflect',
        value: []
      },

      // State
      open: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: 'onOpenChange',
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      locked: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      isDirty: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      incorrectThreshold: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      exitClicks: {
        type: Number,
        value: undefined,
        reflectToAttribute: true
      },
      firstOpenTime: {
        type: Number,
        value: undefined,
        reflectToAttribute: false
      }
    };
  }

  // Apply state in the store to the DOM.
  reflect() {
    this.shadowRoot.querySelector('.heading').innerHTML = this.hasAttribute('title')
      ? this.getAttribute('title')
      : ''
    // Reflect to tangy-input-groups first because they may need to template out some additional inputs.
    this.inputs
      .filter(input => input.tagName === 'TANGY-INPUT-GROUPS')
      .forEach((inputState) => {
        let inputEl = this.querySelector(`[name="${inputState.name}"]`)
        if (inputEl) {
          inputEl.setProps(inputState)
          inputEl.value = inputState.value
        }
      })
    this.inputs
      .filter(input => input.tagName !== 'TANGY-INPUT-GROUPS')
      .forEach((inputState) => {
        let inputEl = this.querySelector(`[name="${inputState.name}"]`)
        if (inputEl) inputEl.setProps(inputState)
      })
  }

  // Callback for on-open and on-change logic. Also a number of other things piggy back on this opportunity to update
  // such as input level show-if and tangy-template rendering.
  fireHook(hook, event) {
    // If locked, don't run any logic.
    if (this.locked) return
    // Run hook.
    this.eval(this.getAttribute(hook), hook)
    // Let input level hooks piggy back on this hook.
    let inputActionFactories = {
      visible: {
        truthy: name => this.eval(`inputShow("${name}")`, 'show-if', name),
        falsey: name => this.eval(`inputHide("${name}")`, 'show-if', name)
      },
      editable: {
        truthy: name => this.eval(`inputEnable("${name}")`, 'disable-if', name),
        falsey: name => this.eval(`inputDisable("${name}")`, 'disable-if', name)
      }
    }
    this.querySelectorAll('[name]').forEach(input => {
      if (input.hasAttribute('skip-if')) {
        if (this.eval(input.getAttribute('skip-if'), 'skip-if', input.getAttribute('name'))) {
          input.setAttribute('skipped', '')
        } else {
          input.removeAttribute('skipped')
        }
      }
      if (input.hasAttribute('dont-skip-if')) {
        if (this.eval(input.getAttribute('dont-skip-if'), 'dont-skip-if', input.getAttribute('name'))) {
          input.removeAttribute('skipped')
        } else {
          input.setAttribute('skipped', '')
        }
      }
      if (input.hasAttribute('show-if')) {
        if (this.eval(input.getAttribute('show-if'), 'show-if', input.getAttribute('name'))) {
          input.removeAttribute('skipped')
        } else {
          input.setAttribute('skipped', '')
        }
      }
      if (input.hasAttribute('disable-if')) {
        if (this.eval(input.getAttribute('disable-if'), 'disable-if', input.getAttribute('name'))) {
          inputActionFactories['editable'].falsey(input.name)
        } else {
          inputActionFactories['editable'].truthy(input.name)
        }
      }
      if (input.hasAttribute('tangy-if') && input.hasAttribute('tangy-action')) {
        if (this.eval(input.getAttribute('tangy-if'), 'tangy-if', input.getAttribute('name'))) {
          inputActionFactories[input.getAttribute('tangy-action')].truthy(input.name)
        } else {
          inputActionFactories[input.getAttribute('tangy-action')].falsey(input.name)
        }
      } else if (input.hasAttribute('tangy-if') && !input.hasAttribute('tangy-action')) {
        if (this.eval(input.getAttribute('tangy-if'), 'tangy-if', input.getAttribute('name'))) {
          input.removeAttribute('skipped')
        } else {
          input.setAttribute('skipped', '')
        }
      }
    })
    // Let <tangy-template> rendering piggy back on this hook.
    this.querySelectorAll('tangy-template').forEach(templateEl => {
      if (templateEl.shadowRoot) {
        templateEl.$.container.innerHTML = this.eval('`' + templateEl.template + '`', 'tangy-template', templateEl.getAttribute('name'))
      }
    })
  }

  eval(code, hook, context = '') {
    // Prepare some helper variables.
    let state = this.store.getState()
    // Inputs.
    let inputsArray = []
    state.items.forEach(item => inputsArray = [...inputsArray, ...item.inputs])
    this.querySelectorAll('[name]').forEach(input => inputsArray.push(input))
    let inputsKeyedByName = {}
    inputsArray.forEach(input => inputsKeyedByName[input.name] = input)
    let inputs = inputsKeyedByName
    // Elements.
    let elementsById = {}
    this.querySelectorAll('[id]').forEach(el => elementsById[el.id] = el)
    // Items.
    let items = {}
    state.items.forEach(item => items[item.name] = item)
    let inputEls = this.querySelectorAll('[name]')
    let tangyFormStore = this.store
    // Declare namespaces for helper functions for the eval context in form.on-change.
    // We have to do this because bundlers modify the names of things that are imported
    // but do not update the evaled code because it knows not of it.
    let {getValue, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold, goTo, goToEnd} = this.exposeHelperFunctions()
    if (this.hasAttribute("incorrect-threshold")) {
      hideInputsUponThreshhold(this)
    }
    try {
      const result = eval(code)
      return result
    } catch(err) {
      const detail = `${t(`Error detected in the section logic:`)} ${context} :: ${hook} :: <br> <pre> ${code} </pre>`
      console.log(detail)
      console.log(err)
      this.dispatchEvent(new CustomEvent('logic-error', { detail }))
      return false
    }
  }

  exposeHelperFunctions() {
    let helpers = new TangyFormItemHelpers(this)
    let getValue = (name) => helpers.getValue(name)
    let skip = (name) => helpers.skip(name)
    let unskip = (name) => helpers.unskip(name)
    let inputHide = (name) => helpers.inputHide(name)
    let inputShow = (name) => helpers.inputShow(name)
    let inputEnable = (name) => helpers.inputEnable(name)
    let inputDisable = (name) => helpers.inputDisable(name)
    // Proxy old "input" term to "item" term.
    let itemHide = (name) => helpers.inputHide(name)
    let itemShow = (name) => helpers.inputShow(name)
    let itemEnable = (name) => helpers.inputEnable(name)
    let itemDisable = (name) => helpers.inputDisable(name)
    let isChecked = (name) => helpers.isChecked(name)
    let notChecked = (name) => helpers.notChecked(name)
    let itemsPerMinute = (input) => helpers.itemsPerMinute(input)
    let numberOfItemsAttempted = (input) => helpers.numberOfItemsAttempted(input)
    let numberOfCorrectItems = (input) => helpers.numberOfCorrectItems(input)
    let numberOfIncorrectItems = (input) => helpers.numberOfIncorrectItems(input)
    let gridAutoStopped = (input) => helpers.gridAutoStopped(input)
    let hideInputsUponThreshhold = (input) => helpers.hideInputsUponThreshhold(input)
    let goTo = (itemId, skipValidation = false) => helpers.goTo(itemId, skipValidation)
    let goToEnd = (skipValidation = false) => helpers.goToEnd(skipValidation)
    return {getValue, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold, goTo, goToEnd};
  }

  onOpenButtonPress() {
    this.open = true
    this.dispatchEvent(new CustomEvent('ITEM_OPENED'))
  }

  onCloseButtonPress() {
    if (this.locked) {
      this.open = false
      this.dispatchEvent(new CustomEvent('ITEM_CLOSED'))
    }
    else if (this.validate()) {
      this.submit()
      this.open = false
      this.dispatchEvent(new CustomEvent('ITEM_CLOSED'))
    }
  }

  onOpenChange(open) {
    // Close it.
    if (open === false) {
      this.innerHTML = ''
    }
    // Open it, but only if empty because we might be stuck.
    if (open === true && this.innerHTML === '') {
      this.openWithContent(this.template)
    }
  }

  openWithContent(contentHTML) {
    this.innerHTML = contentHTML
    this
      .querySelectorAll('[name]')
      .forEach(input => {
        input.addEventListener('next', () => this.next())
        input.addEventListener('change', _ => {
          _.stopPropagation()
          this.fireHook('on-change', _)
        })
      })
    let tangyCompleteButtonEl = this
      .querySelector('tangy-complete-button')
    if (tangyCompleteButtonEl) {
      this.showCompleteButton = false 
      tangyCompleteButtonEl.addEventListener('click', this.clickedComplete.bind(this))
    }

    let tangyConsentEl = this.querySelector("tangy-consent")
    if (tangyConsentEl) {
      this.showCompleteButton = false
      tangyConsentEl.addEventListener('TANGY_INPUT_CONSENT_NO', this.clickedNoConsent.bind(this))
    }

    this.reflect()
    if (this.open === true) {
      this.fireHook('on-open')
      this.fireHook('on-change')
    }
    this.dispatchEvent(new CustomEvent('TANGY_FORM_ITEM_OPENED'))
  }

  onDisabledChange(newState, oldState) {
    if (newState === true && oldState === false) {
      this.dispatch({ type: ITEM_DISABLED, itemId: this.id })
    }
  }

  submit() {
    let inputs = []
    this
      .querySelectorAll('[name]')
      .forEach(input => inputs.push(input.getProps()))
    this.inputs = inputs
    if (window.devtools && window.devtools.open) {
      console.table(this.inputs.map(input => { return {name: input.name, value: input.value} }))
    }
    return true
  }

  validate() {
    // Check if tangy-input-groups and tangy-input-group have 'skipped' attribute
    let inputEls = [...this.querySelectorAll('[name]')]
      .filter(element => !element.parentElement.hasAttribute('skipped'))
        .filter(element => !element.parentElement.parentElement.hasAttribute('skipped'))
    const inputs = inputEls.reduce((inputsKeyedByName, input) => {
      return { [input.name]: input, ...inputsKeyedByName }
    }, {})

    let hasWarnings = []
    let hasDiscrepancies = []
    let invalidInputNames = []
    let validInputNames = []
    let firstInputWithIssue = ''
    for (let input of inputEls) {
      if (!input.hidden && !input.skipped) {
        let {getValue, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold} = this.exposeHelperFunctions();
        if ((input.validate && !input.validate()) || (input.hasAttribute('valid-if') && !eval(input.getAttribute('valid-if')))) {
          input.invalid = true
          if (!firstInputWithIssue) firstInputWithIssue = input.name
          invalidInputNames.push(input.name)
        } else {
          input.invalid = false
          validInputNames.push(input.name)
        }
        if (input.hasAttribute('warn-if') && eval(input.getAttribute('warn-if'))) {
          input.hasWarning = true
          if (!firstInputWithIssue) firstInputWithIssue = input.name
          hasWarnings.push({ name: input.name, value: input.value})
        } else {
          input.hasWarning = false
        }
        if (input.hasAttribute('discrepancy-if') && eval(input.getAttribute('discrepancy-if'))) {
          input.hasDiscrepancy = true
          if (!firstInputWithIssue) firstInputWithIssue = input.name
          hasDiscrepancies.push({ name: input.name, value: input.value})
        } else {
          input.hasDiscrepancy = false
        }
      } else {
        input.invalid = false
        validInputNames.push(input.name)
      }
    }
    const hasNewOrChangedDiscrepancies = hasDiscrepancies
      .reduce((foundNewOrChanged, input) => {
        return foundNewOrChanged || 
          (
            !this.hadDiscrepancies.find(had => had.name === input.name) ||
            JSON.stringify(this.hadDiscrepancies.find(had => had.name === input.name).value) !== JSON.stringify(input.value)
          ) 
          ? true
          : false
      }, false)
    const hasNewOrChangedWarnings = hasWarnings
      .reduce((foundNewOrChanged, input) => {
        return foundNewOrChanged || 
          (
            !this.hadWarnings.find(had => had.name === input.name) ||
            JSON.stringify(this.hadWarnings.find(had => had.name === input.name).value) !== JSON.stringify(input.value)
          ) 
          ? true
          : false
      }, false)
    this.hadDiscrepancies = JSON.parse(JSON.stringify(hasDiscrepancies))
    this.hadWarnings = JSON.parse(JSON.stringify(hasWarnings))
    if (invalidInputNames.length !== 0 || hasNewOrChangedDiscrepancies || hasNewOrChangedWarnings) {
      this
        .querySelector(`[name="${firstInputWithIssue}"]`)
        .scrollIntoView({ behavior: 'smooth', block: 'start' })
      this.incomplete = true
      this.fireHook('on-change')
      return false
    } else {
      this.incomplete = false
      this.fireHook('on-change')
      return true
    }
  }

  onExitFullscreenClick() {
    this._exitClicks = isNaN(this._exitClicks) ? 1 : this._exitClicks + 1
    if ((!this.hasAttribute('exit-clicks')) || (this.hasAttribute('exit-clicks') && this._exitClicks >= parseInt(this.getAttribute('exit-clicks')))) {
      this.dispatchEvent(new CustomEvent('exit-fullscreen', { bubbles: true }))
    }
  }

  onEnterFullscreenClick() {
    this.dispatchEvent(new CustomEvent('enter-fullscreen', { bubbles: true }))
  }

  next() {
    if (this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('ITEM_NEXT'))
    }
  }

  back() {
    this.submit()
    this.dispatchEvent(new CustomEvent('ITEM_BACK'))
  }

  goTo(itemId, skipValidation = false) {
    if (!skipValidation || this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('go-to', {detail: itemId}))
    }
  }


  clickedComplete() {
    if (this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('FORM_RESPONSE_COMPLETE', {bubbles: true}))
    }
  }

  clickedNoConsent() {
    if (this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('FORM_RESPONSE_NO_CONSENT', {bubbles: true}))
    }
  }

  getInputsMeta() {
    const container = document.createElement('div')
    container.innerHTML = this.template
    return [...container.querySelectorAll('[name]')]
      .map(el => {
        const propsData = el.getProps()
        const optionsData = [...el.querySelectorAll('option')].map(optionEl => {
          return {
            label: optionEl.innerHTML,
            value: optionEl.hasAttribute('name') ? optionEl.getAttribute('name') : optionEl.getAttribute('value')
          }
        })
        return {
          ...propsData,
          value: optionsData.length > 0 ? optionsData : propsData.value 
        }
      })
      .reduce((elementsThatAreNotOptions, element) => {
        return element.tagName === 'OPTION'
          ? elementsThatAreNotOptions 
          : [...elementsThatAreNotOptions, element]
      }, [])
  }

}

window.customElements.define(TangyFormItem.is, TangyFormItem);
