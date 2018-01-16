/* jshint esversion: 6 */

import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import '../../node_modules/@polymer/paper-button/paper-button.js';
import '../../node_modules/@polymer/paper-card/paper-card.js';
import '../../node_modules/@polymer/paper-icon-button/paper-icon-button.js';
import '../../node_modules/@polymer/paper-item/paper-icon-item.js';
import '../../node_modules/@polymer/paper-item/paper-item-body.js';
// import '../../node_modules/sortable-list/sortable-list';
import '../tangy-form/tangy-form.js';
// import '../tangy-textarea/tangy-textarea.js';
// import '../tangy-acasi/tangy-acasi.js';
import {TangyFormService} from "../tangy-form/tangy-form-service";
// import '../../node_modules/s-table/all-imports.js'

/**
 * `tangy-class-app`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyClassApp extends Element {
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
    paper-button.navbutton {
       background-color: var(--paper-blue-500);
       color: white;
    }
    paper-button.navbutton[active] {
      background-color: var(--paper-red-500);
    }
    paper-icon-item.fancy {
      --paper-item-focused: {
        background: var(--paper-amber-500);
        font-weight: bold;
      };
      --paper-item-focused-before: {
        opacity: 0;
      };
    }
    #students {
      margin-left: 10px;
      margin-right: 20px;
    }
    #forms {
    margin:1em;
    }
  
  #container {
    display: grid;
    /*position:fixed*/
    grid-template-columns: 20% 80%;
    background-color: aquamarine;
    margin: 1em;
  }
  
  
  #container-left {
    display: grid;
    position:fixed
    /*grid-template-columns: 20% 80%;*/
    background-color: aquamarine;
  }
  
  #container-right {
    display: grid;
    /*grid-template-columns: 100px 100px 100px 100px 100px;*/
    grid-template-columns: repeat(3, [col] 100px ) ;
    grid-auto-columns: 100px;
    background-color: beige;
  }
  
   /*.box {*/
     /*!*background-color: #444;*!*/
     /*color: #fff;*/
     /*border-radius: 5px;*/
     /*padding: 10px;*/
     /*!*font-size: 150%;*!*/
   /*}*/
   
   .header {
    background-color: #cddc39;
   }
  
  /*.header {*/
    /*padding: 5% 5% 5% 5%;*/
  /*}*/
    </style>
    <div class="tangy-class-app--container">
    
    <div id="admin-menu">
    
      <paper-card class="form-editor-link" alt="[[headerTitle]]" heading="[[headerTitle]]">
        <div class="card-actions">
          <div class="horizontal justified">
          <!--<a href="/tangy-forms" on-click="formSelected"><paper-icon-button icon="home" on-click="showFormsList"></paper-icon-button></a>-->
          <a href="#form=/content/class-forms/form.html" title="Configure Class" on-click="formSelected"><paper-icon-button icon="settings" data-item-title="Configure Class"></paper-icon-button></a>
          </div>
        </div>
      </paper-card>

      <div id="container"> 
        <div id="container-left">
          <div class="box header">Student</div>
          <template is="dom-repeat" items="{{students}}">
                  <div class="box">[[item.student_name]]</div>
          </template>  
        </div>
        <div id="container-right">
          <template is="dom-repeat" items="{{forms}}">
          <div class="box header">[[item.title]]</div>
          </template>
          <template is="dom-repeat" items="{{studentFormsArray}}">
            <template is="dom-repeat" items="{{item.responses}}">
                <div class="box">[[item.responses.length]]</div>
            </template>
          </template>
          
        </div>
      </div>
    </div>

      <div id="form-view" hidden="">
        <div id="form-view--nav">
          <!-- a href="/tangy-forms/index.html"><iron-icon icon="icons:close"></iron-icon></a-->
          [[formTitle]]
        </div>
        <slot></slot>
      </div>
     
    </div>
`;
  }

  static get is() { return 'tangy-class-app'; }

  static get properties() {
    return {
      database: {
        type: String,
        value: 'tangy-form'
      },
      // Configure PouchDB database to be used.
      databaseName: {
        type: String,
        value: 'tangy-form',
        reflectToAttribute: true
      },
      forms: {
        type: Array,
        value: []
      },
      items: {
        type: Array,
        value: []
      },
      classItems: {
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
      students: {
        type: Array,
        value: []
      },
      studentForms: {
        type: Array,
        value: []
      },
      studentFormsArray: {
        type: Array,
        value: []
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (typeof Tangy === 'undefined') {
      window.Tangy = {}
    }
    // kudos: urlParams code from https://stackoverflow.com/a/2880929/6726094
    var urlParams;
    (window.onpopstate = function () {
      var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

      urlParams = {};
      while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
    })();

    let query = this.parseQuery(window.location.hash)
    let formPath = query.form
    let edit = query.edit
    let newForm = query.new
    let path = urlParams.path
    let dashboard = urlParams.dashboard
    let url = formPath
    if (path) {
      url = path
    }
    if (url) {
      let formDirectory = url.substring(0, url.lastIndexOf('\/')) + '/'
      console.log(`Setting <base> path using form directory: ${url}`)
      window['base-path-loader'].innerHTML = `<base href="${url}">`
      if (edit) {
        this.showFormEditor(url)
      } else if (newForm) {
        this.showFormEditor(url, 'newForm')
      } else {
        this.showForm(url)
      }
      this.addEventListener('tangy-form-item-list-opened', () => window['tangy-form-app-loading'].innerHTML = '')
    } else {
      console.log("Making Dashboard the default for the Class demo.")
      dashboard = true
      if (dashboard) {
        this.showDashboard()
        this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')
      } else {
        this.showFormsList()
        this.addEventListener('tangy-form-item-opened', () => window['tangy-form-app-loading'].innerHTML = '')
      }
    }
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

  itemLength(item) {
    console.log("item: " + JSON.stringify(item))
    // return item.responses.length
    return "X"
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
    this.$['admin-menu'].hidden = false
    this.$['form-item-listing'].hidden = true
    this.$['item-edit'].hidden = true
    this.$['item-create'].hidden = true
    document.querySelector("#content").setAttribute('style', 'display:none;')
    // Must reset base href path in case user is not currently at tangy-forms root.
    window['base-path-loader'].innerHTML = `<base href="/tangy-forms">`
    // Load forms list.
    let formsJson = await fetch('../content/forms.json')
    this.forms = await formsJson.json()
    // Load editor forms
    let editorJson = await fetch('/tangy-editor/editor-forms.json')
    this.editorForms = await editorJson.json()
    window['tangy-form-app-loading'].innerHTML = ''
  }

  async showDashboard() {
    this.$['form-view'].hidden = true
    this.$['admin-menu'].hidden = false
    this.headerTitle = "Class Dashboard"
    // Must reset base href path in case user is not currently at tangy-forms root.
    window['base-path-loader'].innerHTML = `<base href="/tangy-forms">`
    // Load forms list.
    let formsJson = await fetch('../content/forms.json')
    this.forms = await formsJson.json()
    // Set up the TangyFormService for interacting with TangyForm and TangyFormResponse docs in the database.
    this.service = new TangyFormService({databaseName: this.databaseName})
    await this.service.initialize()
    let studentRegistrationFormId = 'student-registration'
    this.students = await this.service.getStudentRegistrations(studentRegistrationFormId)
    this.classItems = []
    // this.studentForms = new Map()
    this.studentForms = []
    //populate the studentForms with students and studentForms array.
    for (let student of this.students) {
      let studentId = student._id
      console.log("studentId: " + studentId)
      // let studentForms = []
      // this.studentForms.set(studentId, studentForms)
      let studentResponses = {}
      studentResponses.id = studentId
      studentResponses.responses = []

      for (let form of this.forms) {
        // get the form metadata
        let formSrc = '/content/' + form.src
        let formHtml = await fetch(formSrc)
        let innerHTML = await formHtml.text()
        this.form = innerHTML
        var doc = document.implementation.createHTMLDocument("New Document");
        doc.documentElement.innerHTML = innerHTML;
        // let itemsNode = doc.querySelectorAll("tangy-form-item");
        let formMetadata = doc.querySelector("tangy-form");
        let formId = formMetadata.id
        // get all responses for this form
        let completedForms = []
        // let itemId = item.id
        console.log("getting responses for formId: " + formId)

        try {
          this.responses = await this.service.getResponsesByFormId(formId)
        } catch (e) {
          console.log("e: " + e)
        }
        console.log("formId: " + formId)
        // let studentForms = this.studentForms.get(studentId)
        let studentFormResponses = studentResponses.responses
        let progress = {
          formId: formId,
          responses: []
        }
        for (let response of this.responses) {
          let studentIdInForm = response.studentId
          let responseId = response.id
          let _id = response._id

          let formResponse = {
            formId: formId,
            responseId: responseId,
            _id: _id
          }
          if (typeof studentIdInForm !== 'undefined') {
            if (studentIdInForm === studentId) {
              progress.responses.push(formResponse)
            }
          }
        }
        // studentForms.push(progress)
        studentFormResponses.push(progress)
      }
      this.studentForms.push(studentResponses)
    }

    // console.log("this.studentForms: " + JSON.stringify(Array.from(this.studentForms)))
    console.log("this.studentForms: " + JSON.stringify(this.studentForms))
    this.studentFormsArray = Array.from(this.studentForms)
    window['tangy-form-app-loading'].innerHTML = ''
  }



  async showForm(formSrc) {
    let query = this.parseQuery(window.location.hash)
    this.$['form-view'].hidden = false
    // this.$['form-item-listing'].hidden = true
    // this.$['item-edit'].hidden = true
    this.$['admin-menu'].hidden = true
    // this.$['item-create'].hidden = true
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

window.customElements.define(TangyClassApp.is, TangyClassApp);
