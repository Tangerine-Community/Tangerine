/* jshint esversion: 6 */

/*
 * CSS style module for Tangy Form Elements. 
 * 
 * This module keeps styling of state consistent for things like disabled, invalid,
 * and required.
 */

const $_documentStyleContainer = document.createElement('div');
$_documentStyleContainer.setAttribute('style', 'display: none;');

$_documentStyleContainer.innerHTML = `<dom-module id="tangy-element-styles">
  <template><style is="tangy-element-styles">
      :host {
        color: var(--primary-text-color);
        display: block;
        position: relative;
        border: solid white 5px;
        padding: 10px;
        margin: 10px 0 45px 0px;
      }

      :host(:not([hidden])) {
        -webkit-transition: opacity .5s ease-in-out, max-height .5s ease-in-out;
        -moz-transition: opacity .5s ease-in-out, max-height .5s ease-in-out;
        -ms-transition: opacity .5s ease-in-out, max-height .5s ease-in-out;
        -o-transition: opacity .5s ease-in-out, max-height .5s ease-in-out;
        opacity: 1;
        max-height: 3000px;
      }

      :host([hidden]) {
        -webkit-transition: 
          opacity .5s ease-in-out, 
          max-height .5s ease-in-out,
          border .5s ease-in-out, 
          margin .5s ease-in-out, 
          padding .5s ease-in-out;
        opacity: 0;
        max-height: 0px;
        border: 0px;
        margin: 0px;
        padding: 0px;
      }

      :host([disabled]:not([hidden])) {
        color: var(--disabled-color);
        opacity: .7;
      }

      :host([invalid]) {
        border: solid var(--error-color) 5px;
      }

      :host([required]:not([disabled]))::before  { 
        content: "*"; 
        color: var(--accent-color); 
        position: absolute;
        top: 14px;
        left: -5px;
        font-size: 21px;
      }

      :host([disabled]) label {
        /* color: var(--disabled-color); */
      }


      label {
        display: block;
        font-size: 1.2em;
        margin-bottom: 15px;
        color: var(--primary-text-color);
        margin-bottom: 5px;
      }
  
      .secondary_color {
        color: var(--accent-color);
      }
   
  
    </style>
    </template>
    </dom-module>
    `

document.head.appendChild($_documentStyleContainer);
