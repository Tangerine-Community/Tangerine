import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from './util/t.js'
import './util/html-element-props.js'
import '@polymer/paper-card/paper-card.js'
import './style/tangy-common-styles.js'
import { TangyFormItemHelpers } from './tangy-form-item-callback-helpers.js'
import { TangyPromptUtils } from './util/tangy-prompt-utils.js'

/**
 * `tangy-form-item`
 * An element used to encapsulate form elements for multipage forms with a response in PouchDB.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

export class TangyFormItem extends PolymerElement {

  constructor() {
    super()
    this._injected = {}

    this.sectionPromptQueue = new TangyPromptUtils();
  }

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

  disconnectedCallback() {    
    this.sectionPromptQueue.stopAndClearQueue();

    super.disconnectedCallback();
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
          /*padding-top: 53px;*/
          padding-top: var(--fullscreen-padding-top, 0);
          overflow: scroll;
        }
        :host([fullscreen-enabled][fullscreen-nav-align="top"]) .card-actions {
          position: fixed;
          top: 0px;
          width: 100%;
          right: 0px;
          padding: 0px;
          margin: 0px;
        }
        :host([fullscreen-enabled][fullscreen-nav-align="bottom"]) .card-actions {
          position: fixed;
          bottom: 0px;
          width: 100%;
          right: 0px;
          padding: 0px;
          margin: 0px;
          pointer-events: none;
          border-top: none;
        }
        :host([fullscreen-enabled]) paper-button {
          background-color: var(--fullscreen-nav--background-color, white);
          background-size: var(--fullscreen-nav--background-size);
          background-image: var(--fullscreen-nav--background-image);
          border-radius: var(--fullscreen-nav--border-radius);
          border: var(--fullscreen-nav--border);
          padding: var(--fullscreen-nav--padding);
          color: var(--fullscreen-nav--color, grey);
          height: var(--fullscreen-nav--height);
          width: var(--fullscreen-nav--width);
          pointer-events: auto;
 
        }
        /* Buttons when nav aligned at the top */
        :host([fullscreen-enabled][fullscreen-nav-align="top"]) .card-actions paper-button#next {
          position: absolute;
          top: var(--fullscreen-nav-align-top--next--bottom, 15px);
          right: var(--fullscreen-nav-align-top--next--right, 15px);
          background: var(--fullscreen-nav-align-top--next--background, white);
          color: var(--fullscreen-nav-align-top--next--color, grey);
        }
        :host([fullscreen-enabled][fullscreen-nav-align="top"]) .card-actions paper-button#back {
          position: absolute;
          top: var(--fullscreen-nav-align-top--back--bottom, 15px);
          left: var(--fullscreen-nav-align-top--back--right, 15px);
          background: var(--fullscreen-nav-align-top--back--background, white);
          color: var(--fullscreen-nav-align-top--back--color, grey);
        }
        :host([fullscreen-enabled][fullscreen-nav-align="top"]) .card-actions paper-button#complete {
          position: absolute;
          top: var(--fullscreen-nav-align-top--complete--bottom, 15px);
          right: var(--fullscreen-nav-align-top--complete--right, 15px);
          background: var(--fullscreen-nav-align-top--complete--background, green);
          color: var(--fullscreen-nav-align-top--complete--color, white);
        }
        /* Buttons when nav aligned at the bottom */
        :host([fullscreen-enabled][fullscreen-nav-align="bottom"]) .card-actions paper-button#next {
          position: absolute;
          bottom: var(--fullscreen-nav-align-bottom--next--bottom, 15px);
          right: var(--fullscreen-nav-align-bottom--next--right, 15px);
          background-image: var(--fullscreen-nav-align-bottom--next--background-image, var(--fullscreen-nav--background-image, none));
          background-color: var(--fullscreen-nav-align-bottom--next--background-color, var(--fullscreen-nav--background-color, white));
        }
        :host([fullscreen-enabled][fullscreen-nav-align="bottom"]) .card-actions paper-button#back {
          display: var(--fullscreen-nav-align-bottom--back--display, inline-block);
          position: absolute;
          bottom: var(--fullscreen-nav-align-bottom--back--bottom, 15px);
          left: var(--fullscreen-nav-align-bottom--back--right, 15px);
          background-image: var(--fullscreen-nav-align-bottom--back--background-image, var(--fullscreen-nav--background-image, none));
          background-color: var(--fullscreen-nav-align-bottom--back--background-color, var(--fullscreen-nav--background-color, white));
        }
        :host([fullscreen-enabled][fullscreen-nav-align="bottom"]) .card-actions paper-button#complete {
          position: absolute;
          bottom: var(--fullscreen-nav-align-bottom--complete--bottom, 15px);
          right: var(--fullscreen-nav-align-bottom--complete--right, 15px);
          background-image: var(--fullscreen-nav-align-bottom--complete--background-image, var(--fullscreen-nav--background-image, none));
          background-color: var(--fullscreen-nav-align-bottom--complete--background-color, var(--fullscreen-nav--background-color, white));
        }
        :host([fullscreen-enabled]) paper-button#complete paper-button {
          display: none;
        }
        :host([fullscreen-enabled]) label.heading {
          display: none;
        }
        :host([fullscreen-enabled]) .card-content {
          padding-top: 0px;
          padding-left: var(--fullscreen-nav--width);
          padding-right: var(--fullscreen-nav--width);
        }
        :host([fullscreen-enabled]) .card-actions .check-mark {
          display: none;
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
            <paper-button id="open" on-click="onOpenButtonPress"><t-t>open</t-t></paper-button>
            <template is="dom-if" if="{{!locked}}">
              <paper-button id="close" on-click="onCloseButtonPress"><t-t>save</t-t></paper-button>
            </template>
            <template is="dom-if" if="{{locked}}">
              <paper-button id="close" on-click="onCloseButtonPress"><t-t>close</t-t></paper-button>
            </template>
          </template>
          <template is="dom-if" if="{{open}}">
            <template is="dom-if" if="{{rightToLeft}}">
              <template is="dom-if" if="{{showCompleteButton}}">
                <paper-button id="complete" on-click="clickedComplete" style="float:left">
                  <t-t>submit</t-t>
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideNextButton}}">
                <paper-button id="back" on-click="next" >
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-back"></iron-icon>
                  </template>
                  <template is="dom-if" if="{{!hideNavLabels}}">
                    <t-t>next</t-t>
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideBackButton}}">
                <paper-button id="next" on-click="back" >
                 <template is="dom-if" if="{{!hideNavLabels}}">
                    <t-t>back</t-t>
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
                    <t-t>back</t-t>
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{!hideNextButton}}">
                <paper-button id="next" on-click="next" >
                 <template is="dom-if" if="{{!hideNavLabels}}">
                    <t-t>Next</t-t>
                  </template>
                  <template is="dom-if" if="{{!hideNavIcons}}">
                    <iron-icon icon="arrow-forward"></iron-icon>
                  </template>
                </paper-button>
              </template>
              <template is="dom-if" if="{{showCompleteButton}}">
                <paper-button id="complete" on-click="clickedComplete" style="float:right" >
                  <t-t>submit</t-t>
                </paper-button>
              </template>
            </template>
          </template>
          <template is="dom-if" if="{{!incomplete}}">
            <iron-icon class="check-mark" style="color: var(--primary-color); float: right; margin-top: 10px" icon="icons:check-circle"></iron-icon>
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
      customScoringLogic: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      customScore: {
        type: Number,
        value: null,
        reflectToAttribute: false
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
      fullscreenNavAlign: {
        type: String,
        // Value of 'top' or 'bottom'
        value: 'top',
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

  inject(name, value) {
    this._injected[name] = value
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

  fireHookInput(hook, event, input) {
    // Let input level hooks piggy back on this hook.
    let inputActionFactories = {
      visible: {
        truthy: name => this.eval(`inputShow("${name}")`, 'show-if', name, true),
        falsey: name => this.eval(`inputHide("${name}")`, 'show-if', name, true)
      },
      editable: {
        truthy: name => this.eval(`inputEnable("${name}")`, 'disable-if', name, true),
        falsey: name => this.eval(`inputDisable("${name}")`, 'disable-if', name, true)
      }
    }
    if (input.hasAttribute('skip-if')) {
      if (this.eval(input.getAttribute('skip-if'), 'skip-if', input.getAttribute('name'), true)) {
        input.setAttribute('skipped', '')
      } else {
        input.removeAttribute('skipped')
      }
    }
    if (input.hasAttribute('dont-skip-if')) {
      if (this.eval(input.getAttribute('dont-skip-if'), 'dont-skip-if', input.getAttribute('name'), true)) {
        input.removeAttribute('skipped')
      } else {
        input.setAttribute('skipped', '')
      }
    }
    if (input.hasAttribute('show-if')) {
      if (this.eval(input.getAttribute('show-if'), 'show-if', input.getAttribute('name'), true)) {
        input.removeAttribute('skipped')
      } else {
        input.setAttribute('skipped', '')
      }
    }
    if (input.hasAttribute('disable-if')) {
      if (this.eval(input.getAttribute('disable-if'), 'disable-if', input.getAttribute('name'), true)) {
        inputActionFactories['editable'].falsey(input.name)
      } else {
        inputActionFactories['editable'].truthy(input.name)
      }
    }
    if (input.hasAttribute('tangy-if') && input.hasAttribute('tangy-action')) {
      if (this.eval(input.getAttribute('tangy-if'), 'tangy-if', input.getAttribute('name'), true)) {
        inputActionFactories[input.getAttribute('tangy-action')].truthy(input.name)
      } else {
        inputActionFactories[input.getAttribute('tangy-action')].falsey(input.name)
      }
    } else if (input.hasAttribute('tangy-if') && !input.hasAttribute('tangy-action')) {
      if (this.eval(input.getAttribute('tangy-if'), 'tangy-if', input.getAttribute('name'), true)) {
        input.removeAttribute('skipped')
      } else {
        input.setAttribute('skipped', '')
      }
    }
  }

  // Callback for on-open and on-change logic. Also a number of other things piggy back on this opportunity to update
  // such as input level show-if and tangy-template rendering.
  fireHook(hook, event) {
    // If locked, don't run any logic.
    if (this.locked) return
    // Run hook.
    this.eval(this.getAttribute(hook), hook)
    if(hook==='custom-scoring-logic'){
      this.customScore = this.eval(`return ${this.getAttribute(hook)}`, hook)
    }
    this.querySelectorAll('[name]').forEach(input => {
      this.fireHookInput(hook, event, input)
    })
    // Let <tangy-template> rendering piggy back on this hook.
    this.querySelectorAll('tangy-template').forEach(templateEl => {
      if (templateEl.shadowRoot) {
        templateEl.$.container.innerHTML = this.eval('`' + templateEl.template + '`', 'tangy-template', templateEl.getAttribute('name'), true)
      }
    })
  }

  eval(code, hook, context = '', hasResult = false) {
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
    let {getValue, getValueAsMoment, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold, goTo, goToEnd} = this.exposeHelperFunctions()
    if (this.hasAttribute("incorrect-threshold")) {
      hideInputsUponThreshhold(this)
    }
    try {
      const result = eval(`
        (() => {
          ${Object.keys(this._injected).map(name => `var ${name} = this._injected['${name}']`).join('\n')}
          ${hasResult ? `return ` : ``}${code}
        })()
      `)
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
    let getValueAsMoment = (name) => helpers.getValueAsMoment(name)
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
    return {getValue, getValueAsMoment, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold, goTo, goToEnd};
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
      // Render tangy-template's.
      this.querySelectorAll('tangy-template').forEach(templateEl => {
        this.fireHookInput('on-open', {}, templateEl)
        if (templateEl.shadowRoot) {
          templateEl.$.container.innerHTML = this.eval('`' + templateEl.template + '`', 'tangy-template', templateEl.getAttribute('name'), true)
        }
      })
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

    this.querySelectorAll('tangy-prompt-box').forEach((tangyPrompt) => {
      // add event listeners for clicks
      if (tangyPrompt.shadowRoot) {
        tangyPrompt.shadowRoot.querySelectorAll('tangy-radio-block').forEach((block) => {
          const inputOptionName = `${tangyPrompt.name}-${block.name}`
          block.addEventListener('input-sound-triggered', this.onInputSoundTriggered.bind(this, inputOptionName));

          if (block.hasAttribute('play-on-open') && block.getAttribute('play-on-open') == "on") {
            let inputOptionName = `${tangyPrompt.name}-${block.name}`
            let playOnOpenEvent = new CustomEvent('input-sound-triggered', { detail: { sound: block.getAttribute('sound'), id: inputOptionName } } )
            block.dispatchEvent(playOnOpenEvent)
          }
        })
      }
    })

    this.querySelectorAll('tangy-radio-blocks').forEach((tangyRadioBlocks) => {   
      const inputName = tangyRadioBlocks.getAttribute('name')   
      if (tangyRadioBlocks.shadowRoot) {
        tangyRadioBlocks.shadowRoot.querySelectorAll('tangy-radio-block').forEach((block) => {
          if (block.hasAttribute('sound') && block.getAttribute('sound') != '') {
            const inputOptionName = `${inputName}-${block.name}`
            block.addEventListener('input-sound-triggered', this.onInputSoundTriggered.bind(this, inputOptionName));
          }
        })
      }
    })

    this.reflect()
    if (this.open === true) {
      this.fireHook('on-open')
      this.fireHook('on-change')
      this.fireHook('custom-scoring-logic')
    }
    this.dispatchEvent(new CustomEvent('TANGY_FORM_ITEM_OPENED'))
  }

  onDisabledChange(newState, oldState) {
    if (newState === true && oldState === false) {
      this.dispatch({ type: ITEM_DISABLED, itemId: this.id })
    }
  }

  submit() {
    let {getValue, getValueAsMoment, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold} = this.exposeHelperFunctions();
    let inputs = []
    this
      .querySelectorAll('[name]')
      .forEach(input => inputs.push(input.getModProps && window.useShrinker ? input.getModProps() : input.getProps()))
    
    let scoreSum = 0
    let percent = 0
    let denominatorSum = 0
    let tangyTimedPercents = [];
    this.inputs = inputs
    if (this.querySelector('[name]')) {
      const tangyFormItem = this.querySelector('[name]').parentElement
      if(tangyFormItem.hasAttribute('scoring-section')) {
        /*
         * Per the documentation:
         * - custom scoring always returns a percent
         * - users are supposed to only have one type of input per scoring section
         * - if there is a tangy-timed input, the score is the average of the percents of each grid. All other scores are ignored.
         */
        if (tangyFormItem.hasAttribute('custom-scoring-logic') && tangyFormItem.getAttribute('custom-scoring-logic').trim().length > 0) {
          scoreSum = this.customScore
          percent = this.customScore
          denominatorSum = 100
        } else {
          const selections = tangyFormItem.getAttribute('scoring-fields') || []
          if (selections.length > 0) {
            const selectionsArray = selections.split(',')
            function findObjectByKey(array, key, value) {
              for (let i = 0; i < array.length; i++) {   if (array[i] == key) {return array[i];}
              } return null;
            }
            this.inputs.forEach(input => {
              const a = findObjectByKey(selectionsArray, input.name)
              if (a != null) {
                let value = 0;
                let score = 0;
                let denominator = 0;
                if (input.tagName === 'TANGY-TIMED') {
                  //each grid present is scored as "number of correct items"/"number of total items" *100 aka a percent
                  const correct = numberOfCorrectItems(input);
                  const total = input.value.length
                  value = Math.round((correct/total) * 100).toString();
                  tangyTimedPercents.push(value);
                } else if (input.tagName === 'TANGY-CHECKBOX') {
                  // if the input is a checkbox, the score is 1 if checked, 0 if not
                  value = isChecked(input.name) ? 1 : 0
                  score += value
                  denominator = 1
                } else if (Array.isArray(input.value)) {
                  // the score is the sum of the values and the denominator is the max value or length of the array
                  value = getValue(input.name);
                  score += sumScore(value)
                  denominator =  maxValue(input.value)
                } else if (input.tagName === 'TANGY-INPUT' && input.type === 'number') {
                  // if the input is a number, the score is the value and the denominator is the max
                  value = parseInt(input.value)
                  score += value
                  denominator = parseInt(input.max)
                } else {
                  // default to the input value and increment the denominator
                  value = getValue(input.name);
                  score += sumScore(value)
                  denominator = 1
                }
                scoreSum += score
                denominatorSum += denominator
              }
            })
            if (tangyTimedPercents.length > 0) {
              percent = Math.round(tangyTimedPercents.reduce((a, b) => parseInt(a) + parseInt(b)) / tangyTimedPercents.length)
              scoreSum = percent
              denominatorSum = 100
            } else {
              percent = Math.round((scoreSum/denominatorSum) * 100)
            }
          }
        }
        function maxValue(inputValues) {
          if (inputValues.some(value => isNaN(value.name))) {
            return inputValues.length;
          }

          const values = inputValues.map(value => { return parseInt(value.name) });
          return Math.max(...values)
        }
        function sumScore(value) {
          let s = 0
          for (var i = 0; i < value.length; i++) {
            if (typeof value !== 'string')
              if (isNaN(value))
                s +=1; else  s += parseInt(value[i]);
            else
            if (isNaN(value))  s = 1; else s = parseInt(value);  }
          return s;
        }
        const scoreEl = document.createElement('tangy-input')
        scoreEl.name = `${tangyFormItem.getAttribute('id')}_score`
        scoreEl.value = scoreSum
        this.inputs = [...inputs, scoreEl.getModProps && window.useShrinker ? scoreEl.getModProps() : scoreEl.getProps()]

        const countEl = document.createElement('tangy-input')
        countEl.name = `${tangyFormItem.getAttribute('id')}_score_denominator`
        countEl.value = denominatorSum
        this.inputs = [...this.inputs, countEl.getModProps && window.useShrinker ? countEl.getModProps() : countEl.getProps()]

        const percentEl = document.createElement('tangy-input')
        percentEl.name = `${tangyFormItem.getAttribute('id')}_score_percent`
        percentEl.value = percent
        this.inputs = [...this.inputs, percentEl.getModProps && window.useShrinker ? percentEl.getModProps() : percentEl.getProps()]
      }
    }
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
        let {getValue, getValueAsMoment, inputHide, inputShow, skip, unskip, inputDisable, inputEnable, itemHide, itemShow, itemDisable, itemEnable, isChecked, notChecked, itemsPerMinute, numberOfItemsAttempted, numberOfCorrectItems, numberOfIncorrectItems, gridAutoStopped, hideInputsUponThreshhold} = this.exposeHelperFunctions();
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
      this.fireHook('custom-scoring-logic')
      return false
    } else {
      this.incomplete = false
      this.fireHook('on-change')
      this.fireHook('custom-scoring-logic')
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
    this.sectionPromptQueue.stopAndClearQueue();
    if (this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('ITEM_NEXT'))
    }
  }

  back() {
    this.sectionPromptQueue.stopAndClearQueue();
    if (this.validate()) {
      this.submit()
      this.dispatchEvent(new CustomEvent('ITEM_BACK'))
    }
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

  onInputSoundTriggered(eventName, event) {
    const input = event.target;

    // Prefer the event name passed by the caller
    eventName = eventName || input.name;

    if (event.detail.stopAndClearQueue) {
      this.sectionPromptQueue.stopAndClearQueue();
    }

    if (event.detail.sound) {
      this.sectionPromptQueue.queue(input, event.detail.sound, eventName);
    }

    if (input.hasAttribute("prompt-for") && input.getAttribute("prompt-for") != '') {
      let inputName = input.getAttribute("prompt-for")
      let inputTangyPrompt = this.querySelector(`[name="${inputName}"]`)
      if (inputTangyPrompt) {
        inputTangyPrompt.shadowRoot.querySelectorAll('tangy-radio-block').forEach((option) => {
          if (option.hasAttribute('sound') && option.getAttribute('sound') != '') {
            let inputOptionName = `${inputName}-${option.name}`
            this.sectionPromptQueue.queue(option, option.getAttribute('sound'), inputOptionName)
          }
        })
      }
    }

    if (this.sectionPromptQueue.prompts.length > 0) {
      this.sectionPromptQueue.play(this.sectionPromptQueue.prompts.length);
    }
  }

}

window.customElements.define(TangyFormItem.is, TangyFormItem);
