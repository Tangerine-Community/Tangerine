import { sharedStyles } from './shared-styles.js'
import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import * as Jsondiffpatch from 'jsondiffpatch'
import PouchDB from 'pouchdb'
import {IssueEvent, IssueEventType, IssueStatus} from "../../case/classes/issue.class";
import {AppContext} from "../../app-context.enum";
var jsondiffpatch = Jsondiffpatch.create({});
import { v4 as UUID } from 'uuid';

async function archiveConflicts(dbUrl, docId) {
  try {
    const dbSource = new PouchDB(dbUrl)
    const dbConflictRevs = new PouchDB(`${dbUrl}-conflict-revs`)
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

class ActiveConflicts extends LitElement {

  static get styles() {
    return [
      sharedStyles
    ]
  }

  static get properties(){
    return {
      dbUrl: { type: String },
      username: { type: String },
      selection: { type: Object },
      ready: { type: Boolean },
      list: { type: Array },
      issueId: { type: String },
      docId: { type: String }
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
    // this.id = localStorage.getItem('id') || ''
  }

  async connectedCallback() {
    super.connectedCallback()
    this.db = new PouchDB(this.dbUrl)
    this.logDb = new PouchDB(`${this.dbUrl}-log`)
    this.loadList()
  }

  async loadList() {
    this.ready = false
    this.selection = { conflicts: []}
    this.list = []
    const result = await this.db.query(`conflicts`)
    this.list = result.rows.map(row => {
      return { 
        _id: row.key, 
        numberOfConflicts: row.value
      }
    })
    if (this.docId !== ''){
      await this.loadDoc(this.docId)
    }
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
        .selected {
          background: yellow;
        }
        .panes {

        }
        .pane {
          height: 750px;
          overflow: scroll;
        }
        .pane-container {
					border: solid 1px #CCC;
					border-radius: 5px;
					padding: 5px 15px;
					background: #FFF;
        }
				.no-border {
					border: none;
				}
        #legend {
          margin-top: 1em;
        }
      </style>
      <div id="messages"></div>
      <div id="container">
        ${!this.ready ? html`
          Loading... 
        `: html`
          <table>
            <tr>
              <td class="pane-container" valign="top">
                <h2>Conflicts</h2>
                <p>${this.list.length} Documents with Conflict${this.list.length > 1 ? `s`:``}</p>
                ${this.list.length > 0 ? html`
                  <div class="pane"> 
                    <table class="matches">
                      <tr class="header">
                        <td class="no-border"> </td>
                        <td> Doc ID </td>
                        <td> Number of active conflicts </td>
                      </tr>
                      ${this.list.map(item => html`
                        <tr class="${this.selection && this.selection.id && this.selection.id === item._id ? `selected` : ``}" @click="${() => { this.loadDoc(item._id) }}">
													<td class="no-border">
														${this.selection && this.selection.id && this.selection.id === item._id ? html`
															<input type="radio" checked></input>
														` : html`
															<input type="radio"></input>
														`}
													</td>
                          <td>${item._id}</td> 
                          <td>${item.numberOfConflicts}</td>
                        </tr>
                      `)}
                    </table>
                  </div>
                `: ``}
              </td>
              <td class="pane-container" valign="top">
								<h2>Diffs</h2>
                ${this.selection.id ? html`
                  <p>${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</p>
                `: html`
									Select a document to the left to view its conflict diffs.
								`}
                <div class="pane">
                  ${this.selection.conflicts.map(conflict => html`
                    <h3>${conflict.rev}</h3>
                    ${unsafeHTML(Jsondiffpatch.formatters.html.format(conflict.diff, this.selection.doc))}
                  `)}
                </div>
              </td>
              <td class="pane-container" valign="top">
								<h2>Merge and/or Archive Conflicts</h2>
                ${this.selection.doc ? html`
                  <juicy-ace-editor mode="ace/mode/json" .value="${this.selection.JSON}"></juicy-ace-editor>
                  <paper-textarea id="comment" label="Comment"></paper-textarea>
                  <div>
                    <paper-button @click="${() => this.onSubmit(true, false) }">MERGE</paper-button>
                    <paper-button @click="${() => this.onSubmit(false, true)}">ARCHIVE CONFLICTS</paper-button>
                    <paper-button @click="${() => this.onSubmit(true, true) }">MERGE AND ARCHIVE CONFLICTS</paper-button>
                  </div>
                  
                  <div id="legend">
                    Legend: 
                    <ul>
                      <li>Merge: Saves any changes you make in the editor, but keeps this conflict open.</li>
                      <li>Archive Conflicts: Does not save any changes made in the editor, but closes the conflict.</li>
                      <li>Merge and Archive Conflicts: Saves any changes you make in the editor and closes the conflict.</li>
                    </ul>
                  </div>
                `: ``}
              </td>
            </tr>
          </table>
        `}
      </div>
    `
  }
  async onSubmitTEST(shouldMerge = false, shouldArchive = false) {
    console.log("Saving issueId: " + this.issueId)
    const comment = this.shadowRoot.querySelector('#comment').value
    if (this.issueId) {
      const issue = await this.db.get(this.issueId)
      issue.status = 'Closed'
      const event = {
        id: UUID(),
        type: 'Close',
        date: Date.now(),
        userName: this.username,
        userId: this.username,
        createdAppContext:  'EDITOR',
        data: {
          comment
        }
      }
      console.log("event: " + JSON.stringify(event))
      issue.events.push(event);
      await this.db.put(issue)
    }
  }
  async onSubmit(shouldMerge = false, shouldArchive = false) {
    const docId = this.selection.id
    const action = shouldMerge && shouldArchive
        ? 'MERGE-AND-ARCHIVE'
        : shouldMerge
          ? 'MERGE'
          : shouldArchive
            ? 'ARCHIVE'
            : 'NONE'
    const comment = this.shadowRoot.querySelector('#comment').value
    let mergedDoc
    try {
      mergedDoc = JSON.parse(this.shadowRoot.querySelector('juicy-ace-editor').value)
    } catch(e) {
      alert(`Invalid JSON. Aborting action: ${action}`)
      return
    }
    // Confirm.
    const confirmation = confirm(`Are you sure you want to ${shouldMerge ? `merge changes` : ''}${shouldMerge && shouldArchive ? ' and ' : ''}${shouldArchive ? 'archive conflict revisions':''} for ${docId}?`)
    if (!confirmation) return
    this.ready = false
    // Merge.
    if (shouldMerge) {
      await this.db.put(mergedDoc)
      mergedDoc = await this.db.get(mergedDoc._id) 
    }
    // Archive.
    if (shouldArchive) {
      await archiveConflicts(this.dbUrl, docId)
    }
    if (shouldMerge || shouldArchive) {
      if (this.issueId) {
        const issue = await this.db.get(this.issueId)
        issue.status = 'Closed'
        const event = {
          id: UUID(),
          type: 'Close',
          date: Date.now(),
          userName: this.username,
          userId: this.username,
          createdAppContext:  'EDITOR',
          data: {
            comment
          }
        }
        console.log("event: " + JSON.stringify(event))
        issue.events.push(event)
        await this.db.put(issue)
        this.shadowRoot.querySelector('#messages').innerHTML += `<p>Closed this issue.</p>`
      }
    }
    // Log.
    await this.logDb.post({
      action,
      docId,
      mergedDoc,
      originalDoc: this.selection.doc,
      activeConflictRevs: this.selection.conflicts.map(conflict => conflict.rev), 
      timestamp: new Date().toISOString(),
      comment,
      user: this.username
    })
    // Reload UI.
    if (shouldArchive) {
      this.loadList()
    } else {
      await this.loadDoc(mergedDoc._id)
    }
    this.ready = true
  }

  async loadDoc(docId) {
    this.ready = false
    const currentDoc = await this.db.get(docId, {conflicts: true})
    if ( currentDoc._conflicts) {
      const conflictRevisionIds = [...currentDoc._conflicts]
      delete currentDoc._conflicts
      let conflicts = []
      if (conflictRevisionIds) {
        for (const conflictRevisionId of conflictRevisionIds) {
          const conflictRevisionDoc = await this.db.get(docId, {rev: conflictRevisionId})
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
    } else {
      this.shadowRoot.querySelector('#messages').innerHTML += `<h2>No conflicts for ${docId}</h2><p>They may have already been resolved.</p>`
    }
    this.ready = true
    
  }

}

customElements.define('active-conflicts', ActiveConflicts);
