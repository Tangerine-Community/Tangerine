import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import './tangy-editor-file-list.js'
import '../tangy-form/cat.js'
import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
import '../../node_modules/sortable-list/sortable-list.js';
import '../tangy-form/tangy-form.js';
// import '../tangy-textarea/tangy-textarea.js';
import '../tangy-acasi/tangy-acasi.js';
import '../tangy-form/tangy-common-styles.js'
import {tangyFormReducer} from "../tangy-form/tangy-form-reducer.js";
import {tangyReduxMiddlewareTangyHook} from "../tangy-form/tangy-form-redux-middleware.js";
import {TangyFormResponseModel} from "../tangy-form/tangy-form-response-model.js";
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

class TangyEditorApp extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style>
      :host {
        display: block;
        color: var(--primary-text-color);
        font-size: medium;
      }
      h2 {
        padding: 15px 0px 0px 20px;
        margin: 0px;
        color: #444;
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
        /*margin:auto;*/
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
      paper-button {
        font-family: 'Roboto', 'Noto', sans-serif;
        font-weight: normal;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
      }
      paper-button.indigo {
        background-color: var(--paper-indigo-500);
        color: white;
        --paper-button-raised-keyboard-focus: {
          background-color: var(--paper-pink-a200) !important;
          color: white !important;
        };
      }
      paper-button.indigo:hover {
        background-color: var(--paper-indigo-400);
      }
      paper-button.green {
        background-color: var(--paper-green-500);
        color: white;
      }
      paper-button.green[active] {
        background-color: var(--paper-red-500);
      }
      juicy-ace-editor {
        height: 100vh;
      }
    </style>
    <div class="tangy-form-app--container">

      <div id="form-list">
        <h2> Forms </h2>
        <template is="dom-repeat" items="{{forms}}">
            <paper-card class="form-link" alt="[[item.title]]" heading="[[item.title]]">
                <div class="card-actions">
                  <a href="#form=[[item.src]]" on-click="formSelected">
                    <paper-button>
                      <iron-icon icon="icons:launch">
                    </iron-icon></paper-button>
                  </a>
                  <a href="#form=[[item.src]]&edit=1" on-click="formSelected">
                    <paper-button>
                        <iron-icon icon="icons:settings"/>
                    </paper-button>
                  </a>
                  <!-- <a href="../../../csv/[[groupId]]/[[item.id]]">Download CSV</a> -->
                  <a href="../../../csv/byPeriodAndFormId/[[groupId]]/[[item.id]]">Download CSV</a>
                </div>
            </paper-card>
        </template>
        <template is="dom-repeat" items="{{editorForms}}">
          <paper-card class="form-link" alt="[[item.title]]" heading="[[item.title]]">
            <div class="card-actions">
              <a href="#form=editor/[[item.src]]&new=1" on-click="formSelected">
                <paper-button>
                  <iron-icon icon="icons:settings"/>
                </paper-button>
                  </a>
                </div>
            </paper-card>
        </template>
        <h2> Configuration </h2>
        <tangy-editor-file-list group-id="{{groupId}}"></tangy-editor-file-list>
      </div>

      <!--<div id="form-view" hidden="">-->
        <!--<div id="form-view&#45;&#45;nav">-->
          <!--&lt;!&ndash; a href="/tangy-forms/index.html"><iron-icon icon="icons:close"></iron-icon></a&ndash;&gt;-->
          <!--[[formTitle]]-->
        <!--</div>-->
        <!--<slot></slot>-->
      <!--</div>-->

      <div id="form-view" hidden="">
        <paper-icon-button mini id="new-response-button" on-click="onClickNewResponseButton" icon="icons:add"></paper-icon-button>
        <div id="form-container"></div>
      </div>

      <div id="form-editor">

        <!-- FORM ITEM LISTING -->
        <div id="form-item-listing" hidden style="float:left">
          <paper-card class="form-editor-link" style="width: 250px" alt="[[headerTitle]]" heading="[[headerTitle]]">
            <div class="card-actions">
              <div class="horizontal justified">
              <a href="../tangy-forms/editor.html" on-click="formSelected"><paper-icon-button icon="home" on-click="showFormsList"></paper-icon-button></a>
              <paper-icon-button
                  icon="add-circle-outline"
                  data-form-src="[[formHtmlPath]]"
                  data-item-title="New Item"
                  data-item-src='form-metadata.html'
                  data-item-order=null
                  on-click="createFormItemListener">
              </paper-icon-button>
              <paper-icon-button
                  icon="assignment"
                  data-form-src="[[formHtmlPath]]"
                  data-item-title="Edit form.html"
                  data-item-src='form-metadata.html'
                  data-item-order=null
                  on-click="editFormListener">
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
                      style="border: solid #CCC; border-width: 0px 0px 0px 5px; margin: 5px 0px 0px 0px; width: 215px; padding: 0px 0px 0px 5px;"
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

        <!-- FORM HTML EDIT -->
        <div id="edit-region">
        </div>

        <!-- ITEM EDIT -->
        <div id="item-edit" hidden>
          <div style="width: 500px;margin-left: auto; margin-right: auto;">
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
              <form id="itemEditor">
                <paper-input id="itemTitle" value="{{itemTitle}}" label="title" always-float-label></paper-input>
                <paper-button id="switchEditorButton" raised class="indigo" on-click="switchEditor">Switch editor</paper-button> Save before switching or your changes will be deleted.
                <p>&nbsp;</p>
                <!--<tangy-textarea value="{{itemHtmlText}}"></tangy-textarea>-->
                <!--<div id="editorCK"></div>-->
              </form>
            </div>
          </div>
        </div>

        <!-- ITEM CREATE -->
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
              <paper-button id="switchEditorButton" raised class="indigo" on-click="switchEditor">Switch editor</paper-button> Save before switching or your changes will be deleted.
              <p>&nbsp;</p>
            </form>
          </div>
        </div>

      </div>

    </div>
`;
  }

  static get is() { return 'tangy-editor-app'; }

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
      },
      groupId: {
        type: String,
        value: '',
      },
    };
  }

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

  connectedCallback() {
    super.connectedCallback();
    if (typeof Tangy === 'undefined') {
      // Tangy is a global to store editor settings
      window.Tangy = {
        defaultEditorUI:'ace', // default editor instance - ace, ckeditor4
        currentEditorUI:'',  // current editor in-use - this is changed by the swithc button between the Ace plaintext editor and ckeditor.
        ace:null, // stores the current Ace editor instance, used for copying data.
      }
    }
    // Get params from hash.
    let params = window.getHashParams()
    let query = this.parseQuery(window.location.hash)
    let formPath = query.form
    this.formPath = formPath
    // @TODO: formPath is not formId.
    this.formId = formPath
    let edit = query.edit
    let newForm = query.new
    this.groupId = window.location.pathname.split("/")[2];
    let responseId = (params.hasOwnProperty('response_id')) ? params.response_id : undefined

    if (formPath) {
      let formDirectory = formPath.substring(0, formPath.lastIndexOf('\/')) + '/'
      // console.log(`Setting <base> path using form directory: ${formDirectory}`)
      // window['base-path-loader'].innerHTML = `<base href="${formDirectory}">`
      if (edit) {
        this.showFormEditor(query.form)
      } else if (newForm) {
        this.showFormEditor(query.form, 'newForm')
      } else {
      this.loadForm(query.form, responseId)
      }
      this.addEventListener('tangy-form-item-list-opened', () => window['tangy-form-app-loading'].innerHTML = '')
    } else {
      this.showFormsList()
      this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')
    }
    this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')

    // Remove loading screen.
    window['tangy-form-app-loading'].innerHTML = ''

    Tangy.currentEditorUI = 'ace'

    Tangy.ace = ace.edit("editorTEXT");
    Tangy.ace.session.setMode("ace/mode/html");
    Tangy.ace.session.setUseWrapMode(true)
    Tangy.ace.setOptions({
      autoScrollEditorIntoView: true,
      minLines: 10,
      maxLines: 40
    });
    // Tangy.ace.renderer.setScrollMargin(10, 10, 10, 10);

    CKEDITOR.on('dialogDefinition', function(e) {
      var dialogName = e.data.name;
      var dialogDefinition = e.data.definition;
      dialogDefinition.onShow = function() {
        this.move(this.getPosition().x,0); // Top center
      }
    })

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
      body: JSON.stringify(formOrderObj),
      credentials: 'include'
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
    // Load forms list.
    let formsJsonPath = '../content/forms.json'
    if (this.groupId) {
      formsJsonPath = '../../groups/' + this.groupId + '/forms.json'
    }
    try {
    let formsJson = await fetch(formsJsonPath, {credentials: 'include'})
    this.forms = await formsJson.json()
    } catch (e) {
      let formsJson = await fetch('../content/forms.json')
      this.forms = await formsJson.json()
    }
    // Add some hard coded forms that are not listed in forms.json.
    this.forms.push({
      "id": "user-profile",
      "title": "User Profile",
      "src": "../content/user-profile/form.html"
    })
    this.forms.push({
      "id": "reports",
      "title": "Reports",
      "src": "../content/reports/form.html"
    })
    // Load editor forms
    let editorJson = await fetch('editor/editor-forms.json', {credentials: 'include'})
    this.editorForms = await editorJson.json()
    window['tangy-form-app-loading'].innerHTML = ''
  }

  onFormSrcChange(newValue, oldValue) {
    if (newValue !== '') this.loadForm(newValue)
  }

  async showFormListener(event) {
    window.location.hash = event.currentTarget.dataFormSrc
    this.formSrc = event.currentTarget.dataFormSrc
  }

  async editFormListener(event) {
    // Hide other regions.
    let content = document.querySelector("#content")
    content.setAttribute('style', 'display:none;')
    this.$['item-create'].setAttribute('hidden', true)
    this.$['item-edit'].setAttribute('hidden', true)
    this.$['edit-region'].removeAttribute('hidden')
    // Set the content in the edit region.
    this.$['edit-region'].innerHTML = `
      <div class="horizontal justified" style="text-align: right">
        <paper-button class="save-button">
          <iron-icon icon="icons:save"/>
        </paper-button>
      </div>
      <juicy-ace-editor> </juicy-ace-editor>
    `
    // Set the ace editor contents.
    let res = await fetch(this.formPath, {credentials: 'include'})
    const formHtml = await res.text()
    this.$['edit-region'].querySelector('juicy-ace-editor').value = formHtml
    // Listen for save.
    this.$['edit-region'].querySelector('.save-button').addEventListener('click', async ev => {
      await fetch("/editor/file/save", {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
          fileContents: this.$['edit-region'].querySelector('juicy-ace-editor').value,
          filePath: this.formPath.replace('../content/', ''),
          groupId: this.groupId
        }),
        credentials: 'include'
      })
      alert('Form saved.')
    })
  }

  async editFormItemListener(event) {
//        window.location.hash = event.currentTarget.dataFormSrc
    this.$['edit-region'].innerHTML = ''
    this.formHtmlPath = event.currentTarget.dataFormSrc
    this.itemFilename = event.currentTarget.dataItemSrc
    this.itemId = event.currentTarget.dataItemId
    // this.itemOrder = event.currentTarget.dataItemOrder
    this.itemTitle = event.currentTarget.dataItemTitle
    if (this.itemFilename !== '') this.editItem(this.itemFilename)
  }
  async createFormItemListener(event) {
//        window.location.hash = event.currentTarget.dataFormSrc
    this.$['edit-region'].setAttribute('hidden', true)
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

  async loadForm(formSrc, responseId) {
    let query = this.parseQuery(window.location.hash)
    this.$['form-view'].hidden = false
    this.$['form-item-listing'].hidden = true
    this.$['item-edit'].hidden = true
    this.$['form-list'].hidden = true
    this.$['item-create'].hidden = true
    // Load the form into the DOM.
    // let formsPath = '../../groups/' + this.groupId + '/' + formSrc
    let formsPath = '../../groups/' + this.groupId + '/' + formSrc.replace('../content/', '')

    let formHtml = await fetch(formsPath, {credentials: 'include'})
    // Put the formHtml in a template first so element do not initialize connectedCallback
    // before we modify them.
    // let formTemplate = document.createElement('div')
    // formTemplate.innerHTML = await formHtml.text()
    // let formEl = formTemplate.querySelector('tangy-form')
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
  async showFormEditor(formSrc, isNew) {
    this.$['form-view'].hidden = true
    this.$['form-item-listing'].hidden = false
    this.$['item-edit'].hidden = true
    this.$['form-list'].hidden = true
    this.$['item-create'].hidden = true
    document.querySelector("#content").setAttribute('style', 'display:none;')
    // Load the form into a temp DOM to get stuff out of it
    let formHtml = await fetch(formSrc, {credentials: 'include'})
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

    // reset the ckeditor instance
    let inlineEditor = document.querySelector("#editorCK")
    inlineEditor.setAttribute( 'contenteditable', false );
    if (typeof CKEDITOR.instances.editorCK !== 'undefined') {
      CKEDITOR.instances.editorCK.destroy();
    }

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
    content.setAttribute('style', 'display:block;')
    let tangyEditorApp = document.querySelector("tangy-editor-app")
    tangyEditorApp.setAttribute('style', 'min-height:0vh')
    let html
    // Check if this is a new item
    if (isNewForm !== true) {
      if (isNewItem === true) {
        this.headerTitle = "New Item"
        html = '<p>&nbsp;</p>'
      } else {
        this.headerTitle = "Edit Item"
        // Load the form into the DOM.
        // todo try to grab local pouch version of item
        let itemHtml = await fetch(itemSrc, {credentials: 'include'})
        this.itemHtmlText = await itemHtml.text()
        // console.log("itemHtmlText: " + JSON.stringify(this.itemHtmlText))

        if (this.itemHtmlText === '') {
          html ='<p>&nbsp;</p>'
        } else {
          // CKEDITOR.setData(this.itemHtmlText)
          html = this.itemHtmlText
        }
      }
    } else {
      this.headerTitle = "Create Form"
      this.itemHtmlText = '<p>&nbsp;</p>\n'
      html = this.itemHtmlText
      // this.itemOrder = null
      this.itemOrderDisabled = true;
    }
    // Set the text in the editors
    // Also provide this code to the textarea so you can edit raw code.
    Tangy.ace.setValue(html);
    inlineEditor.innerHTML = html

    let contentEditable = inlineEditor.getAttribute( 'contenteditable')
    if (contentEditable === 'false') {
      inlineEditor.setAttribute( 'contenteditable', true );
      let editor = CKEDITOR.inline( 'editorCK', {
        // Allow some non-standard markup that we used in the introduction.
        // extraAllowedContent: 'a(documentation);abbr[title];code',
        allowedContent: true,
        // fillEmptyBlocks: false,
        // ignoreEmptyParagraph: true,
        // Use disableAutoInline when explicitly using CKEDITOR.inline( 'editorCK' );
        disableAutoInline: true,
        // Show toolbar on startup (optional).
        startupFocus: true
      } );
      // editor.on( 'change', function( evt ) {
      //   // getData() returns CKEditor's HTML content.
      //   let data = evt.editor.getData();
      //   console.log( 'Total bytes: ' + data.length + " data: " + data);
      //   // Tangy.ace.setValue(data);
      // });
    }
  }
  async saveItem(event) {
    let item = {}, itemHtmlText
    const group = window.location.pathname.split("/")[2];
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
    if (Tangy.currentEditorUI === 'ckeditor5') {
      itemHtmlText = Tangy.editor.getData();
    } else if (Tangy.currentEditorUI === 'ckeditor4') {
      itemHtmlText = CKEDITOR.instances.editorCK.getData();
    } else {
      // let textarea = document.querySelector("#editorTEXT")
      // itemHtmlText = textarea.value
      itemHtmlText = Tangy.ace.getValue();

    }
//        this.itemHtmlText = event.currentTarget.parentElement.children[0].value
    item.groupName = group
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
        //'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(item),
      credentials: 'include'
    }).then(function(response) {
      if(response.ok) {
        response.json().then(function(data) {
          console.log("result: " + JSON.stringify(data))
          if (data.displayFormsListing === true) {
            location.href = '../tangy-forms/editor.html'
          } else {
            location.reload()
          }
        });
      }
    })
  }

  onClickNewResponseButton() {
    let confirmation = confirm("Are you sure you want to start a form response?")
    if (confirmation) {
      let params = getHashParams()
      this.loadForm(params.form)
    }
  }

  switchEditor() {
    // cke_editorCK
    let ckeditor = document.querySelector("#editorCK")
    let aceEditor = document.querySelector("#editorTEXT")
    let switchEditorButton = this.shadowRoot.querySelector("#switchEditorButton")
    console.log("switch the editor from " + Tangy.currentEditorUI)

    if (Tangy.currentEditorUI === 'ckeditor5' || Tangy.currentEditorUI === 'ckeditor4') {
      Tangy.currentEditorUI = 'ace'
      ckeditor.hidden = true
      aceEditor.hidden = false
      aceEditor.style.width = '600px'
      aceEditor.style.height = '200px'
      aceEditor.style.display = 'block'
      switchEditorButton.className = 'indigo'
      // let data = CKEDITOR.instances.editorCK.getData();
      let data = this.itemHtmlText
      // console.log( 'Total bytes: ' + data.length + " data: " + data);
      Tangy.ace.setValue(data);
    } else {
      Tangy.currentEditorUI = 'ckeditor4'
      ckeditor.hidden = false
      ckeditor.style.display = 'block'
      aceEditor.style.display = 'none'
      switchEditorButton.className = 'green'
      // let data = Tangy.ace.getValue();
      let data = this.itemHtmlText
      // console.log( 'Total bytes: ' + data.length + " data: " + data);
      CKEDITOR.instances.editorCK.setData(data);
    }

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
window.customElements.define(TangyEditorApp.is, TangyEditorApp);
