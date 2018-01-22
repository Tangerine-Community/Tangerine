import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../node_modules/sortable-list/sortable-list.js';
import '../tangy-form/tangy-form.js';
import '../tangy-textarea/tangy-textarea.js';
import '../tangy-acasi/tangy-acasi.js';
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
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
      }
      .form-link {
        padding: 15px;
        margin: 15px;
      }
      .form-editor-link {
        /*margin: 15px;*/
      }
      .settings {
        position: relative;
        /*left: 45px;*/
        top: 8px;
        margin:auto;
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
     .card-actions {
        border-top: 1px solid #e8e8e8;
        border-bottom: 1px solid #e8e8e8;
        padding: 5px 16px;
        position: relative; 
        background-color: #e8e8e8;        
      }
     .item-edit {
        border-top: 1px solid #e8e8e8;
        border-bottom: 1px solid #e8e8e8;
        padding: 5px 16px;
        position: relative; 
      }
     #save-order {
        border-top: 1px solid #e8e8e8;
        border-bottom: 1px solid #e8e8e8;
        padding: 2px 2px;
        position: relative; 
        text-align: center;  
        background-color: pink;
      }
      paper-icon-button.small {
      width: 30px;
      height: 30px;
      }
    </style>
    <div class="tangy-form-app--container">

      <div id="form-list">
        <template is="dom-repeat" items="{{forms}}">
            <paper-card class="form-link" alt="[[item.title]]" heading="[[item.title]]">
                <div class="card-actions">
                  <a href="#form=[[item.src]]" on-click="formSelected">
                    <paper-button class="launch-form">
                      <iron-icon icon="icons:launch">
                    </iron-icon></paper-button>
                  </a>
                    <a href="#form=[[item.src]]&edit=1" on-click="formSelected">
                    <paper-button class="settings">
                        <iron-icon icon="icons:settings"/>
                    </paper-button>
                    </a>
                </div>
            </paper-card>
        </template>
        <template is="dom-repeat" items="{{editorForms}}">
          <paper-card class="form-link" alt="[[item.title]]" heading="[[item.title]]">
            <div class="card-actions">
              <a href="#form=editor/[[item.src]]&new=1" on-click="formSelected">
                <paper-button class="settings">
                  <iron-icon icon="icons:settings"/>
                </paper-button>
                  </a>
                </div>
            </paper-card>
        </template>
      </div>

      <div id="form-view" hidden="">
        <div id="form-view--nav">
          <!-- a href="/tangy-forms/index.html"><iron-icon icon="icons:close"></iron-icon></a-->
          [[formTitle]]
        </div>
        <slot></slot>
      </div>
      <div id="form-editor">
        <div id="form-item-listing" hidden style="max-width: 200px; float:left">
              <!--<paper-icon-button icon="menu" onclick="drawer.toggle()"></paper-icon-button>-->
          <paper-card class="form-editor-link" alt="[[headerTitle]]" heading="[[headerTitle]]">
            <div class="card-actions">
              <div class="horizontal justified">
              <a href="../tangy-forms" on-click="formSelected"><paper-icon-button icon="home" on-click="showFormsList"></paper-icon-button></a>
              <paper-icon-button
                  icon="add-circle-outline"
                  data-form-src="[[formHtmlPath]]"
                  data-item-title="New Item"
                  data-item-src='form-metadata.html'
                  data-item-order=null
                  on-click="createFormItemListener">
              </paper-icon-button>
              </div>
            </div>
            <div id="save-order" hidden>
              Save Order: <paper-icon-button
                  icon="save"
                  data-item-order="[[itemsOrder]]"
                  class="small"
                  on-click="saveItemsOrder">
              </paper-icon-button>
            </div>
            <div class="card-content">
            <template is="dom-if" if="{{items.size > 1}}">
              <div role="listbox">
              <sortable-list on-sort-finish="onSortFinish" sortable=".sortable">
              <template is="dom-repeat" items="{{items}}">
                  <paper-item-body
                      one-line
                      class="sortable"
                      on-click="editFormItemListener"
                      data-item-id="[[item.id]]"
                      data-form-src="[[item.formSrc]]"
                      data-item-src="[[item.src]]"
                      data-item-title="[[item.title]]">
                    <div>[[item.title]]</div>
                    <!--<div secondary>[[item.src]]</div>-->
                  </paper-item-body>
              </template>
              </sortable-list>
              </div>
            </template>
          </div>
          </paper-card>
        </div>
        <div id="item-edit" hidden>
        <!--<paper-card  style="width: 600px;margin-left: auto; margin-right: auto;">-->
        <div style="width: 600px;margin-left: auto; margin-right: auto;">
          <div class="item-edit">
            <div class="horizontal justified" style="text-align: right">
              <paper-button
                      data-item-src="[[itemFilename]]"
                      data-item-id="[[itemId]]"
                      on-tap="saveItem">
                <iron-icon icon="icons:save"/>
              </paper-button>
            </div>
          </div>        
          <div class="card-content">
            <!--<div style="width: 600px;margin-left: auto; margin-right: auto;">-->
              <form id="itemEditor">
                <paper-input id="itemTitle" value="{{itemTitle}}" label="title" always-float-label></paper-input>
                <tangy-textarea value="{{itemHtmlText}}"></tangy-textarea>
              </form>
            </div>
          </div>
          <!--</paper-card>-->
        </div>
      <div id="item-create" hidden>
          <div style="width: 600px;margin-left: auto; margin-right: auto;">
            <form id="itemEditor">
              <div class="item-edit">
                <div class="horizontal justified" style="text-align: right">
                  <paper-button
                          data-form-src="[[formHtmlPath]]"
                          data-item-src="[[itemFilename]]"
                          data-item-id="[[itemId]]"
                          on-tap="saveItem">
                    <iron-icon icon="icons:save"/>
                  </paper-button>
                </div>
              </div>          
              <paper-input id="formTitle" value="{{formTitle}}" label="form title"  always-float-label></paper-input>
              <paper-input id="formName" value="{{formName}}" label="form name (for url)"  always-float-label></paper-input>
              <paper-input id="itemTitle" value="{{itemTitle}}" label="item title"  always-float-label></paper-input>
            </form>
          </div>
      </div>
      </div>

    </div>
`;
  }

  static get is() { return 'tangy-form-app'; }

  static get properties() {
    return {
      database: {
        type: String,
        value: 'tangy-form'
      },
      forms: {
        type: Array,
        value: []
      },
      items: {
        type: Array,
        value: []
      },
      editorForms: {
        type: Array,
        value: []
      },
      headerTitle: {
        type: String,
        value: '',
      },
      form: {
        type: Object,
      },
      formSrc: {  // path to form.html, used in Form listing.
        type: String,
        value: '',
        observer: 'onFormSrcChange'
      },
      formTitle: {  // Title of form, used in Form listing.
        type: String,
        value: '',
      },
      formName: {  // folder name for form, used to create the formSrc for Form listing.
        type: String,
        value: '',
      },
      formHtmlPath: { // path to form.html - e.g.: "formHtmlPath":"forms/lemmie/form.html"
        type: String,
        value: '',
      },
      itemFilename: { // "itemFilename":"item-1.html",
        type: String,
        value: '',
      },
      itemId: { // "itemId":"item-1"
        type: String,
        value: '',
      },
      itemHtml: { // id of textarea for html content
        type: String,
        value: '',
      },
      itemHtmlText: { // html code from textarea
        type: String,
        value: '',
      },
      itemTitle: { // "itemTitle":"ACASI Part 3: Introduction"
        type: String,
        value: '',
      },
      // itemOrder: {  // item order in form
      //   type: Number,
      //   value: '',
      // },
      itemsOrder: {  // item order in form
        type: Number,
        value: '',
      },
      itemOrderDisabled: {  // item order in form
        type: Boolean,
        value: true,
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    if (typeof Tangy === 'undefined') {
      window.Tangy = {}
    }
    let query = this.parseQuery(window.location.hash)
    let formPath = query.form
    let edit = query.edit
    let newForm = query.new
    if (formPath) {
      let formDirectory = formPath.substring(0, formPath.lastIndexOf('\/')) + '/'
      // console.log(`Setting <base> path using form directory: ${formDirectory}`)
      // window['base-path-loader'].innerHTML = `<base href="${formDirectory}">`
      if (edit) {
        this.showFormEditor(query.form)
      } else if (newForm) {
        this.showFormEditor(query.form, 'newForm')
      } else {
      this.showForm(query.form)
      }
      this.addEventListener('tangy-form-item-list-opened', () => window['tangy-form-app-loading'].innerHTML = '')
    } else {
      this.showFormsList()
      this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')
    }
    this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')
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

  onSortFinish(event) {
    const sortedItem = event.detail.target;
    // console.log('sortedItem: ' + sortedItem)
    let items = event.currentTarget.children
    let sortedItems = []
    for (let item of items) {
      let itemSrc = item.dataItemSrc
      sortedItems.push(itemSrc)
    }
    this.itemsOrder = sortedItems
    this.$['save-order'].hidden = false
    console.log("sortedItems: " + sortedItems)
  }
  async saveItemsOrder(event) {
    let that = this
    let formOrderObj = {
      itemsOrder: this.itemsOrder,
      formHtmlPath: this.formHtmlPath
    }
    console.log("formOrderObj" + JSON.stringify(formOrderObj))
    let result = await fetch("/editor/itemsOrder/save", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(formOrderObj)
    }).then(function(response) {
      if(response.ok) {
        response.json().then(function(data) {
          console.log("result: " + JSON.stringify(data))
          that.$['save-order'].hidden = true
          that.itemsOrder = null
        });
      }
    })
  }
  async showFormsList() {
    this.$['form-view'].hidden = true
    this.$['form-list'].hidden = false
    this.$['form-item-listing'].hidden = true
    this.$['item-edit'].hidden = true
    this.$['item-create'].hidden = true
    document.querySelector("#content").setAttribute('style', 'display:none;')
    // Must reset base href path in case user is not currently at tangy-forms root.
    // window['base-path-loader'].innerHTML = `<base href="/tangy-forms">`
    // Load forms list.
    let formsJson = await fetch('../content/forms.json')
    this.forms = await formsJson.json()
    // Load editor forms
    let editorJson = await fetch('editor/editor-forms.json')
    this.editorForms = await editorJson.json()
    window['tangy-form-app-loading'].innerHTML = ''
  }

  onFormSrcChange(newValue, oldValue) {
    if (newValue !== '') this.showForm(newValue)
  }

  async showFormListener(event) {
    window.location.hash = event.currentTarget.dataFormSrc
    this.formSrc = event.currentTarget.dataFormSrc
  }
  async editFormListener(event) {
//        window.location.hash = event.currentTarget.dataFormSrc
    this.formHtmlPath = event.currentTarget.dataFormSrc
    this.showFormEditor(this.formHtmlPath)
  }
  async editFormItemListener(event) {
//        window.location.hash = event.currentTarget.dataFormSrc
    this.formHtmlPath = event.currentTarget.dataFormSrc
    this.itemFilename = event.currentTarget.dataItemSrc
    this.itemId = event.currentTarget.dataItemId
    // this.itemOrder = event.currentTarget.dataItemOrder
    this.itemTitle = event.currentTarget.dataItemTitle
    if (this.itemFilename !== '') this.editItem(this.itemFilename)
  }
  async createFormItemListener(event) {
//        window.location.hash = event.currentTarget.dataFormSrc
    let query = this.parseQuery(window.location.hash)
    let formPath = query.form
    this.formHtmlPath = formPath
    this.itemFilename = event.currentTarget.dataItemSrc
    this.itemId = event.currentTarget.dataItemId
    // this.itemOrder = event.currentTarget.dataItemOrder
    this.itemTitle = event.currentTarget.dataItemTitle
    this.itemSrc = event.currentTarget.dataset.itemSrc
    let newItem
    if (this.itemSrc === 'form-metadata.html') {
      newItem = true
    }
    if (this.itemSrc !== '') this.editItem(this.itemSrc, null, newItem)
  }

  formSelected(ev) {
    location.reload()
  }

  async showForm(formSrc) {
    let query = this.parseQuery(window.location.hash)
    this.$['form-view'].hidden = false
    this.$['form-item-listing'].hidden = true
    this.$['item-edit'].hidden = true
    this.$['form-list'].hidden = true
    this.$['item-create'].hidden = true
    // Load the form into the DOM.
    let formHtml = await fetch(formSrc)
    // Put the formHtml in a template first so element do not initialize connectedCallback
    // before we modify them.
    let formTemplate = document.createElement('div')
    formTemplate.innerHTML = await formHtml.text()
    let formEl = formTemplate.querySelector('tangy-form')
    if (query.database) formEl.setAttribute('database-name', query.database)
    if (query['linear-mode']) formEl.setAttribute('linear-mode', true)
    if (query['response-id']) formEl.setAttribute('response-id', query['response-id'])
    if (query['hide-closed-items']) formEl.setAttribute('hide-closed-items', true)
    if (query['hide-nav']) formEl.setAttribute('hide-nav', true)
    if (query['hide-responses']) formEl.setAttribute('hide-responses', true)
    // this.innerHTML = formTemplate.innerHTML
    // let tangyForm = this.querySelector('tangy-form')
    this.shadowRoot.innerHTML = formTemplate.innerHTML
    let tangyForm = this.shadowRoot.querySelector('tangy-form')
    tangyForm.addEventListener('ALL_ITEMS_CLOSED', () => {
      if (parent && parent.frames && parent.frames.ifr) {
        parent.frames.ifr.dispatchEvent(new CustomEvent('ALL_ITEMS_CLOSED'))
      }
    })
    window['tangy-form-app-loading'].innerHTML = ''
  }
  async showFormEditor(formSrc, isNew) {
    this.$['form-view'].hidden = true
    this.$['form-item-listing'].hidden = false
    this.$['item-edit'].hidden = true
    this.$['form-list'].hidden = true
    this.$['item-create'].hidden = true
    document.querySelector("#content").setAttribute('style', 'display:none;')
    // Load the form into a temp DOM to get stuff out of it
    let formHtml = await fetch(formSrc)
    let innerHTML = await formHtml.text()
    this.form = innerHTML
    var doc = document.implementation.createHTMLDocument("New Document");
    doc.documentElement.innerHTML = innerHTML;
    let itemsNode = doc.querySelectorAll("tangy-form-item");
    this.items = []
    for (let node of itemsNode) {
      let item = {}
      item.id = node.getAttribute('id')
      item.src = node.getAttribute('src')
      item.title = node.getAttribute('title')
      // item.itemOrder = node.getAttribute('itemOrder')
      item.formSrc = formSrc
      this.items.push(item)
    }
    if (isNew) {
      this.headerTitle = "New form"
      // this.createFormItemListener()
      let query = this.parseQuery(window.location.hash)
      let formPath = query.form
      this.formHtmlPath = formPath
      this.editItem(this.formHtmlPath, true)
    } else {
      this.headerTitle = "Item Listing"
    }
    this.dispatchEvent(new CustomEvent('tangy-form-item-list-opened', {bubbles: true}))
  }
  /**
   * This can be used to create new items or edit items.
   * @param itemSrc
   * @param isNewForm
   * @returns {Promise.<void>}
   */
  async editItem(itemSrc, isNewForm, isNewItem) {
    this.$['form-view'].hidden = true
    this.$['form-item-listing'].hidden = false
    this.$['form-list'].hidden = true
    if (isNewForm !== true) {
      this.$['item-edit'].hidden = false
      this.$['item-create'].hidden = true
    } else {
      this.$['item-edit'].hidden = true
      this.$['item-create'].hidden = false
    }
    let content = document.querySelector("#content")
    content.setAttribute('style', 'display:block;width: 600px;margin-left: auto; margin-right: auto;')
    let tangyFormApp = document.querySelector("tangy-form-app")
    tangyFormApp.setAttribute('style', 'min-height:0vh')
    // Check if this is a new item
    if (isNewForm !== true) {
      if (isNewItem === true) {
        this.headerTitle = "New Item"
        Tangy.editor.setData('<p>&nbsp;</p>')
      } else {
        this.headerTitle = "Edit Item"
        // Load the form into the DOM.
        // todo try to grab local pouch version of item
        let itemHtml = await fetch(itemSrc)
        this.itemHtmlText = await itemHtml.text()
        // console.log("itemHtmlText: " + JSON.stringify(this.itemHtmlText))
        if (this.itemHtmlText === '') {
          Tangy.editor.setData('<p>&nbsp;</p>')
        } else {
          Tangy.editor.setData(this.itemHtmlText)
          // Tangy.editor.setData("bla bla bla")
        }
      }
    } else {
      Tangy.editor.setData('<p>&nbsp;</p>')
      this.headerTitle = "Create Form"
      this.itemHtmlText = ''
      // this.itemOrder = null
      this.itemOrderDisabled = true;
    }
  }
  async saveItem(event) {
    let item = {}
    const project = window.location.pathname.split("/")[3];
    if ((typeof event.currentTarget.dataItemSrc !== 'undefined') && (event.currentTarget.dataItemSrc !== '')) {
      // editing a current item
      this.itemFilename = event.currentTarget.dataItemSrc
      this.itemId = event.currentTarget.dataItemId
    } else {
      if (event.currentTarget.dataItemSrc === '') {
        // This is a new form
        this.formHtmlPath = null
      }
      // populate a new item
      const uuid = TangyUtils.UUID().generate();
      this.itemFilename = uuid + '.html'
      this.itemId = uuid
      item.formTitle = this.$.formTitle.value
      item.formName = this.$.formName.value
    }
    let itemTitle = this.$.itemTitle.value
    let itemHtmlText = Tangy.editor.getData();
//        this.itemHtmlText = event.currentTarget.parentElement.children[0].value
    item.projectName = project
    item.formHtmlPath = this.formHtmlPath
    item.itemFilename = this.itemFilename
    item.itemId = this.itemId
    item.itemTitle = itemTitle
    item.itemHtmlText = itemHtmlText
    // item.itemOrder = this.$.itemOrder.value
    item.formTitle = this.$.formTitle.value
    // Check if this is a new item
    if (typeof item.itemId == 'undefined') {
      // console.log("item.itemId is undefined: " + item.itemId)
    }
    let result = await fetch("/editor/item/save", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(item)
    }).then(function(response) {
      if(response.ok) {
        response.json().then(function(data) {
          console.log("result: " + JSON.stringify(data))
          if (data.displayFormsListing === true) {
            location.href = '../tangy-forms'
          } else {
            location.reload()
          }
        });
      }
    })
  }
}

class TangyUtils {
  /**
   * Fast UUID generator, RFC4122 version 4 compliant.
   * @author Jeff Ward (jcward.com).
   * @license MIT license
   * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
   **/
  static UUID() {
    'use strict';
    var self = {};
    var lut = [];
    for(var i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    /**
     * Generates a UUID
     * @returns {string}
     */
    self.generate = function () {
      var d0 = Math.random() * 0xffffffff | 0;
      var d1 = Math.random() * 0xffffffff | 0;
      var d2 = Math.random() * 0xffffffff | 0;
      var d3 = Math.random() * 0xffffffff | 0;
      return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };
    return self;
  }
}
window.customElements.define(TangyFormApp.is, TangyFormApp);
