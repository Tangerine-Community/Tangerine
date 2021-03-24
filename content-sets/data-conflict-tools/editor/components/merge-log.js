import { sharedStyles } from './shared-styles.js'
import axios from 'axios'
import * as Jsondiffpatch from 'jsondiffpatch'
var jsondiffpatch = Jsondiffpatch.create({});


import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
class MergeLog extends LitElement {

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
    this.selection = { diff: undefined }
  }

  async connectedCallback() {
    super.connectedCallback()
    const groupId = window.location.pathname.split('/')[2]
    const result = await axios.get(`/db/${groupId}-merge-log/_all_docs?include_docs=true`)
    this.list = result.data.rows
      .map(row => row.doc)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
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
        ${!this.ready ? html`
          Loading merge log... 
        `: ``}
        <table>
          <tr>
            <td valign="top">
              <h2>Merge Log</h2>
              ${this.list.length > 0 ? html`
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
                  ${this.list.map(item => html`
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
              ${this.selection.diff ? html`
                <h2>Diff for Merge ${this.selection._id}</h2>
                ${unsafeHTML(Jsondiffpatch.formatters.html.format(this.selection.diff, this.selection.originalDoc))}
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
