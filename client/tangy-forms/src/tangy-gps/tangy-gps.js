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
    <template is="dom-if" if="[[currentLatitude]]">
      Accuracy: [[currentAccuracy]] meters<br>
      Accuracy Level : [[accuracyLevel]]
    </template> 
    </div>
    <div>
    <template is="dom-if" if="[[!currentLatitude]]">
        Searching...
    </template> 
    </div>
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
        type: Object,
        value: {
          latitude: undefined,
          longitude: undefined,
          accuracy: undefined 
        },
        observer: 'reflect',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false, 
        observer: 'reflect',
        reflectToAttribute: true
      },
      advancedMode: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    super.ready();
    this.active = true
    this.getGeolocationPosition()
    this.currentAccuracy = '...'
    this.accuracyLevel = '...'
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.active = false
  }

  reflect() {
    this.recordedLatitude = this.value.recordedLatitude
    this.recordedLongitude = this.value.recordedLongitude
    this.recordedAccuracy = this.value.recordedAccuracy
  }
  getGeolocationPosition() {
    const options = {
      enableHighAccuracy: true
    };
    const queue = JSON.parse(localStorage.getItem('gpsQueue')) ? (JSON.parse(localStorage.getItem('gpsQueue'))) : undefined;
    if ((typeof queue !== 'undefined' && ((new Date).getTime() - queue.timestamp) / 1000 / 60 <= 5)) {
      this.currentLatitude = queue.latitude;
      this.currentLongitude = queue.longitude;
      this.currentAccuracy = queue.accuracy;
      if (!this.disabled) this.saveCurrentPosition();
    }
    navigator.geolocation.getCurrentPosition((position) => {
      // Bail if this element has been marked inactive on disconnected callback.
      if (!this.active) return
      // Accuracy is in meters, a lower reading is better
      if (!queue || (typeof queue !== 'undefined' && ((position.timestamp - queue.timestamp) / 1000) >= 15) ||
        queue.accuracy >= position.coords.accuracy) {
        this.currentLatitude = position.coords.latitude;
        this.currentLongitude = position.coords.longitude;
        this.currentAccuracy = position.coords.accuracy;
        const x = {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        localStorage.setItem('gpsQueue', JSON.stringify(x));
        if (!this.disabled) this.saveCurrentPosition();

      } else {
        this.currentLatitude = queue.latitude;
        this.currentLongitude = queue.longitude;
        this.currentAccuracy = queue.accuracy;
        if (!this.disabled) this.saveCurrentPosition();
      }
      this.getGeolocationPosition()

    },
      (err) => { },
      options);
  }
  saveCurrentPosition() {
    this.value = {
      latitude: this.currentLatitude,
      longitude: this.currentLongitude,
      accuracy: this.currentAccuracy
    };
    this.dispatchEvent(new Event('change'));
    if (this.currentAccuracy < 50) {
      this.accuracyLevel = 'Good';
    }
    if (this.currentAccuracy > 50) {
      this.accuracyLevel = 'Poor';
    }
  }

  validate() {
    if (!this.required) return true
    if (this.value.latitude && this.value.longitude && this.value.accuracy) {
      return true
    } else {
      return false
    }
  }

  _isAdvancedMode(currentLatitude, advancedMode) {
    return (currentLatitude && advancedMode);
  }
}

window.customElements.define(TangyGps.is, TangyGps);
