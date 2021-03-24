/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./components/active-conflicts.js":
/*!****************************************!*\
  !*** ./components/active-conflicts.js ***!
  \****************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared-styles.js */ "./components/shared-styles.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsondiffpatch */ "./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var pouchdb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! pouchdb */ "./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");
/* harmony import */ var lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lit-html/directives/unsafe-html */ "./node_modules/lit-html/directives/unsafe-html.js");




var jsondiffpatch = jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.create({});

async function archiveConflicts(dbPath, docId) {
  try {
    const dbSource = new pouchdb__WEBPACK_IMPORTED_MODULE_3__.default(dbPath)
    const dbConflictRevs = new pouchdb__WEBPACK_IMPORTED_MODULE_3__.default(`${dbPath}-conflict-revs`)
    const doc = await dbSource.get(docId, {conflicts: true})
    for (let conflictRev of doc._conflicts) {
      const conflictRevDoc = await dbSource.get(docId, {rev: conflictRev})
      conflictRevDoc.conflictDocId = docId 
      conflictRevDoc.conflictRev = conflictRev
      delete conflictRevDoc._id
      delete conflictRevDoc._rev
      await dbConflictRevs.post(conflictRevDoc)
      await dbSource.remove(docId, conflictRev)
    }
    return doc._conflicts
  } catch (e) {
    console.log(e)
  }
}



class ActiveConflicts extends lit_element__WEBPACK_IMPORTED_MODULE_4__.LitElement {

  static get styles() {
    return [
      _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__.sharedStyles
    ]
  }

  static get properties(){
    return {
      selection: { type: Object },
      ready: { type: Boolean },
      list: { type: Array }
    };
  }

  constructor() {
    super()
    this.loadCount = 0
    this.searchString = '' 
    this.ready = false
    this.conflictInfos = []
    this.matches = []
    this.selection = { conflicts:[] }
  }

  async connectedCallback() {
    super.connectedCallback()
    this.loadList()
  }

  async loadList() {
    this.ready = false
    const groupId = window.location.pathname.split('/')[2]
    const result = await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/_design/conflicts/_view/conflicts`)
    this.list = result.data.rows.map(row => {
      return { 
        _id: row.key, 
        numberOfConflicts: row.value
      }
    })
    this.ready = true
  }

  render() {
    return lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
      <style>
        #container {
          margin: 15px;
          padding: 15px;
        }
        .selection {
          padding: 0px 15px;
        }
        .title {
          margin: 15px 0px 5px;
        }
        .no-matches {
          width: 300px
        }
        tr.header td {
         font-weight: bold;
        }
        table.matches td {
          text-align: right;
          padding: 5px;
          border: solid 1px #CCC;
        }
        paper-button {
          background-color: var(--mdc-theme-secondary); 
          color: white;
        }
        juicy-ace-editor {
          width: 750px;
          height: 750px;
          margin-bottom: 15px;
        }
        .diffs-container, .ids-container {
          overflow: scroll;
          height: 750px;
        }
      </style>
      <div id="container">
        ${!this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          Loading active conflicts... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              <h2>Docs with Active Conflicts</h2>
              ${this.list.length > 0 ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
                <div class="ids-container"> 
                  <table class="matches">
                    <tr class="header">
                      <td> Doc ID </td>
                      <td> Number of active conflicts </td>
                    </tr>
                    ${this.list.map(item => lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
                      <tr @click="${() => { this.loadDoc(item._id) }}">
                        <td>${item._id}</td> 
                        <td>${item.numberOfConflicts}</td>
                      </tr>
                    `)}
                  </table>
                </div>
              `: ``}
            </td>
            <td class="selection" valign="top">
              ${this.selection.id ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
                <h2>Conflict Diffs</h2>
                <p>${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</p>
              `: ``}
              <div class="diffs-container">
                ${this.selection.conflicts.map(conflict => lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
                  <h3>${conflict.rev}</h3>
                  ${(0,lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_5__.unsafeHTML)(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.formatters.html.format(conflict.diff, this.selection.doc))}
                `)}
              </div>
            </td>
            <td valign="top">
              ${this.selection.doc ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
                <h2>Merge</h2>
                <juicy-ace-editor mode="ace/mode/json" .value="${this.selection.JSON}"></juicy-ace-editor>
                <paper-textarea id="merge-comment" label="Merge comment"></paper-textarea>
                <paper-button @click="${() => this.saveDoc() }">MERGE CHANGES</paper-button>
								<paper-button @click="${() => this.archiveConflictRevisions()}">ARCHIVE CONFLICT REVISIONS</paper-button>
              `: ``}

              

            </td>
          </table>
        </div>
    `
  }

  async archiveConflictRevisions() {
    const groupId = window.location.pathname.split('/')[2]
    const dbPath = `${window.location.protocol}` + '//' + `${window.location.host}/db/${groupId}`
    const docId = this.selection.id
    const confirmation = confirm(`Are you sure you want to archive conflict revisions for ${docId}?`)
    if (!confirmation) return
    this.selection = { conflicts: []}
    this.list = []
    this.ready = false
    await archiveConflicts(dbPath, docId)
    alert('Conflicts archived.')
    this.loadList()
  }

  async saveDoc() {
    const groupId = window.location.pathname.split('/')[2]
    let docToSave
    try {
      docToSave = JSON.parse(this.shadowRoot.querySelector('juicy-ace-editor').value)
    } catch(e) {
      alert('Invalid JSON. Doc not saved.')
      return
    }
    try {
      const response = await axios__WEBPACK_IMPORTED_MODULE_1__.put(`/db/${groupId}/${docToSave._id}`, docToSave)
      const mergedDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docToSave._id}`)).data
      try {
        await axios__WEBPACK_IMPORTED_MODULE_1__.put(`/db/${groupId}-merge-log`)
      } catch (e) { }
      await axios__WEBPACK_IMPORTED_MODULE_1__.post(`/db/${groupId}-merge-log/`, {
        docId: docToSave._id,
        mergedDoc,
        originalDoc: this.selection.doc,
        activeConflictRevs: this.selection.conflicts.map(conflict => conflict.rev), 
        timestamp: new Date().toISOString(),
        comment: this.shadowRoot.querySelector('#merge-comment').value,
        user: await T.user.getCurrentUser()
      })
    } catch (e) {
      alert('Error saving')
      console.error(e)
      return
    }
    await this.loadDoc(docToSave._id)
    alert('Saved successfully.')
  }

  async loadDoc(docId) {
    const groupId = window.location.pathname.split('/')[2]
    const currentDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}?conflicts=true`)).data
    const conflictRevisionIds = [...currentDoc._conflicts] 
    delete currentDoc._conflicts
    let conflicts = []
    if (conflictRevisionIds) {
      for (const conflictRevisionId of conflictRevisionIds) {
        const conflictRevisionDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}?rev=${conflictRevisionId}`)).data
        const comparison = jsondiffpatch.diff(currentDoc, conflictRevisionDoc)
        const conflict = {
          doc: conflictRevisionDoc,
          rev: conflictRevisionDoc._rev,
          diff: comparison
        }
        conflicts.push(conflict)
      }
    }
    this.selection = {
      id: currentDoc._id,
      rev: currentDoc._rev,
      doc: currentDoc,
      JSON: JSON.stringify(currentDoc, null, 2),
      conflicts 
    }
  }

}

customElements.define('active-conflicts', ActiveConflicts);


/***/ }),

/***/ "./components/archived-conflicts.js":
/*!******************************************!*\
  !*** ./components/archived-conflicts.js ***!
  \******************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared-styles.js */ "./components/shared-styles.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsondiffpatch */ "./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");
/* harmony import */ var lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lit-html/directives/unsafe-html */ "./node_modules/lit-html/directives/unsafe-html.js");



var jsondiffpatch = jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.create({});




class ArchivedConflicts extends lit_element__WEBPACK_IMPORTED_MODULE_3__.LitElement {

  static get styles() {
    return [
      _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__.sharedStyles
    ]
  }

  static get properties(){
    return {
      selection: { type: Object },
      ready: { type: Boolean },
      list: { type: Array }
    };
  }

  constructor() {
    super()
    this.loadCount = 0
    this.searchString = '' 
    this.ready = false
    this.conflictInfos = []
    this.matches = []
    this.selection = { conflicts:[] }
  }

  async connectedCallback() {
    super.connectedCallback()
    const groupId = window.location.pathname.split('/')[2]
    const result = await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}-conflict-revs/_design/byConflictDocId/_view/byConflictDocId?reduce=true&group_level=1`)
    this.list = result.data.rows.map(row => {
      return { 
        _id: row.key, 
        numberOfConflicts: row.value
      }
    })
    this.ready = true
  }

  render() {
    return lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
      <style>
        #container {
          margin: 15px;
          padding: 15px;
        }
        .selection {
          padding: 0px 15px;
        }
        .title {
          margin: 15px 0px 5px;
        }
        .no-matches {
          width: 300px
        }
        tr.header td {
         font-weight: bold;
        }
        table.matches td {
          text-align: right;
          padding: 5px;
          border: solid 1px #CCC;
        }
      </style>
      <div id="container">
        <h2>Docs with Archived Conflicts</h2>
        ${!this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
          Loading archived conflicts... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              ${this.list.length > 0 ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <table class="matches">
                  <tr class="header">
                    <td> Doc ID </td>
                    <td> Number of archived conflicts </td>
                  </tr>
                  ${this.list.map(item => lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                    <tr @click="${() => { this.loadDoc(item._id) }}">
                      <td>${item._id}</td> 
                      <td>${item.numberOfConflicts}</td>
                    </tr>
                  `)}
                </table>
              `: ``}
            </td>
            <td class="selection">
              ${this.selection._id ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <h2 class="title">${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</h2>
              `: ``}
              ${this.selection.conflicts.map(conflict => lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <h3>${conflict.rev}</h3>
                ${(0,lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__.unsafeHTML)(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.formatters.html.format(conflict.diff, this.selection.doc))}
              `)}
            </td>
          </table>
        </div>
    `
  }

  async loadDoc(docId) {
    const groupId = window.location.pathname.split('/')[2]
    const currentDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}`)).data
    const result = await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}-conflict-revs/_design/byConflictDocId/_view/byConflictDocId?reduce=false&keys=["${docId}"]`)
    const conflictRevisionDocIds = result.data.rows.map(row => row.id) 
    let conflicts = []
    if (conflictRevisionDocIds) {
      for (const conflictRevisionDocId of conflictRevisionDocIds) {
        const conflictRevisionDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}-conflict-revs/${conflictRevisionDocId}`)).data
        // Transform a conflictRevisionDoc to the actual doc at the time of the revision.
        delete conflictRevisionDoc._id
        delete conflictRevisionDoc.conflictDocId
        conflictRevisionDoc._id = docId
        conflictRevisionDoc._rev = conflictRevisionDoc.conflictRev
        delete conflictRevisionDoc.conflictRev
        const comparison = jsondiffpatch.diff(currentDoc, conflictRevisionDoc)
        const conflict = {
          doc: conflictRevisionDoc,
          rev: conflictRevisionDoc._rev,
          diff: comparison
        }
        conflicts.push(conflict)
      }
    }
    this.selection = {
      id: currentDoc._id,
      rev: currentDoc._rev,
      doc: currentDoc,
      conflicts 
    }
  }

}

customElements.define('archived-conflicts', ArchivedConflicts);


/***/ }),

/***/ "./components/custom-app.js":
/*!**********************************!*\
  !*** ./components/custom-app.js ***!
  \**********************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _archived_conflicts_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./archived-conflicts.js */ "./components/archived-conflicts.js");
/* harmony import */ var _active_conflicts_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./active-conflicts.js */ "./components/active-conflicts.js");
/* harmony import */ var _merge_log_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./merge-log.js */ "./components/merge-log.js");
/* harmony import */ var _search_active_conflicts_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./search-active-conflicts.js */ "./components/search-active-conflicts.js");
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");
/* harmony import */ var lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lit-html/directives/unsafe-html */ "./node_modules/lit-html/directives/unsafe-html.js");







class CustomApp extends lit_element__WEBPACK_IMPORTED_MODULE_4__.LitElement {

  static get properties() {
    return { 
      route: { type: String },
      ready: { type: String }
    };
  }

  constructor() {
    super()
    window.App = this
    this.ready = false
    this.route = window.route || localStorage.getItem('route') || ''
  }

  async connectedCallback() {
    super.connectedCallback()
    this.ready = true
  }

  setRoute(route) {
    window.route = route
    localStorage.setItem('route', route)
  }

  go(route) {
    this.setRoute(route)
    this.route = route
  }

  set(name = '', value = '') {
    localStorage.setItem(name, value)
  }

  get(name) {
    return localStorage.getItem(name)
  }

  render() {
    return lit_element__WEBPACK_IMPORTED_MODULE_4__.html`

      <style type="text/css">
      	/**
      	 * These styles just for the style guide
      	 * The styles for the actual contents are in style.css
      	 */
      	body {
      		background-color: #3f3f43;
      		padding-top: 15px;
      	}
      	.wrapper {
      		width: 1120px;
      		padding: 20px;
      		margin: 0 auto;
      		background-color: #fff;
      	}
      	.tablet {
      		width: 768px;
      		margin: 0 auto;
        }
        home-button {
          position: absolute;
          top: 0px;
          left: 0px;
          z-index: 98765456789876545678;
        }
      </style>
      ${!this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`Loading...`:``}
      ${this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
        ${this.route === '' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <h1>Data Conflicts</h1>
          <ul>
            <li @click="${() => this.open('active-conflicts')}">Active Conflicts</li>
            <li @click="${() => this.open('archived-conflicts')}">Archived Conflicts</li>
            <li @click="${() => this.open('merge-log')}">Merge Log</li>
            <li @click="${() => this.open('search-active-conflicts')}">Search Active Conflicts</li>
          </ul>
        `: ``}
        ${this.route !== '' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <paper-button @click="${() => App.go('')}">< BACK</paper-button> 
        `: ``}
        ${this.route === 'archived-conflicts' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <archived-conflicts></archived-conflicts>
        `: ``}
        ${this.route === 'active-conflicts' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <active-conflicts></active-conflicts>
        `: ``}
        ${this.route === 'merge-log' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <merge-log></merge-log>
        `: ``}
        ${this.route === 'search-active-conflicts' ? lit_element__WEBPACK_IMPORTED_MODULE_4__.html`
          <search-active-conflicts></search-active-conflicts>
        `: ``}
      `: ``}
    `
  }

  open(route) {
    this.route = route
  }

}

customElements.define('custom-app', CustomApp)


/***/ }),

/***/ "./components/merge-log.js":
/*!*********************************!*\
  !*** ./components/merge-log.js ***!
  \*********************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared-styles.js */ "./components/shared-styles.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsondiffpatch */ "./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");
/* harmony import */ var lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lit-html/directives/unsafe-html */ "./node_modules/lit-html/directives/unsafe-html.js");



var jsondiffpatch = jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.create({});




class MergeLog extends lit_element__WEBPACK_IMPORTED_MODULE_3__.LitElement {

  static get styles() {
    return [
      _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__.sharedStyles
    ]
  }

  static get properties(){
    return {
      selection: { type: Object },
      ready: { type: Boolean },
      list: { type: Array }
    };
  }

  constructor() {
    super()
    this.loadCount = 0
    this.searchString = '' 
    this.ready = false
    this.conflictInfos = []
    this.matches = []
    this.selection = { diff: undefined }
  }

  async connectedCallback() {
    super.connectedCallback()
    const groupId = window.location.pathname.split('/')[2]
    const result = await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}-merge-log/_all_docs?include_docs=true`)
    this.list = result.data.rows
      .map(row => row.doc)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    this.ready = true
  }

  render() {
    return lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
      <style>
        #container {
          margin: 15px;
          padding: 15px;
        }
        .selection {
          padding: 0px 15px;
        }
        .title {
          margin: 15px 0px 5px;
        }
        .no-matches {
          width: 300px
        }
        tr.header td {
         font-weight: bold;
        }
        table.matches td {
          text-align: right;
          padding: 5px;
          border: solid 1px #CCC;
        }
      </style>
      <div id="container">
        ${!this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
          Loading merge log... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              <h2>Merge Log</h2>
              ${this.list.length > 0 ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <table class="matches">
                  <tr class="header">
                    <td> Timestamp </td>
                    <td> Merge ID </td>
                    <td> Doc ID </td>
                    <td> Merged Rev </td>
                    <td> Original Rev </td>
                    <td> Active Conflict Revs </td>
                    <td> Comment </td>
                    <td> User </td>
                  </tr>
                  ${this.list.map(item => lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                    <tr @click="${() => { this.loadItem(item) }}">
                      <td>${item.timestamp}</td> 
                      <td>${item._id}</td> 
                      <td>${item.docId}</td> 
                      <td>${item.mergedDoc._rev}</td>
                      <td>${item.originalDoc._rev}</td>
                      <td>${item.activeConflictRevs.join(', ')}</td>
                      <td><pre>${item.comment}</pre></td>
                      <td>${item.user}</td>
                    </tr>
                  `)}
                </table>
              `: ``}
            </td>
            <td class="diff">
              ${this.selection.diff ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <h2>Diff for Merge ${this.selection._id}</h2>
                ${(0,lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__.unsafeHTML)(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.formatters.html.format(this.selection.diff, this.selection.originalDoc))}
              ` : ``}
            </td>
          </table>
        </div>
    `
  }

  async loadItem(item) {
    this.selection = {
      ...item,
      diff: jsondiffpatch.diff(item.originalDoc, item.mergedDoc)
    }
  }

}

customElements.define('merge-log', MergeLog);


/***/ }),

/***/ "./components/search-active-conflicts.js":
/*!***********************************************!*\
  !*** ./components/search-active-conflicts.js ***!
  \***********************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.n, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shared-styles.js */ "./components/shared-styles.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsondiffpatch */ "./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js");
/* harmony import */ var jsondiffpatch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");
/* harmony import */ var lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lit-html/directives/unsafe-html */ "./node_modules/lit-html/directives/unsafe-html.js");



var jsondiffpatch = jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.create({});




class SearchActiveConflicts extends lit_element__WEBPACK_IMPORTED_MODULE_3__.LitElement {

  static get styles() {
    return [
      _shared_styles_js__WEBPACK_IMPORTED_MODULE_0__.sharedStyles
    ]
  }

  static get properties(){
    return {
      searchString: { type: String },
      loadCount: { type: Number },
      selection: { type: Object },
      ready: { type: Boolean },
      matches: { type: Array }
    };
  }

  constructor() {
    super()
    this.loadCount = 0
    this.searchString = '' 
    this.ready = false
    this.conflictInfos = []
    this.matches = []
    this.selection = { conflicts:[] }
  }

  async connectedCallback() {
    super.connectedCallback()
    const groupId = window.location.pathname.split('/')[2]
    const result = await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/_design/syncConflicts/_view/syncConflicts`)
    const conflictInfos = []
    for (let row of result.data.rows) {
      const conflictInfo = await this.getDocConflictInfo(row.id)
      conflictInfos.push(conflictInfo)
      this.loadCount = this.loadCount + 1
    }
    this.conflictInfos = conflictInfos
    this.matches = [...conflictInfos]
    this.ready = true
  }

  render() {
    return lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
      <style>
        #container {
          margin: 15px;
          padding: 15px;
        }
        .selection {
          padding: 0px 15px;
        }
        .title {
          margin: 15px 0px 5px;
        }
        .no-matches {
          width: 300px
        }
        tr.header td {
         font-weight: bold;
        }
        table.matches td {
          text-align: right;
          padding: 5px;
          border: solid 1px #CCC;
        }
      </style>
      <div id="container">
        <h2>Docs in Conflict</h2>
        ${!this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
          Loading docs in conflict: ${this.loadCount}
        `: lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
          <table>
            <tr>
              <td width="100%">
                <paper-input name="search" type="text" label="Search diffs"></paper-input>
              </td>
              <td>
                <select name="type">
                  <option value="diff">Search on Diffs</option>
                  <option value="doc">Search on Docs</option>
                </select>
              </td>
              <td>
                <paper-button @click="${() => this.onSearchSubmit()}">Submit</paper-button>
              </td>
            </tr>
          </table>
        `}
        <table>
          <tr>
            <td valign="top">
              ${this.ready ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <div class="no-matches">
                  ${this.matches.length} ${this.matches.length === 1 ? `match` : `matches`} found.
                </div>
              `:``}
              ${this.matches.length > 0 ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <table class="matches">
                  <tr class="header">
                    <td> ID </td>
                    <td> Number of conflicts </td>
                  </tr>
                  ${this.matches.map(match => lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                    <tr @click="${() => { this.selection = match }}">
                      <td>${match.id}</td> 
                      <td>${match.conflicts.length}</td>
                    </tr>
                  `)}
                </table>
              `: ``}
            </td>
            <td class="selection">
              ${this.selection.id ? lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <h2 class="title">${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</h2>
              `: ``}
              ${this.selection.conflicts.map(conflict => lit_element__WEBPACK_IMPORTED_MODULE_3__.html`
                <h3>${conflict.rev}</h3>
                ${(0,lit_html_directives_unsafe_html__WEBPACK_IMPORTED_MODULE_4__.unsafeHTML)(jsondiffpatch__WEBPACK_IMPORTED_MODULE_2__.formatters.html.format(conflict.diff, this.selection.doc))}
              `)}
            </td>
          </table>
        </div>
    `
  }

  onSearchSubmit() {
    const phrase = this.shadowRoot.querySelector(`[name='search']`).value
    const type = this.shadowRoot.querySelector(`[name='type']`).value
    if (!phrase) {
      this.matches = this.conflictInfos
    } else {
      if (type === 'diff') {
        this.diffSearch(phrase)
      } else {
        this.docSearch(phrase)
      }
    }
  }

  docSearch(phrase) {
    this.matches = this.conflictInfos
      .filter(conflictInfo => JSON.stringify(conflictInfo.doc).includes(phrase) || conflictInfo.conflicts.some(conflict => JSON.stringify(conflict.doc).includes(phrase)))
  }

  diffSearch(phrase) {
    this.matches = this.conflictInfos
      .filter(conflictInfo => conflictInfo.conflicts.some(conflict => JSON.stringify(conflict.diff).includes(phrase)))
  }


  async getDocConflictInfo(docId) {
    const groupId = window.location.pathname.split('/')[2]
    const currentDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}`)).data
    const docWithConflictRevs = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}?conflicts=true`)).data
    const conflictRevisionIds = docWithConflictRevs._conflicts
    let conflicts = []
    if (conflictRevisionIds) {
      for (const conflictRevisionId of conflictRevisionIds) {
        const conflictRevisionDoc = (await axios__WEBPACK_IMPORTED_MODULE_1__.get(`/db/${groupId}/${docId}?rev=${conflictRevisionId}`)).data
        const comparison = jsondiffpatch.diff(currentDoc, conflictRevisionDoc)
        const conflict = {
          doc: conflictRevisionDoc,
          rev: conflictRevisionDoc._rev,
          diff: comparison
        }
        conflicts.push(conflict)
      }
    }
    return {
      id: currentDoc._id,
      rev: currentDoc._rev,
      doc: currentDoc,
      conflicts 
    }
  }

}

customElements.define('search-active-conflicts', SearchActiveConflicts);


/***/ }),

/***/ "./components/shared-styles.js":
/*!*************************************!*\
  !*** ./components/shared-styles.js ***!
  \*************************************/
/*! namespace exports */
/*! export sharedStyles [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "sharedStyles": () => /* binding */ sharedStyles
/* harmony export */ });
/* harmony import */ var lit_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit-element */ "./node_modules/lit-element/lit-element.js");


const sharedStyles = lit_element__WEBPACK_IMPORTED_MODULE_0__.css`

* {
	box-sizing: border-box;
}

.container {
	padding: 0px 15px;
}

/* Items are prefixed with lk- to scope these styles */
.lk-html {
	font-size: 14px;
}

.lk-body {
	font-weight: 400;
	font-size: 1rem;
	font-family: "Open Sans", Helvetica, Arial, sans-serif;
	line-height: 1.6;
	color: #212121;
}

.lk-header {
	padding: 15px;
	width: 100%;
	background-color: #212a3f;
	display: flex;
	justify-content: space-around;
	align-items: center;
	color: #fff;
}

.lk-h1 {
	font-size: 1.4rem;
	margin: 1rem;
}
.lk-h1 span {
	font-size: 1rem;
	color: rgba(33,33,33,0.7);
}

.lk-instructions {
	margin: 1rem;
}

.lk-btn {
	box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	background-color: #3c5b8d;
	color: rgba(255,255,255,.87);
	cursor: pointer;
	white-space: nowrap;
	outline: rgba(0,0,0,.870588) none 0;
	border: none;
	padding: 8px 30px;
	text-transform: uppercase;
	transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);
	text-decoration: none;
	display: inline-block;
	text-align: center;
	vertical-align: middle;
	line-height: 1.5;
}
.lk-btn-sm {
	padding: 5px 20px 5px;
}

.lk-btn-container {
	margin: 0 1rem 2rem;
	text-align: right;
}

.lk-card {
	box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	background-color: #fff;
	border: 0;
	margin: 0 1rem 2rem;
	display: flex;
	position: relative;
	flex-direction: column;
	word-wrap: break-word;
	background-clip: border-box;
}

.lk-input {
	line-height: 1.42857;
	font-size: 1.1rem;
	padding: 0 4px;
	height: 38px;
	display: block;
	width: 100%;
}


/**
 * Breadcrumb things
 */
#lk-breadcrumbs {
	background-color: #546e7a;
	color: #cfd8dc;
	position: relative;
}
#lk-breadcrumbs ul {
	padding: 0 1rem;
	margin: 0;
	list-style: none;
}
#lk-breadcrumbs li {
	display: inline-block;
	line-height: 2.6rem;
}
#lk-breadcrumbs li + li:before {
	font: normal normal normal 24px/1 "Material Design Icons";
	display: inline-block;
	font-size: inherit;
	line-height: inherit;
	content: "";
}

#lk-breadcrumbs mwc-icon {
	vertical-align: bottom;
	position: relative;
	bottom: 10px;
}

#lk-breadcrumbs a {
	color: rgba(255,255,255,0.8);
}
#lk-breadcrumbs a:hover {
	color: #fff;
	text-decoration: none;
}

/**
 * Task list things
 */
.lk-task-list {
	display: flex;
	flex-direction: column;
	padding-left: 0;
	margin: 0;
}
.lk-task-list > li {
	position: relative;
	background-color: #fff;
	color: #424242;
	padding: 15px;
	margin: 0;
	transition: all ease .3s;
	border-bottom: solid 1px #eee;
	display: flex;
	align-items: center;
	cursor: pointer;
}
.lk-drop-container paper-button {
	padding-bottom: 10px;
}
.lk-task-list > li:first-child {
	border-top: 1px solid #eee;
}
.lk-task-list > li.lk-complete {
	background-color: #e0e0e0;
	color: rgba(66,66,66,0.5);
	cursor: default;
}
.lk-task-list > li mwc-icon {
	margin-right: 1rem;
	font-size: 1.4rem;
}
.lk-task-list > li:not(.lk-complete) mwc-icon {
	color: #ff8f00;
}

.lk-task-list > li > .lk-drop-container,
.lk-task-list > li > .lk-btn {
	margin-left: auto;
}
.lk-task-list > li > .lk-left {
	margin: 0;
}
.lk-task-list > li > .lk-btn + .lk-btn {
	margin-left: 5px;
}

.lk-task-list > li.lk-indent {
	padding-left: 45px;
}

.lk-caps {
	text-transform: uppercase;
}

.lk-status {
	margin-left: 15px;
	color: rgba(33,33,33,0.7)
}

/**
 * Dropdown things
 */
.lk-drop-container {
}
.lk-drop-container mwc-icon.icon {
	color: #FFF !important;
	margin: 0px;
	position: relative;
	top: 5px;
}

.lk-drop-list {
	display: none;
	position: absolute;
	top: 30px;
	right: 0;
	min-width: 150px;
	z-index: 1;
	margin: 0;
	padding: 0;
	border: 0;
	box-shadow: 0 2px 5px 0 rgba(0,0,0,.26);
	list-style: none;
	background-color: #fff;	
}
.lk-drop-list > li {
	padding: .5rem 2rem;
	line-height: 2rem;
	display: block;
	color: #212529;
	text-decoration: none;
}
.lk-drop-list > li:hover {
	background-color: #f5f5f5;
	color: #3c5b8d;
}
.lk-drop-list > li.lk-divider {
	border-bottom: 1px solid #eee;
}
.lk-show {
	display: block;
}

/**
 * Modal things
 */
#lk-modal {
	display: none;
	position: fixed;
	z-index: 2;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0,0,0,0.4);
}
.lk-modal-content {
	margin: 15% auto;
	width: auto;
	max-width: 300px;
	min-height: 200px;
	background-color: #fff;
	border: 1px solid rgba(0,0,0,.2);
	outline: 0;
	padding: 0 2.4rem;
}
.lk-modal-content > div:first-child {
	text-align: right;
	color: #616161;
	padding: 2.4rem 0 1rem;
}
.lk-modal-content > div:first-child mwc-icon {
	cursor: pointer;
}
.lk-modal-content > div:last-child {
	padding: 1rem 0  2.4rem;
	text-align: right;
}
.lk-modal-content label {
	display: block;
	margin-bottom: 1rem;
}
#lk-modal .died, #lk-modal .moved {
	display: none;
}
.jsondiffpatch-delta {
  font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0 0 0 12px;
  display: inline-block;
}
.jsondiffpatch-delta pre {
  font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0;
  display: inline-block;
}
ul.jsondiffpatch-delta {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-delta ul {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-added .jsondiffpatch-property-name,
.jsondiffpatch-added .jsondiffpatch-value pre,
.jsondiffpatch-modified .jsondiffpatch-right-value pre,
.jsondiffpatch-textdiff-added {
  background: #bbffbb;
}
.jsondiffpatch-deleted .jsondiffpatch-property-name,
.jsondiffpatch-deleted pre,
.jsondiffpatch-modified .jsondiffpatch-left-value pre,
.jsondiffpatch-textdiff-deleted {
  background: #ffbbbb;
  text-decoration: line-through;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination {
  color: gray;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination > .jsondiffpatch-value {
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  overflow-y: hidden;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  display: block;
}
.jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow {
  display: none;
}
.jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-property-name {
  display: inline-block;
  padding-right: 5px;
  vertical-align: top;
}
.jsondiffpatch-property-name:after {
  content: ': ';
}
.jsondiffpatch-child-node-type-array > .jsondiffpatch-property-name:after {
  content: ': [';
}
.jsondiffpatch-child-node-type-array:after {
  content: '],';
}
div.jsondiffpatch-child-node-type-array:before {
  content: '[';
}
div.jsondiffpatch-child-node-type-array:after {
  content: ']';
}
.jsondiffpatch-child-node-type-object > .jsondiffpatch-property-name:after {
  content: ': {';
}
.jsondiffpatch-child-node-type-object:after {
  content: '},';
}
div.jsondiffpatch-child-node-type-object:before {
  content: '{';
}
div.jsondiffpatch-child-node-type-object:after {
  content: '}';
}
.jsondiffpatch-value pre:after {
  content: ',';
}
li:last-child > .jsondiffpatch-value pre:after,
.jsondiffpatch-modified > .jsondiffpatch-left-value pre:after {
  content: '';
}
.jsondiffpatch-modified .jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-modified .jsondiffpatch-right-value {
  margin-left: 5px;
}
.jsondiffpatch-moved .jsondiffpatch-value {
  display: none;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination {
  display: inline-block;
  background: #ffffbb;
  color: #888;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination:before {
  content: ' => ';
}
ul.jsondiffpatch-textdiff {
  padding: 0;
}
.jsondiffpatch-textdiff-location {
  color: #bbb;
  display: inline-block;
  min-width: 60px;
}
.jsondiffpatch-textdiff-line {
  display: inline-block;
}
.jsondiffpatch-textdiff-line-number:after {
  content: ',';
}
.jsondiffpatch-error {
  background: red;
  color: white;
  font-weight: bold;
}


`


/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_custom_app_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/custom-app.js */ "./components/custom-app.js");



/***/ }),

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! dynamic exports */
/*! export __esModule [not provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements:  */
/***/ (() => {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/tangerine/groups/group-b1af3420-23a9-45a1-968a-cf8b11e4bbc4/editor/node_modules/axios/index.js'");

/***/ }),

/***/ "./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js":
/*!**************************************************************!*\
  !*** ./node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js ***!
  \**************************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
/***/ (() => {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/tangerine/groups/group-b1af3420-23a9-45a1-968a-cf8b11e4bbc4/editor/node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js'");

/***/ }),

/***/ "./node_modules/lit-element/lit-element.js":
/*!*************************************************!*\
  !*** ./node_modules/lit-element/lit-element.js ***!
  \*************************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements:  */
/***/ (() => {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/tangerine/groups/group-b1af3420-23a9-45a1-968a-cf8b11e4bbc4/editor/node_modules/lit-element/lit-element.js'");

/***/ }),

/***/ "./node_modules/lit-html/directives/unsafe-html.js":
/*!*********************************************************!*\
  !*** ./node_modules/lit-html/directives/unsafe-html.js ***!
  \*********************************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements:  */
/***/ (() => {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/tangerine/groups/group-b1af3420-23a9-45a1-968a-cf8b11e4bbc4/editor/node_modules/lit-html/directives/unsafe-html.js'");

/***/ }),

/***/ "./node_modules/pouchdb/lib/index-browser.es.js":
/*!******************************************************!*\
  !*** ./node_modules/pouchdb/lib/index-browser.es.js ***!
  \******************************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements:  */
/***/ (() => {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/tangerine/groups/group-b1af3420-23a9-45a1-968a-cf8b11e4bbc4/editor/node_modules/pouchdb/lib/index-browser.es.js'");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;
//# sourceMappingURL=custom-scripts.js.map