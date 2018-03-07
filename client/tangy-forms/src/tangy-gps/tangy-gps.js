import { Element } from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-common-styles.js'
import '../tangy-form/tangy-element-styles.js'

/**
 * `tangy-timed`
 * 
 *
 * @customElement
 * @polymer
 * The attribute `advanced-mode` defaults to false. If set to true in the mark-up
 * it shows the latitude, Longitude, Acuuracy, And accuracy Levels
 * @demo demo/index.html
 */
class TangyGps extends Element {
  static get template() {
    return `
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
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
   .coordinates {
     margin: 5px 15px;
   }
  
  </style>
  <div class="coordinates">
    <b>Current Position</b>
    <div>
      <template is="dom-if" if="{{_isAdvancedMode(currentLatitude, advancedMode)}}">
        Latitude: [[currentLatitude]] <br>
        Longitude: [[currentLongitude]] <br>
      </template>
    <div>
      Accuracy: [[currentAccuracy]] meters<br>
      Accuracy Level : [[accuracyLevel]]
    </div>
      <template is="dom-if" if="[[!currentLatitude]]">
        Searching...
      </template> 
    </div>
    <div>
      <h3>Tips</h3>
      <p>Try standing next to a window</p>
      <p>Try moving outside with a clear view of the sky</p>
      <p>Try standing away from trees or buildings</p>
    </div>
    <br>
    
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
        type: Array,
        value: [
          {name: 'latitude', value: ''},
          {name: 'longitude', value: ''},
          {name: 'accuracy', value: ''}
        ], 
        observer: 'reflect',
        reflectToAttribute: true
      },
      advancedMode: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    this.currentLatitude = localStorage.getItem('currentLatitude');
    this.currentLongitude = localStorage.getItem('currentLongitude');
    this.currentAccuracy = localStorage.getItem('currentAccuracy');

    navigator.geolocation.watchPosition((position) => {
      // The accuracy is measured in meters. A lower value is more desirable
      if (position.coords.accuracy <= this.currentAccuracy) {
        this.currentLatitude = position.coords.latitude;
        this.currentLongitude = position.coords.longitude;
        this.currentAccuracy = position.coords.accuracy;
      }
      this.saveCurrentPosition();
    });
    if (this.currentAccuracy < 50) {
      this.accuracyLevel = 'Good';
    }
    if (this.currentAccuracy > 100) {
      this.accuracyLevel = 'Poor';
    }
    else {
      this.accuracyLevel = 'Okay';
    }
  }

  reflect() {
    this.recordedLatitude = this.value.recordedLatitude
    this.recordedLongitude = this.value.recordedLongitude
    this.recordedAccuracy = this.value.recordedAccuracy
  }

  saveCurrentPosition() {
    this.dispatchEvent(new CustomEvent('INPUT_VALUE_CHANGE', {
      bubbles: true, detail: {
        inputName: this.name,
        inputValue: {
          recordedLatitude: this.currentLatitude,
          recordedLongitude: this.currentLongitude,
          recordedAccuracy: this.currentAccuracy
        },
        inputIncomplete: false,
        inputInvalid: false
      }
    }));
  }
  _isAdvancedMode(currentLatitude, advancedMode) {
    return (currentLatitude && advancedMode);
  }
}

window.customElements.define(TangyGps.is, TangyGps);
