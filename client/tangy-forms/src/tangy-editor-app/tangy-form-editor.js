import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import {tangyFormEditorReducer} from './tangy-form-editor-reducer.js'
import './tangy-editor-file-list.js'
import './tangy-item-editor.js'
import '../tangy-form/cat.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../node_modules/sortable-list/sortable-list.js';
import '../tangy-form/tangy-form.js';
import '../tangy-ckeditor/tangy-ckeditor.js';
import '../tangy-acasi/tangy-acasi.js';
import '../tangy-form/tangy-common-styles.js'
import { TangyFormResponseModel } from "../tangy-form/tangy-form-response-model.js";

/**
 * `tangy-form-app`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyFormEditor extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
        font-size: medium;
      }
      
      juicy-ace-editor {
        height: 100vh;
      }
    </style>
    <!-- FORM ITEM LISTING -->
    <div id="container"></div>
    <div id="editor-region">
      <slot></slot>
    </div>

    `;
  }

  static get is() { return 'tangy-form-editor'; }

  static get properties() {
    return {
      state: {
        type: Object,
        value: {
          editMode: 'ckeditor', 
          openItem: '',
          form: {
            id: 'form1',
            title: 'Form 1',
            linearMode: true,
            hideDisabledItems: true,
            hasSummary: true,
          },
          items: [
            {
              id: 'item1',
              title: 'Item 1',
              summary: false,
              hideNextButton: false,
              hideBackButton: true,
              fileContents: `<tangy-input name="input1" label="Input 1"></tangy-input>`
            },
            {
              id: 'item2',
              title: 'Item 2',
              summary: false,
              hideNextButton: true,
              hideBackButton: false,
              fileContents: `<tangy-input name="input2" label="Input 2"></tangy-input> <br>
                              <tangy-complete-button>submit</tangy-complete-button>`
            },
            {
              id: 'item3',
              title: 'Item 3 - Summary',
              summary: true,
              hideNextButton: true,
              hideBackButton: true,
              fileContents: `Thanks for filling out our form!`
            }
          ]
        }
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.store = Redux.createStore(
      tangyFormEditorReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
    this.unsubscribe = this.store.subscribe(this.render.bind(this))
    this.store.dispatch({type: 'FORM_OPEN', payload: this.state})
  }

  render() {
    const state = this.store.getState()
    if (state.openItem === '') { 
      // Unbind event listeners.
      if (this.$.container.innerHTML !== '') {
        this.$.container
          .querySelector('.item-create')
          .removeEventListener('click', this.onItemCreateClick.bind(this))
        this.$.container
          .querySelector('sortable-list')
          .removeEventListener('sort-finish', this.onSortFinish.bind(this))
        this.$.container
          .querySelectorAll('.edit-item')
          .forEach(item => item.addEventListener('click', this.onSortableClick.bind(this)))
      }
      this.innerHTML = ``
      this.$.container.innerHTML = `
        <paper-input label="Form Title" value="${state.form.title}"></paper-input>
        <paper-icon-button
            icon="add-circle-outline"
            class="item-create">
        </paper-icon-button>

        <sortable-list>
        ${state.items.map(item => `
          <paper-card
            class="sortable"
            data-item-id="${item.id}"
            data-item-title="${item.title}">
            <div class="card-content">
              <h2>${item.title}</h2>
            </div>
            <div class="card-actions">
              <paper-icon-button
                icon="editor:drag-handle">
              </paper-icon-button>
              <paper-icon-button
                class="edit-item"
                data-item-id="${item.id}"
                icon="editor:mode-edit">
              </paper-icon-button>
            </div>
          </paper-card>
        `).join('')}
        </sortable-list>
              </div>
            </div>
          </paper-card>
        </div>
      `
      // Bind event listeners.
      this.$.container
        .querySelector('sortable-list')
        .addEventListener('sort-finish', this.onSortFinish.bind(this))
      this.$.container
        .querySelectorAll('.edit-item')
        .forEach(item => item.addEventListener('click', this.onSortableClick.bind(this)))
      this.$.container
        .querySelector('.item-create')
        .addEventListener('click', this.onItemCreateClick.bind(this))
    } else {
      this.$.container.innerHTML = ''
      this.innerHTML = `
        <tangy-item-editor></tangy-item-editor>
      `
      //this.querySelector('tangy-item-editor').addEventListener
      this.querySelector('tangy-item-editor').item = state.items.find(item => item.id === state.openItem)
      this.querySelector('tangy-item-editor').addEventListener('save', this.onItemEditorSave.bind(this))
      this.querySelector('tangy-item-editor').addEventListener('close', this.onItemEditorClose.bind(this))
    }
  }

  onItemEditorSave(event) {
    this.store.dispatch({type: 'ITEM_UPDATE', payload: event.detail})
  }

  onItemEditorClose(event) {
    this.store.dispatch({type: 'ITEM_CLOSE'})

  }

  onItemCreateClick() {
    this.store.dispatch({type: 'ITEM_CREATE'})
  }

  onSortFinish(event) {
    this.store.dispatch({
      type: 'SORT_ITEMS', 
      payload: [].slice.call(this.$.container.querySelectorAll('.sortable'))
        .map(sortableEl => sortableEl.dataset.itemId)
    })
  }

  onSortableClick(event) {
    this.store.dispatch({
      type: 'ITEM_OPEN',
      payload: event.target.dataset.itemId
    })
  }

}
window.customElements.define(TangyFormEditor.is, TangyFormEditor);
