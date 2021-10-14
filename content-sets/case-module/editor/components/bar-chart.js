/*
 * This Example is adapted from Plotly's Bar Chart example.
 * https://plotly.com/javascript/bar-charts/#basic-bar-chart
 */

import { plotlyStyles } from './plotly-styles.js'
import { LitElement, html } from 'lit-element'

class BarChart extends LitElement {

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
      <paper-card heading="Animals">
        <div class="card-content">
          <div id="myDiv"></div>
        </div>
      </paper-card>
    `
  }

  async updated() {
    this.data = [
      {
        x: ['giraffes', 'orangutans', 'monkeys'],
        y: [20, 14, 23],
        type: 'bar'
      }
    ];
    Plotly.newPlot(this.shadowRoot.querySelector('#myDiv'), this.data);
  }

}

customElements.define('bar-chart', BarChart);
