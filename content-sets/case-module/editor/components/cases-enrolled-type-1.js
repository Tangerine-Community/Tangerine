import { sharedStyles } from './shared-styles.js'
import { LitElement, html } from 'lit-element'
import PouchDb from 'pouchdb'

class CasesEnrolledType1 extends LitElement {

  static get styles() {
    return [
      sharedStyles
    ]
  }

  static get properties(){
    return {
      ready: { type: Boolean },
      dbUrl: { type: String },
      count: { type: Number }
    };
  }

  async connectedCallback() {
    super.connectedCallback()
    this.db = new PouchDb(this.dbUrl)
    await this.load()
    this.ready = true
  }

  async load() {
    const result = await this.db.query('dashboard/casesEnrolledCaseType1', { reduce: true })
    this.count = result.rows[0].value
  }

  render() {
    return html`
      <style>
        .card-content {
          font-size: 3em;
          text-align: center;
        }
      </style>
      <paper-card heading="Number of enrolled Case Type 1 cases">
        <div class="card-content">
          ${!this.ready ? html`
            Loading... 
          `: html`
            ${this.count}
          `}
        </div>
      </paper-hard>
    `
  }

}

customElements.define('cases-enrolled-type-1', CasesEnrolledType1);
