/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-common-styles.js'

/**
 * `tangy-overlay`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyOverlay extends PolymerElement {


  static get template () {
    return `

    <style include="tangy-common-styles"></style>
    <style>
    #overlay {
      position: fixed; /* Sit on top of the page content */
      display: none; /* Hidden by default */
      width: 100%; /* Full width (cover the whole page) */
      height: 100%; /* Full height (cover the whole page) */
      top: 0; 
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5); /* Black background with opacity */
      z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
      cursor: pointer; /* Add a pointer on hover */
      text-align:center;
    }
    #lightbox {
      width: calc(100vw - 100px);
      height: calc(100vh - 100px);
      /*margin: 0;*/
      padding: 0;
      background-color: #fafafa;
      margin:auto;
    }
    
    .media-button-top-left {
      left:20px;
      padding: 10px;
      margin-left: -10px;
      margin-top: -20px;
    }
    .media-button-top-right {
      position: absolute;
      top:0;
      right:20px;
      padding: 10px;
      z-index: 103;
      margin-top: -20px;
    }
    .media-button-bottom-left {
      position: absolute;
      bottom:0;
      left:20px;
      margin:10px;
    }
    .media-button-bottom-right {
      position: absolute;
      bottom:0;
      right:20px;
      margin:10px;
    }

    </style>

    <div id="media-button" on-click="open" >
    </div>
    
    <div id="overlay">
        <div id="lightbox" on-click="off">
        </div>
    </div>
    <br/>
    
    `
  }

  static get is () {
    return 'tangy-overlay'
  }

  static get properties() {
    return {
      onOpen: {
        type: String,
        value: ''
      },
      position: {
        type: String,
        value: '',
        reflectToAttribute: true,
      },
      overlayContent: {
        type: String,
        value: '',
      },
      icon: {
        type: String,
        value: 'icons:open-with'
      }
    };
  }

  // Element class can define custom element reactions
  connectedCallback() {
    super.connectedCallback();
    // Set up the store.
    this.store = window.tangyFormStore
    this.$['media-button'].innerHTML = `
      <paper-fab icon="${this.icon}" raised on-click="open"></paper-fab>
    `
    if (this.position === 'top-right') {
      this.shadowRoot.getElementById('media-button').className = 'media-button-top-right'
    } else if (this.position === 'top-left') {
      this.shadowRoot.getElementById('media-button').className = 'media-button-top-left'
    } else if (this.position === 'bottom-right') {
      this.shadowRoot.getElementById('media-button').className = 'media-button-bottom-right'
    } else if (this.position === 'bottom-left') {
      this.shadowRoot.getElementById('media-button').className = 'media-button-bottom-left'
    }
  }

  open(ev) {
    if (this.onOpen) {
      let getValue = this.getValue.bind(this)
      let newOverlayContent = ''
      eval(`
        function go() {
          ${this.onOpen}
        }
        newOverlayContent = go()
      `)
      this.$.lightbox.innerHTML = newOverlayContent
    } else {
      this.$.lightbox.innerHTML = this.innerHTML 
    }
    this.on()
  }

  getValue(name) {
    let state = this.store.getState()
    let input = state.inputs.find((input) => input.name == name)
    if (input) return input.value
  }

  on() {
    this.shadowRoot.getElementById("overlay").style.display = "block";
  }

  off() {
    this.shadowRoot.getElementById("overlay").style.display = "none";
  }

}
window.customElements.define(TangyOverlay.is, TangyOverlay)
