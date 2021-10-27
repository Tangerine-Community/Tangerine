import { plotlyStyles } from './plotly-styles.js'
import { LitElement, html } from 'lit-element'
import PouchDb from 'pouchdb'

class CasesEnrolledBarChart extends LitElement {

  static get properties(){
    return {
      dbUrl: { type: String }
    };
  }

  static get styles() {
    return [
      plotlyStyles
    ]
  }

  render() {
    return html`
      <style>
        #myDiv {
          width: 800px;
          height: 800px;
        }
      </style>
      <paper-card heading="Cases enrolled bar chart">
        <div class="card-content">
          <div id="myDiv"></div>
        </div>
      </paper-card>
    `
  }

  async updated() {
    this.db = new PouchDb(this.dbUrl)
    const casesEnrolledCaseType1Response = await this.db.query('dashboard/casesEnrolledCaseType1', { reduce: true })
    const casesEnrolledCaseType1Count = casesEnrolledCaseType1Response.rows[0]?.value || 0
    const casesEnrolledCaseType2Response = await this.db.query('dashboard/casesEnrolledCaseType2', { reduce: true })
    const casesEnrolledCaseType2Count = casesEnrolledCaseType2Response.rows[0]?.value || 0
    const data = [
      {
        x: ['case-type-1', 'case-type-2'],
        y: [casesEnrolledCaseType1Count, casesEnrolledCaseType2Count],
        type: 'bar'
      }
    ]
    Plotly.newPlot(this.shadowRoot.querySelector('#myDiv'), data);
  }

}

customElements.define('cases-enrolled-bar-chart', CasesEnrolledBarChart);
