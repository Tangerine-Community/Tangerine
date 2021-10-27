import { sharedStyles } from './shared-styles.js'
import * as Jsondiffpatch from 'jsondiffpatch'
var jsondiffpatch = Jsondiffpatch.create({});


import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { get } from './http.js';
class ArchivedConflicts extends LitElement {

  static get styles() {
    return [
      sharedStyles
    ]
  }

  static get properties(){
    return {
      dbUrl: { type: String },
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
    const result = await get(`${this.dbUrl}-conflict-revs/_design/byConflictDocId/_view/byConflictDocId?reduce=true&group_level=1`)
    this.list = result.rows.map(row => {
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
      </style>
      <div id="container">
        <h2>Docs with Archived Conflicts</h2>
        ${!this.ready ? html`
          Loading archived conflicts... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              ${this.list.length > 0 ? html`
                <table class="matches">
                  <tr class="header">
                    <td> Doc ID </td>
                    <td> Number of archived conflicts </td>
                  </tr>
                  ${this.list.map(item => html`
                    <tr @click="${() => { this.loadDoc(item._id) }}">
                      <td>${item._id}</td> 
                      <td>${item.numberOfConflicts}</td>
                    </tr>
                  `)}
                </table>
              `: ``}
            </td>
            <td class="selection">
              ${this.selection._id ? html`
                <h2 class="title">${this.selection.conflicts.length} Conflict Diff${this.selection.conflicts.length > 1 ? `s`:``} for ${this.selection.id}</h2>
              `: ``}
              ${this.selection.conflicts.map(conflict => html`
                <h3>${conflict.rev}</h3>
                ${unsafeHTML(Jsondiffpatch.formatters.html.format(conflict.diff, this.selection.doc))}
              `)}
            </td>
          </table>
        </div>
    `
  }

  async loadDoc(docId) {
    const currentDoc = await get(`${this.dbUrl}/${docId}`)
    const result = await get(`${this.dbUrl}-conflict-revs/_design/byConflictDocId/_view/byConflictDocId?reduce=false&keys=["${docId}"]`)
    const conflictRevisionDocIds = result.rows.map(row => row.id) 
    let conflicts = []
    if (conflictRevisionDocIds) {
      for (const conflictRevisionDocId of conflictRevisionDocIds) {
        const conflictRevisionDoc = await get(`${this.dbUrl}-conflict-revs/${conflictRevisionDocId}`)
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
