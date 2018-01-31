import { Element } from '../../node_modules/@polymer/polymer/polymer-element.js'

/**
 * `tangy-timed`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyGps extends Element {
  static get template() {
    return `
  <style>
    :host {
      display: block;
    }
    :host([required]:not([disabled])) label::before  { 
      content: "*"; 
      color: red; 
      position: absolute;
      top: 4px;
      right: 5px;
    }
  </style>
  <div>
    <b>Current Position</b>
    <div>
      <template is="dom-if" if="{{currentLatitude}}">
        Latitude: {{currentLatitude}} <br> 
        Longitude: {{currentLongitude}} <br>
        Accuracy: {{currentAccuracy}} meters<br> 
      </template>
      <template is="dom-if" if="{{!currentLatitude}}">
        Searching...
      </template> 
    </div>
    <b>Recorded Position</b>
    <div>
      <template is="dom-if" if="{{recordedLatitude}}">
        Latitude: {{recordedLatitude}} <br> 
        Longitude: {{recordedLongitude}} <br>
        Accuracy: {{recordedAccuracy}} meters<br> 
      </template>
    </div>
    <paper-button raised on-click="clickedRecord">record position</paper-button>
    <slot></slot>
  </div> 
`;
  }

  static get is() { return 'tangy-gps'; }

  static get properties() {
    return {
      name: {
        type: String,
        value: 'tangy-gps' 
      },
      value: {
        type: Object,
        value: {},
        observer: 'reflect',
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    this.currentLatitude = ''
    this.currentLongitude = ''
    this.currentAccuracy = ''
    // window.gpsPosition may already be watched from another location. Allow for that.
    if (!window.gpsPosition) {
      navigator.geolocation.watchPosition((position) => {
        window.gpsPosition = {
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        this.updateWatchedPosition()
      })
    } else {
      this.updateWatchedPosition()
    }
  }

  updateWatchedPosition() {
    setInterval(() => {
      this.currentLatitude = window.gpsPosition.latitude
      this.currentLongitude = window.gpsPosition.longitude
      this.currentAccuracy = window.gpsPosition.accuracy
    }, 2000)
  }

  reflect() {
    this.recordedLatitude = this.value.recordedLatitude
    this.recordedLongitude = this.value.recordedLongitude
    this.recordedAccuracy = this.value.recordedAccuracy
  }

  clickedRecord() {
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {bubbles: true, detail: {
      inputName: this.name,
      inputValue: {
        recordedLatitude: this.currentLatitude,
        recordedLongitude: this.currentLongitude,
        recordedAccuracy: this.currentAccuracy
      },
      inputIncomplete: false,
      inputInvalid: false 
    }}))
  }

}

window.customElements.define(TangyGps.is, TangyGps);
