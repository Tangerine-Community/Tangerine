import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../util/html-element-props.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import { TangyInputBase } from '../tangy-input-base.js'

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
class TangyGps extends TangyInputBase {

  static get is() { return 'tangy-gps'; }

  constructor() {
    super()
    this.t = {
      'searching': t('Searching'),
      'latitude': t('Latitude'),
      'longitude': t('Longitude'),
      'accuracy': t('Accuracy'),
      'accuracyLevel': t('Accuracy Level'),
      'distanceFromReference': t('Distance from reference')
    }
  }

  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
      :host {
        display: block;
      }
      :host([hide-coordinates]) #lat-long {
        display:none;
      }
      :host([hide-accuracy-level]) #accuracy-level {
        display:none;
      }
      :host([hide-accuracy-distance]) #accuracy-distance {
        display:none;
      }
      :host([in-geofence]) .geofence-message {
        display: inline;
        animation: fadein 2s;
      }
      :host([invalid]) .geofence-message {
        display: inline;
        animation: fadein 2s;
        background-color: red;
      }
      .geofence-message-container {
        text-align: center;
        margin-top: 15px;
      }
      .geofence-message {
        display: none;
        margin: 5px; 0px 0px;
        background: #28a745;
        color: white;
        padding: 5px;
        border-radius: 5px;
      }
      @keyframes fadein {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .label {
          font-weight: bold;
      }
      .coordinates {
        margin: 0;
      }
      #hint-text{
        margin-top:6px;
      }
      .hint-text {
        margin-left: 15px;
        margin-right: 15px;
      }
    </style>
    <div class="flex-container m-y-25">
  <div id="qnum-number"></div>
  <div id="qnum-content">
    <label id="label"></label>
    <label class="hint-text"></label>
    <div class="coordinates">
      <template is="dom-if" if="[[!disabled]]">
        <div id="lat-long">
          <span class="label">[[t.latitude]]:</span> [[currentLatitude]] <br>
          <span class="label">[[t.longitude]]:</span> [[currentLongitude]] <br>
        </div>

        <template is="dom-if" if="[[currentLatitude]]">
          <div id="accuracy-distance">
            <span class="label">[[t.accuracy]]:</span> [[currentAccuracy]] meters<br>
          </div>
          <div id="accuracy-level">
            <span class="label">[[t.accuracyLevel]]:</span> [[accuracyLevel]]
          </div>
        </template>

        <template is="dom-if" if="{{hasDelta}}">
          <br>
          <span class="label">[[t.disanceFromReference]]:</span> [[currentDelta]] meters
        </template>
        </template>
    </div>

    <div>
      <template is="dom-if" if="[[!currentLatitude]]">
          [[t.searching]]...
      </template>
      <div class="geofence-message-container">
        <div class="geofence-message"> [[geofenceMessage]]</div>
      </div>
    </div>
    <div id="error-text"></div>
    <div id="warn-text"></div>
    <div id="discrepancy-text"></div>
    <div>
    <template is="dom-if" if="{{isDisabledAndHasValue(disabled, value.latitude)}}">
      <div id="lat-long">
          <span class="label">[[t.latitude]]:</span> [[value.latitude]] <br>
          <span class="label">[[t.longitude]]:</span> [[value.longitude]] <br>
        </div>

        <template is="dom-if" if="[[value.accuracy]]">
          <div id="accuracy-distance">
            <span class="label">[[t.accuracy]]:</span> [[value.accuracy]] meters<br>
          </div>
        </template>
    </div>
  </div>
</div>
</div>
  `;
  }

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
      label: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      hintText: {
        type: String,
        value: '',
        observer: 'onHintTextChange',
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        observer: 'reflect',
        reflectToAttribute: true
      },
      hideAccuracyDistance: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideAccuracyLevel: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      hideCoordinates: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      referenceLatitude: {
        type: Number,
        observer: 'saveCurrentPosition',
        value: undefined
      },
      referenceLongitude: {
        type: Number,
        observer: 'saveCurrentPosition',
        value: undefined 
      },
      inGeofence: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      validMaxDelta: {
        type: Number,
        value: undefined
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'onInvalidChange',
        reflectToAttribute: true
      },
      hasWarning: {
        type: Boolean,
        value: false,
        observer: 'onWarnChange',
        reflectToAttribute: true
      },
      hasDiscrepancy: {
        type: Boolean,
        value: false,
        observer: 'onDiscrepancyChange',
        reflectToAttribute: true
      },
      hintText: {
        type: String,
        value: '',
        observer: 'onHintTextChange',
        reflectToAttribute: true
      },
      errorText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      warnText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      discrepancyText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  ready() {
    this.hasDelta = false
    super.ready();
    this.active = true
    this.getGeolocationPosition()
    this.currentAccuracy = '...'
    this.accuracyLevel = '...'
    this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number') 
      ? `<label>${this.getAttribute('question-number')}</label>`
      : ''
    this.shadowRoot.querySelector('#label').innerHTML = this.label
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

  onHintTextChange(value) {
    this.shadowRoot.querySelector('.hint-text').innerHTML = value ? value : ''
  }

  onInvalidChange(value) {
    this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
      ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
      : ''
  }
    
  onDiscrepancyChange(value) {
    this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
      ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
      : ''
  }

  onWarnChange(value) {
    this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
      ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
      : ''
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

    if (this.referenceLatitude === undefined && this.referenceLongitude === undefined) {
      this.value = {
        latitude: this.currentLatitude,
        longitude: this.currentLongitude,
        accuracy: this.currentAccuracy
      }
    } else {
      this.value = {
        latitude: this.currentLatitude,
        longitude: this.currentLongitude,
        accuracy: this.currentAccuracy,
        delta: this._getDistanceFromLatLonInKm(
          this.currentLatitude,
          this.currentLongitude,
          this.referenceLatitude,
          this.referenceLongitude
        )
      }

      this.currentDelta = Math.floor(this.value.delta * 1000)
      this.hasDelta = true
      if (this.validMaxDelta) {
        this.hasGeofence = true
        this.inGeofence = (this.validMaxDelta > this.currentDelta) ? true : false
        this.invalid = (this.validMaxDelta > this.currentDelta) ? false : true 
        this.geofenceMessage = (this.inGeofence) ? `✔ ${t('location verified')}` : t(`✗ ${t('location not verified')}`)
      }
    }
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
      this.removeAttribute('invalid')
      return true
    } else {
      this.setAttribute('invalid', '')
      return false
    }
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

  _isAdvancedMode(currentLatitude, advancedMode) {
    return (currentLatitude && advancedMode);
  }

  _getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this._deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this._deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  _deg2rad(deg) {
    return deg * (Math.PI/180)
  }
  isDisabledAndHasValue(disabled, value){
    return disabled && value
  }
}

window.customElements.define(TangyGps.is, TangyGps);
