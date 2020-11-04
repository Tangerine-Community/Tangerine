(()=>{var e={985:()=>{class e extends LitElement{render(){return html`
      <ul>
        <li @click="${this.openPage1}">Go to Page 1</li>
        <li @click="${this.openPage2}">Go to Page 2</li>
      </ul>
    `}openPage1(){window.customApp.open("page1")}openPage2(){window.customApp.open("page2")}}customElements.define("home-component",e)},109:()=>{class e extends LitElement{render(){return html`
      <style>
        p {
          margin: 15px;
        }
        paper-button {
          background: #CCC;
        }
      </style>
      <paper-button @click="${this.goBack}"><mwc-icon>chevron_left</mwc-icon>Go back</paper-button>
      <p>
        This is page 1.
      </p>
    `}goBack(){window.customApp.open("")}}customElements.define("page-1",e)},104:()=>{class e extends LitElement{render(){return html`
      <style>
        p {
          margin: 25px;
        }
        paper-button {
          background: #CCC;
        }
      </style>
      <paper-button @click="${this.goBack}"><mwc-icon>chevron_left</mwc-icon>Go back</paper-button>
      <p>
        This is page 2.
      </p>
    `}goBack(){window.customApp.open("")}}customElements.define("page-2",e)}},t={};function o(n){if(t[n])return t[n].exports;var p=t[n]={exports:{}};return e[n](p,p.exports,o),p.exports}(()=>{"use strict";o(985),o(109),o(104);class e extends LitElement{static get properties(){return{route:{type:String}}}constructor(){super(),window.customApp=this,this.route=""}render(){return html`
      ${""===this.route?html`
        <home-component></home-component>
      `:""}
      ${"page1"===this.route?html`
        <page-1></page-1>
      `:""}
      ${"page2"===this.route?html`
        <page-2></page-2>
      `:""}
    `}open(e){this.route=e}}customElements.define("custom-app",e)})()})();