import { sharedStyles } from './shared-styles.js'
import axios from 'axios'
import * as Jsondiffpatch from 'jsondiffpatch'
import PouchDB from 'pouchdb'
var jsondiffpatch = Jsondiffpatch.create({});

async function archiveConflicts(dbPath, docId) {
  try {
    const dbSource = new PouchDB(dbPath)
    const dbConflictRevs = new PouchDB(`${dbPath}-conflict-revs`)
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

import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
class ActiveConflicts extends LitElement {

  static get styles() {
    return [
      sharedStyles
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
    const result = await axios.get(`/db/${groupId}/_design/conflicts/_view/conflicts`)
    this.list = result.data.rows.map(row => {
      return { 
        _id: row.key, 
        numberOfConflicts: row.value
      }
    })
    this.ready = true
  }

  render() {
    return html`
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
        ${!this.ready ? html`
          Loading active conflicts... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              <h2>Docs with Active Conflicts</h2>
              ${this.list.length > 0 ? html`
                <div class="ids-container"> 
                  <table class="matches">
                    <tr class="header">
                      <td> Doc ID </td>
                      <td> Number of active conflicts </td>
                    </tr>
                    ${this.list.map(item => html`
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
              ${this.selection.id ? html`
                <h2>Conflict Diffs</h2>
                <p>${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</p>
              `: ``}
              <div class="diffs-container">
                ${this.selection.conflicts.map(conflict => html`
                  <h3>${conflict.rev}</h3>
                  ${unsafeHTML(Jsondiffpatch.formatters.html.format(conflict.diff, this.selection.doc))}
                `)}
              </div>
            </td>
            <td valign="top">
              ${this.selection.doc ? html`
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
      const response = await axios.put(`/db/${groupId}/${docToSave._id}`, docToSave)
      const mergedDoc = (await axios.get(`/db/${groupId}/${docToSave._id}`)).data
      try {
        await axios.put(`/db/${groupId}-merge-log`)
      } catch (e) { }
      await axios.post(`/db/${groupId}-merge-log/`, {
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
    const currentDoc = (await axios.get(`/db/${groupId}/${docId}?conflicts=true`)).data
    const conflictRevisionIds = [...currentDoc._conflicts] 
    delete currentDoc._conflicts
    let conflicts = []
    if (conflictRevisionIds) {
      for (const conflictRevisionId of conflictRevisionIds) {
        const conflictRevisionDoc = (await axios.get(`/db/${groupId}/${docId}?rev=${conflictRevisionId}`)).data
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
