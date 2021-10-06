import { plotlyStyles } from './plotly-styles.js'
import { LitElement, html } from 'lit-element'

class BarChartFromJsonFile extends LitElement {

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
      <paper-card heading="Animals from JSON File">
        <div class="card-content">
          <div id="myDiv"></div>
        </div>
      </paper-card>
    `
  }

  async updated() {
    const response = await fetch('./files/editor/data/animal-counts-by-animal.json')
    const animalCountsByAnimal = await response.json()
    const animals = Object.keys(animalCountsByAnimal)
    const axis = {
      x: [],
      y: []
    }
    for (let animal of animals) {
      axis.x.push(animal)
      axis.y.push(animalCountsByAnimal[animal])
    }
    this.data = [
      {
        ...axis,
        type: 'bar'
      }
    ]
    Plotly.newPlot(this.shadowRoot.querySelector('#myDiv'), this.data);
  }

}

customElements.define('bar-chart-from-json-file', BarChartFromJsonFile);
