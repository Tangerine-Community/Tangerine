import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import PouchDb from 'pouchdb'
import './cases-enrolled-type-1.js'
import './cases-enrolled-type-2.js'
import './bar-chart.js'
import './bar-chart-from-json-file.js'
import './cases-enrolled-bar-chart.js'

class CustomApp extends LitElement {

  static get properties() {
    return { 
      route: { type: String },
      ready: { type: String },
      dbUrl: { type: String },
      needsInstall: { type: Boolean }
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
    this.dbUrl = `${window.location.protocol}//${window.location.hostname}/db/${window.location.href.split('/')[4]}`
    this.db = new PouchDb(this.dbUrl)
    try {
      const ddoc = await this.db.get('_design/dashboard')
      if (this.getDdoc().version > ddoc.version) {
        this.needsInstall = true
      }
    } catch(err) {
      this.needsInstall = true
    }
    if (!this.needsInstall) {
      this.ready = true
    }
  }

  getDdoc() {
    return {
      _id: '_design/dashboard',
      version: 5,
      views: {
        casesEnrolledCaseType1: {
          map: function(doc) {
            if (
              doc.type === 'case' &&
              doc.form &&
              doc.form.id === 'case-type-1-manifest' &&
              doc.items &&
              doc.items[0] &&
              doc.items[0].inputs
            ) {
              var foundParticipantId = false
              doc.items[0].inputs.forEach(function(input) {
                if (input.name === 'participant_id' && input.value) {
                  foundParticipantId = true
                }
              })
              if (foundParticipantId) {
                emit(doc._id, 1)
              }
            }
          }.toString(),
          reduce: '_sum'
        },
        casesEnrolledCaseType2: {
          map: function(doc) {
            if (
              doc.type === 'case' &&
              doc.form &&
              doc.form.id === 'case-type-2-manifest' &&
              doc.items &&
              doc.items[0] &&
              doc.items[0].inputs
            ) {
              var foundParticipantId = false
              doc.items[0].inputs.forEach(function(input) {
                if (input.name === 'participant_id' && input.value) {
                  foundParticipantId = true
                }
              })
              if (foundParticipantId) {
                emit(doc._id, 1)
              }
            }
          }.toString(),
          reduce: '_sum'
        }
      }
    }
  }

  async install() {
    const ddoc = this.getDdoc()
    try { 
      const currentDdoc = await this.db.get('_design/dashboard')
      ddoc._rev = currentDdoc._rev
    } catch(e) {  }
    await this.db.put(ddoc)
    this.needsInstall = false
    this.ready = true
  }

  render() {
    return html`
      <style type="text/css">
        #container {
          margin: 15px;
        }
        .widget {
          margin: 15px;
        }
      </style>
      <div id="container">
        <h1>Dashboard</h1>
        ${!this.ready && !this.needsInstall ? html`Loading...`:``}
        ${this.needsInstall === true ? html`
          Installation is needed. Click install button. <br>
          <paper-button @click="${() => this.install()}">install</paper-button> 
        `: ''}
        ${this.ready ? html`
          <table>
            <tr>
              <td colspan="2">
                <bar-chart class="widget"></bar-chart>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <bar-chart-from-json-file class="widget"></bar-chart-from-json-file>
              </td>
            </tr>
            <tr>
              <td>
                <cases-enrolled-type-1 dbUrl="${this.dbUrl}" class="widget"></cases-enrolled-type-1>
              </td>
              <td>
                <cases-enrolled-type-2 dbUrl="${this.dbUrl}" class="widget"></cases-enrolled-type-2>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <cases-enrolled-bar-chart class="widget" dbUrl="${this.dbUrl}"></cases-enrolled-bar-chart>
              </td>
            </tr>
          </table>
        `: ``}
      </div>
    `
  }

}

customElements.define('custom-app', CustomApp)