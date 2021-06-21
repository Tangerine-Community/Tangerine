import { sharedStyles } from './shared-styles.js'
import axios from 'axios'
import * as Jsondiffpatch from 'jsondiffpatch'
var jsondiffpatch = Jsondiffpatch.create({});


import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
class SearchActiveConflicts extends LitElement {

  static get styles() {
    return [
      sharedStyles
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
    const result = await axios.get(`/db/${groupId}/_design/syncConflicts/_view/syncConflicts`)
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
        <h2>Docs in Conflict</h2>
        ${!this.ready ? html`
          Loading docs in conflict: ${this.loadCount}
        `: html`
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
              ${this.ready ? html`
                <div class="no-matches">
                  ${this.matches.length} ${this.matches.length === 1 ? `match` : `matches`} found.
                </div>
              `:``}
              ${this.matches.length > 0 ? html`
                <table class="matches">
                  <tr class="header">
                    <td> ID </td>
                    <td> Number of conflicts </td>
                  </tr>
                  ${this.matches.map(match => html`
                    <tr @click="${() => { this.selection = match }}">
                      <td>${match.id}</td> 
                      <td>${match.conflicts.length}</td>
                    </tr>
                  `)}
                </table>
              `: ``}
            </td>
            <td class="selection">
              ${this.selection.id ? html`
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
    const currentDoc = (await axios.get(`/db/${groupId}/${docId}`)).data
    const docWithConflictRevs = (await axios.get(`/db/${groupId}/${docId}?conflicts=true`)).data
    const conflictRevisionIds = docWithConflictRevs._conflicts
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
    return {
      id: currentDoc._id,
      rev: currentDoc._rev,
      doc: currentDoc,
      conflicts 
    }
  }

}

customElements.define('search-active-conflicts', SearchActiveConflicts);
