import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js'
import '@polymer/iron-pages/iron-pages.js';
import '@material/mwc-fab'
import "@material/mwc-icon"
import 'juicy-ace-editor/juicy-ace-editor-module.js'
import 'dr-niels-paper-expansion-panel/paper-expansion-panel.js'
import { tangyFormEditorReducer } from './tangy-form-editor-reducer.js'
import './tangy-form-item-editor.js'
import './tangy-form-html-editor.js'
import './tangy-code.js'
import 'tangy-translate'
import 'file-list-component/file-list.js'
import 'file-list-component/file-list-http.js'
import 'file-list-component/file-list-select.js'


//   <!-- Tangy Elements -->
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-box.js";
import "tangy-form/input/tangy-input.js";
import "tangy-form/input/tangy-timed.js";
import "tangy-form/input/tangy-untimed-grid.js";
import "tangy-form/input/tangy-toggle.js";
import "tangy-form/input/tangy-checkbox.js";
import "tangy-form/input/tangy-checkboxes.js";
import "tangy-form/input/tangy-radio-buttons.js";
import "tangy-form/input/tangy-select.js";
import "tangy-form/input/tangy-location.js";
import "tangy-form/input/tangy-gps.js";
import "tangy-form/input/tangy-acasi.js";
import "tangy-form/input/tangy-eftouch.js";
import "tangy-form/input/tangy-photo-capture.js";
import "tangy-form/input/tangy-video-capture.js";
import "tangy-form/input/tangy-qr.js";
import "tangy-form/input/tangy-gate.js";
import "tangy-form/input/tangy-consent.js";
import "tangy-form/input/tangy-signature.js";
import "tangy-form/input/tangy-audio-playback.js";
import "tangy-form/input/tangy-audio-recording.js";

/**
 * `tangy-form-editor`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyFormEditor extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          color: var(--primary-text-color);
          font-size: medium;
        }
        :host([show-preview]) .show-preview {
          display: none;
        }
        :host(:not([show-preview])) .hide-preview {
          display: none;
        }
        :host(:not([show-preview])) #form-preview {
          display: none;
        }
        :host([has-warning]) #warning {
          visibility: visible;
          background: #ffffed;
          border: solid 5px yellow;
          padding: 15px;
          margin: 5px;
        }
        :host(:not([has-warning])) #warning {
          visibility: hidden;
        }
        paper-input {
          --paper-input-container-underline-focus: {
            border-color: var(--accent-color);
          }
        }
        .rightCategories {
          margin-left: 2em;
        }
        .tangy-spacer {
          flex: 1 1 auto;
        }
        .sortable {
          display: inline-flex;
          cursor: move;
          margin-left: 4px;
          margin-bottom: 10px;
          width: 100%;
        }
        .list-item-text {
          padding-top: 0.9rem;
          font-size: 128%;
          font-weight: bold;
        }
        .tangy-icons {
          background-color: var(--accent-text-color);
          color: var(--lighter-accent-color);
        }
        .tangy-action-buttons {
          color: var(--accent-text-color);
          background-color: var(--accent-color);
          font-size: 12px;
          font-weight: 500;
          height: 2rem;
        }
        paper-icon-button {
          margin-top: 0.4rem;
        }
        .form-actions-container {
          display: flex;
          justify-content: space-between;
        }
        .form-actions {
          margin-top: 1rem;
        }
        sortable-list {
          width: 100%;
        }
      </style>
      <div id="warning"></div>
      <!-- FORM ITEM LISTING -->
      <div id="container"></div>
      <div id="editor-region">
        <slot></slot>
      </div>
      <div id="form-preview"></div>
    `;
  }

  static get properties() {
    return {
      print: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideShowIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideSkipIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      showPreview: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      categories: {
        type: Array,
        value: false,
        reflectToAttribute: true
      },
      filesEndpoint: {
        type: String,
        value: ''
      },
      locationListsMetadata: {
        type: Object,
        value: ''
      }
    };
  }

  get formHtml() {
    const state = this.store.getState();
    return `
      <tangy-form id="${state.form.id}" title="${state.form.title}" category="${
      state.form.category
    }"
        ${state.form.fullscreen ? ` fullscreen` : ''}
        ${state.form.openInFullscreen ? ` open-in-fullscreen` : ''}
        ${state.form.fullscreenInline ? ` fullscreen-inline` : ''}
        fullscreen-nav-align="${state.form.fullscreenNavAlign === 'bottom' ? `bottom` : 'top'}"
        ${state.form.recordItemFirstOpenTimes ? ` record-item-first-open-times` : ''}
        on-open="
          ${state.form.onOpen}
        "
        exit-clicks="${state.form.exitClicks}"
        cycle-sequences="${state.form.cycleSequences}"
        on-change="
          ${state.form.onChange}
        "
        on-submit="
          ${state.form.onSubmit}
        "
        on-resubmit="
          ${state.form.onResubmit}
        "
      >
        ${state.items
          .map(
            item => `
          <tangy-form-item id="${item.id}" 
            title="${item.title}"
            ${item.hideBackButton ? ` hide-back-button` : ''}
            ${item.hideNextButton ? ` hide-next-button` : ``}
            ${item.hideNavLabels ? ` hide-nav-labels` : ``}
            ${item.hideNavIcons ? ` hide-nav-icons` : ``}
            ${item.scoringSection ? ` scoring-section` : ``}
            ${item.summary ? ` summary` : ``}
            ${item.rightToLeft ? ` right-to-left` : ''}
            ${item.incorrectThreshold ? ` incorrect-threshold="${item.incorrectThreshold}"` : ''}
            scoring-fields="${item.scoringFields}"
            custom-scoring-logic="${item.customScoringLogic}"
            on-open="
              ${item.onOpen}
            "
            on-change="
              ${item.onChange}
            "
            category="
              ${item.category}
            "
          >
            <template>
              ${item.template}
            </template>
          </tangy-form-item>
        `).join('')}
      </tangy-form>
    `
  }

  set formHtml(templateHtml) {
    let template = document.createElement('template')
    template.innerHTML = templateHtml
    // Load from innerHTML
    let items = []
    template.content.querySelectorAll('tangy-form-item').forEach(el => items.push(Object.assign({}, 
      el.getProps(), 
      {
        template: (el.querySelector('template')) ? el.querySelector('template').innerHTML : el.innerHTML,
        onOpen: el.hasAttribute('on-open') ? el.getAttribute('on-open') : '',
        onChange: el.hasAttribute('on-change') ? el.getAttribute('on-change') : '',
        category: el.hasAttribute('category') ? el.getAttribute('category') : '',
        summary: el.hasAttribute('summary'),
        rightToLeft: el.hasAttribute('right-to-left'),
        incorrectThreshold: el.hasAttribute('incorrect-threshold') ? el.getAttribute('incorrect-threshold') : '',
        hideNavIcons: el.hasAttribute('hide-nav-icons'),
        hideNavLabels: el.hasAttribute('hide-nav-labels'),
        scoringSection: el.hasAttribute('scoring-section'),
        scoringFields: el.hasAttribute('scoring-fields') ? el.getAttribute('scoring-fields') : '',
        customScoringLogic: el.hasAttribute('custom-scoring-logic') ? el.getAttribute('custom-scoring-logic') : '',
        hideBackButton: el.hasAttribute('hide-back-button'),
        hideNextButton: el.hasAttribute('hide-next-button')
      }
    )))
    let formJson = Object.assign({}, this.formJson, {
      form: Object.assign(
         {}, 
         template.content.querySelector('tangy-form').getProps(),
         {
           title: template.content.querySelector('tangy-form').getAttribute('title'),
           fullscreen: template.content.querySelector('tangy-form').hasAttribute('fullscreen'),
           openInFullscreen: template.content.querySelector('tangy-form').hasAttribute('open-in-fullscreen'),
           fullscreenInline: template.content.querySelector('tangy-form').hasAttribute('fullscreen-inline'),
           fullscreenNavAlign: !template.content.querySelector('tangy-form').hasAttribute('fullscreen-nav-align') || template.content.querySelector('tangy-form').getAttribute('fullscreen-nav-align') === 'top'
             ? 'top' 
             : 'bottom',
           recordItemFirstOpenTimes: template.content.querySelector('tangy-form').hasAttribute('record-item-first-open-times'),
           exitClicks: template.content.querySelector('tangy-form').hasAttribute('exit-clicks')
            ? template.content.querySelector('tangy-form').getAttribute('exit-clicks')
            : '',
           cycleSequences: template.content.querySelector('tangy-form').hasAttribute('cycle-sequences')
            ? template.content.querySelector('tangy-form').getAttribute('cycle-sequences')
            : '',
           onOpen: template.content.querySelector('tangy-form').hasAttribute('on-open')
            ? template.content.querySelector('tangy-form').getAttribute('on-open')
            : '',
           onChange: template.content.querySelector('tangy-form').hasAttribute('on-change')
             ? template.content.querySelector('tangy-form').getAttribute('on-change')
             : '',
          onSubmit: template.content.querySelector('tangy-form').hasAttribute('on-submit')
             ? template.content.querySelector('tangy-form').getAttribute('on-submit')
             : '',
          onResubmit: template.content.querySelector('tangy-form').hasAttribute('on-resubmit')
             ? template.content.querySelector('tangy-form').getAttribute('on-resubmit')
             : '',
           category: template.content.querySelector('tangy-form').hasAttribute('category')
            ? template.content.querySelector('tangy-form').getAttribute('category')
            : '',
         }
      ),
      items
    })
    this.store.dispatch({type: 'FORM_OPEN', payload: formJson})
  }

  ready() {
    super.ready();
    this.store = Redux.createStore(
      tangyFormEditorReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
    this.unsubscribe = this.store.subscribe(_ => {
      this.render(this.store.getState())
    })
    if (this.querySelector('template')) {
      this.formHtml = this.querySelector('template').innerHTML
      this.innerHTML = ''
    } else {
      // Load from this.formJson inline.
      this.store.dispatch({type: 'FORM_OPEN', payload: this.formJson})
    }
    if (this.hasAttribute('print')) {
      this.store.dispatch({type: 'FORM_PRINT'})
    }
  }

  render(state) {
    if (state.warningMessage) {
      this.$.warning.innerHTML = state.warningMessage
      this.setAttribute('has-warning', '')
    } else {
      this.$.warning.innerHTML = '' 
      this.removeAttribute('has-warning')
    }
    if (state.print) {
      this.$.container.innerHTML = `
        <h1>${state.form.title}</h1> 
        ${state.items.map(item => `
          <h2>${item.title}</h2>
          <tangy-form-condensed-editor print>
            <template>
              ${item.template}
            </template>
          </tangy-form-condensed-editor>
        `).join('')}
      `
      return
    }
    if (state.openItem === '') { 
      this.innerHTML = ''
      // Unbind event listeners.
      if (this.$.container.querySelector('.item-create')) {
        this.$.container
          .querySelector('.item-create')
          .removeEventListener('click', this.onItemCreateClick.bind(this))
      }
      if (this.$.container.querySelector('sortable-list')) {
        this.$.container
          .querySelector('sortable-list')
          .removeEventListener('sort-finish', this.onSortFinish.bind(this))
      }
      this.$.container.innerHTML = `
        <div class="form-actions-container">
          <span style="width:40%;">
            <paper-input label="Form Title" id="form-title" value="${
              state.form.title
            }"></paper-input>
          </span>
          
          <span class="form-actions">
            <paper-button
                class="form-html-edit tangy-action-buttons">
                <iron-icon icon="icons:code"></iron-icon>
                ${t('Edit HTML')}
            </paper-button>
            <paper-button
                class="show-preview tangy-action-buttons">
                <iron-icon icon="image:remove-red-eye"></iron-icon>
                ${t('Preview')}
            </paper-button>
            <paper-button
                class="hide-preview tangy-action-buttons">
                <iron-icon icon="av:pause-circle-filled"></iron-icon>
                 ${t('Preview')}
            </paper-button>
            <paper-button
                class="save-form tangy-action-buttons">
                <iron-icon icon="icons:save"></iron-icon>
                 ${t('Save')}
            </paper-button>
            <paper-button
                class="advanced tangy-action-buttons">
                <iron-icon icon="icons:settings"></iron-icon>
                Advanced 
            </paper-button>
          </span>
        </div>
        <paper-expansion-panel header="advanced settings" id="main-expansion-panel">
          <paper-checkbox style="margin:15px;" id="record-item-first-open-times-checkbox" ${
            state.form.recordItemFirstOpenTimes ? 'checked' : ''
          }>${t('Enable recording "first opened time" on all sections')}</paper-checkbox><br>
          <paper-checkbox style="margin:15px;" id="open-in-fullscreen-checkbox" ${
            state.form.openInFullscreen ? 'checked' : ''
          }>${t('Open in fullscreen mode')}</paper-checkbox><br>
          <paper-checkbox style="margin:15px;" id="fullscreen-inline-checkbox" ${
            state.form.fullscreenInline ? 'checked' : ''
          }>${t('Use fullscreen mode without blocking control to the menu')}</paper-checkbox><br>
          <paper-checkbox style="margin:15px;" id="fullscreen-checkbox" ${
            state.form.fullscreen ? 'checked' : ''
          }>${t('Allow switching in and out of fullscreen mode')}</paper-checkbox><br>
          <select id="fullscreen-nav-align-select" name="fullscreen-nav-align-select" style="margin:15px;">
            <option value="top" ${!state.form.fullscreenNavAlign || state.form.fullscreenNavAlign === 'top' ? 'selected' : ''}>${t('Top')}</option>
            <option value="bottom" ${state.form.fullscreenNavAlign === 'bottom' ? 'selected' : ''}>${t('Bottom')}</option>
          </select><label for="fullscreen-nav-align-select">${t('Navigation alignment in fullscreen mode')}</label><br>
          <paper-input 
            style="margin: 15px;"
            label="${t('Number of clicks required to exit fullscreen mode')}"
            id="exit-clicks-input" 
            value="${state.form.exitClicks}"
          ></paper-input>
          <paper-textarea 
            style="margin: 15px;"
            label="${t('Cycle Sequences')}"
            placeholder="${t('This is a list of acceptable orders of sections(i.e from 1 to the length of the items), which will be selected each time an assessment is run.\n Section indices are separated by commas, new lines separate sequences. Once the full list of sequences is executed it will start back from the first line. Example sequences is 1,2,3,4\n4,1,2,3 ')}"
            id="cycle-sequences" 
            rows="5"
            value="${state.form.cycleSequences}"
          ></paper-textarea>
          <paper-expansion-panel header="on-open logic" id="on-open-editor"></paper-expansion-panel>
          <paper-expansion-panel header="on-change logic" id="on-change-editor"></paper-expansion-panel>
          <paper-expansion-panel header="on-submit logic" id="on-submit-editor"></paper-expansion-panel>
          <paper-expansion-panel header="on-resubmit logic" id="on-resubmit-editor"></paper-expansion-panel>
        </paper-expansion-panel>
        
        <sortable-list >
        ${state.items
          .map(
            (item, index) => `
          <paper-card
            class="sortable"
            data-item-id="${item.id}"
            data-item-title="${item.title}">
            <span >
                <span 
                  data-item-id="${item.id}"
                >
                  <paper-icon-button data-item-id="${
                    item.id
                  }" icon="icons:reorder"></paper-icon-button></span>
                  </span>
            
                <span class="tangy-spacer list-item-text">${index+1+'. '+
                  item.title
                }</span>
                
                <span>
                <a
                  class="tangy-icons item-copy"
                  data-item-id="${item.id}"
                >
                  <paper-icon-button data-item-id="${
                    item.id
                  }" icon="icons:content-copy"></paper-icon-button></a>
                <a class="tangy-icons item-edit"
                  data-item-id="${item.id}"
                >
                  <paper-icon-button data-item-id="${
                    item.id
                  }" icon="editor:mode-edit"></paper-icon-button></a>
                  
                <a
                  class="tangy-icons item-delete"
                  data-item-id="${item.id}"
                >
                  <paper-icon-button data-item-id="${
                    item.id
                  }" icon="icons:delete"></paper-icon-button></a>
                  </span>
            
          </paper-card>
        `
          )
          .join('')}
        </sortable-list>
        <div>
          <paper-button
              class="item-create tangy-action-buttons">
              <iron-icon icon="add-circle-outline"></iron-icon>
              ${t('Add section')}
          </paper-button>
        </div>
        
      `

      let onOpenEditorEl = document.createElement('juicy-ace-editor')
      onOpenEditorEl.setAttribute('mode', 'ace/mode/javascript')
      //onOpenEditorEl.value = itemFormEl.getAttribute('on-open') 
      onOpenEditorEl.value = state.form.onOpen  ? state.form.onOpen.replace(/&#34;/g, '"') : ''
      onOpenEditorEl.style.height = `${window.innerHeight*.6}px`
      onOpenEditorEl.addEventListener('change', _ => _.stopPropagation())
      this.shadowRoot.querySelector('#on-open-editor').appendChild(onOpenEditorEl)
      // on-change-editor
      let onChangeEditorEl = document.createElement('juicy-ace-editor')
      onChangeEditorEl.setAttribute('mode', 'ace/mode/javascript')
      onChangeEditorEl.value = state.form.onChange  ? state.form.onChange.replace(/&#34;/g, '"') : ''
      onChangeEditorEl.style.height = `${window.innerHeight*.6}px`
      onChangeEditorEl.addEventListener('change', _ => _.stopPropagation())
      this.shadowRoot.querySelector('#on-change-editor').appendChild(onChangeEditorEl)
      let onSubmitEditorEl = document.createElement('juicy-ace-editor')
      onSubmitEditorEl.setAttribute('mode', 'ace/mode/javascript')
      onSubmitEditorEl.value = state.form.onSubmit  ? state.form.onSubmit.replace(/&#34;/g, '"') : ''
      onSubmitEditorEl.style.height = `${window.innerHeight*.6}px`
      onSubmitEditorEl.addEventListener('change', _ => _.stopPropagation())
      this.shadowRoot.querySelector('#on-submit-editor').appendChild(onSubmitEditorEl)
      let onResubmitEditorEl = document.createElement('juicy-ace-editor')
      onResubmitEditorEl.setAttribute('mode', 'ace/mode/javascript')
      onResubmitEditorEl.value = state.form.onResubmit  ? state.form.onResubmit.replace(/&#34;/g, '"') : ''
      onResubmitEditorEl.style.height = `${window.innerHeight*.6}px`
      onResubmitEditorEl.addEventListener('change', _ => _.stopPropagation())
      this.shadowRoot.querySelector('#on-resubmit-editor').appendChild(onResubmitEditorEl)

      // Bind event listeners.
      this.$.container
        .querySelector('.advanced')
        .addEventListener('click', this.onClickAdvancedSettings.bind(this))
      this.$.container
        .querySelector('sortable-list')
        .addEventListener('sort-finish', this.onSortFinish.bind(this))
      this.$.container
        .querySelectorAll('.item-edit')
        .forEach(item => item.addEventListener('click', this.onItemEditClick.bind(this)))
      this.$.container
        .querySelectorAll('.item-copy')
        .forEach(item => item.addEventListener('click', this.onItemCopyClick.bind(this)))
      this.$.container
        .querySelectorAll('.item-delete')
        .forEach(item => item.addEventListener('click', this.onItemDeleteClick.bind(this)))
      this.$.container
        .querySelector('.show-preview')
        .addEventListener('click', this.togglePreview.bind(this))
      this.$.container
        .querySelector('.hide-preview')
        .addEventListener('click', this.togglePreview.bind(this))
      this.$.container
        .querySelector('.save-form')
        .addEventListener('click', this.onSaveFormClick.bind(this))
      this.$.container
        .querySelector('.item-create')
        .addEventListener('click', this.onItemCreateClick.bind(this))
      this.$.container
        .querySelector('.form-html-edit')
        .addEventListener('click', this.onFormHtmlEditClick.bind(this))
      if (!state.form.openInFullscreen && !state.form.fullscreen) {
        this.$['form-preview'].innerHTML = `
          <h2>Form preview</h2>
          ${this.formHtml}
        `
        this.$['form-preview'].querySelector('tangy-form').setAttribute('error-logging', '')
      } else {
        this.$['form-preview'].innerHTML = `
          <h2>Form preview is not compatible with fullscreen mode.</h2>
        `
      }
    } else if (state.openItem === 'form.html') {
      this.$['form-preview'].innerHTML = ``
      this.innerHTML = ''
      this.$.container.innerHTML = `
        <tangy-form-html-editor></tangy-form-html-editor>
      `
      this.$.container.querySelector('tangy-form-html-editor').form = {
        title: state.form.title,
        markup: this.formHtml 
      }
      this.$.container.querySelector('tangy-form-html-editor').addEventListener('save', this.onFormHtmlEditorSave.bind(this))
      this.$.container.querySelector('tangy-form-html-editor').addEventListener('close', this.onFormHtmlEditorCancel.bind(this))
    } else if (state.openItem !== '') {
      this.$.container.innerHTML = ''
      this.innerHTML = `
        <tangy-form-item-editor
          files-endpoint="${this.filesEndpoint}"
          location-lists-metadata='${JSON.stringify(this.locationListsMetadata)}'
          ${this.hideSkipIf ? `hide-skip-if` : ''}
          ${this.hideShowIf ? `hide-show-if` : ''}
        >
        </tangy-form-item-editor>
      `
      this.querySelector('tangy-form-item-editor').categories = this.categories
      this.querySelector('tangy-form-item-editor').item = state.items.find(item => item.id === state.openItem)
      this.querySelector('tangy-form-item-editor').addEventListener('save', this.onItemEditorSave.bind(this))
      this.querySelector('tangy-form-item-editor').addEventListener('cancel', this.onItemEditorCancel.bind(this))

      this.$['form-preview'].innerHTML = ``
    }
  }

  togglePreview() {
    if (this.showPreview) {
      this.showPreview = false 
    } else {
      this.showPreview = true
      setTimeout(_ => this.shadowRoot.querySelector('#form-preview').scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }
  }

  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('tangy-form-editor-change', {
      detail: this.formHtml
    }))
  }

  dispatchSaveEvent() {
    this.dispatchEvent(new CustomEvent('tangy-form-editor-save', {
      detail: this.formHtml
    }))
  }

  onItemEditorSave(event) {
    this.store.dispatch({type: 'ITEM_UPDATE', payload: event.detail})
    this.dispatchChangeEvent()
  }

  onSaveFormClick(event) {
    let categoryEl = this.shadowRoot.querySelector('#category');
    let categoryValue = null;
    if (typeof categoryEl !== 'undefined' && categoryEl !== null) {
      categoryValue = categoryEl.value
    }
    this.store.dispatch({type: 'FORM_UPDATE', payload: {
      title: this.shadowRoot.querySelector('#form-title').value,
      exitClicks: this.$.container.querySelector('#exit-clicks-input').value,
      cycleSequences: this.$.container.querySelector('#cycle-sequences').value,
      fullscreen: this.$.container.querySelector('#fullscreen-checkbox').hasAttribute('checked'),
      openInFullscreen: this.$.container.querySelector('#open-in-fullscreen-checkbox').hasAttribute('checked'),
      fullscreenInline: this.$.container.querySelector('#fullscreen-inline-checkbox').hasAttribute('checked'),
      fullscreenNavAlign: this.$.container.querySelector('#fullscreen-nav-align-select').value,
      recordItemFirstOpenTimes: this.$.container.querySelector('#record-item-first-open-times-checkbox').hasAttribute('checked'),
      onOpen: this.shadowRoot.querySelector('#on-open-editor juicy-ace-editor').value.replace(/"/g, '&#34;'),
      onChange: this.shadowRoot.querySelector('#on-change-editor juicy-ace-editor').value.replace(/"/g, '&#34;'),
      onSubmit: this.shadowRoot.querySelector('#on-submit-editor juicy-ace-editor').value.replace(/"/g, '&#34;'),
      onResubmit: this.shadowRoot.querySelector('#on-resubmit-editor juicy-ace-editor').value.replace(/"/g, '&#34;'),
      category: categoryValue
    }})
    const duplicateVariableNames = this.findDuplicateVariableNames()
    if (duplicateVariableNames.length > 0) {
      this.store.dispatch({
        type: 'WARN',
        payload: `
          <b>WARNING</b> Duplicate variables names detected: 
            ${
              duplicateVariableNames.length === 1 
                ? duplicateVariableNames[0]
                : duplicateVariableNames.join(', ')
            }
        `
      })
    }
    this.dispatchChangeEvent()
    this.dispatchSaveEvent()
  }

  onItemEditorCancel(event) {
    this.store.dispatch({type: 'ITEM_CLOSE'})
  }


  onItemCreateClick() {
    this.store.dispatch({type: 'ITEM_CREATE'})
  }

  onFormHtmlEditorSave(event) {
    this.formHtml = event.detail
    this.store.dispatch({type: '_UPDATE', payload: event.detail})
    this.dispatchChangeEvent()
  }

  onFormHtmlEditorCancel(event) {
    this.store.dispatch({type: 'ITEM_CLOSE'})
  }

  onFormHtmlEditClick() {
    this.store.dispatch({type: 'FORM_EDIT'})
  }

  onSortFinish(event) {
    this.store.dispatch({
      type: 'SORT_ITEMS', 
      payload: [].slice.call(this.$.container.querySelectorAll('.sortable'))
        .map(sortableEl => sortableEl.dataset.itemId)
    })
  }

  onItemEditClick(event) {
    this.store.dispatch({
      type: 'ITEM_OPEN',
      payload: event.target.dataset.itemId
    })
  }
  onItemCopyClick(event) {
    this.store.dispatch({
      type: 'ITEM_COPY',
      payload: event.target.dataset.itemId
    })
  }

  onItemDeleteClick(event) {
    const shouldDelete = confirm('Are you sure you want to delete this item?')
    if (!shouldDelete) return
    this.store.dispatch({
      type: 'ITEM_DELETE',
      payload: event.target.dataset.itemId
    })
  }

  onClickAdvancedSettings(){
    this.$.container.querySelector('#main-expansion-panel').opened=!this.$.container.querySelector('#main-expansion-panel').opened; 
  }

  findDuplicateVariableNames() {
    const containerEl = document.createElement('div')
    document.body.appendChild(containerEl)
    containerEl.innerHTML = this.formHtml
    const tangyFormEl = containerEl.querySelector('tangy-form')
    const meta = tangyFormEl.getMeta()
    const variablesInfo = meta.items.reduce((variablesInfo, item) => {
      for (let input of item.inputs) {
        if (variablesInfo.names.includes(input.name)) {
          variablesInfo.duplicateNames.push(input.name)
        } else {
          variablesInfo.names.push(input.name)
        }
      }
      return variablesInfo
    }, { names: [], duplicateNames: [] })
    containerEl.remove()
    return variablesInfo.duplicateNames
  }

}

window.customElements.define('tangy-form-editor', TangyFormEditor);
