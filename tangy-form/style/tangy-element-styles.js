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
        border: var(--tangy-element-border, solid transparent 5px);
        padding: 0px;
        margin: var(--tangy-element-margin, 10px);
      }

      :host([hidden]), :host([skipped]) {
        display: none;
      }

      :host([disabled]:not([hidden])) {
        color: var(--disabled-color);
        opacity: .7;
      }

      /*
      :host([invalid]) {
        border: solid var(--error-color) 5px;
      }
      */
     
      :host([required]:not([disabled]))::before  { 
        content: "*"; 
        color: var(--accent-color); 
        position: absolute;
        top: var(--tangy-required-indicator--font-size, -2px);
        left: var(--tangy-required-indicator--font-size, -18px);
        font-size: var(--tangy-required-indicator--font-size, 2rem);
        padding-top: 24px;
      }

      :host([disabled]) label {
        /* color: var(--disabled-color); */
      }

      .flex-container {
        display: flex;
      }
      .flex-container > #qnum-content {
        width: 100%;
        /* padding-right: 2em; */
      }
      #qnum-number > label {
        margin-right: 0.5rem;
        min-width: 2em;
      }
      #qnum-number > label:empty {
        margin: 0;
        min-width: 0;
      }

      label {
        font-family: var(--paper-font-common-base_-_font-family);
        display: block;
        font-size: 1.2rem;
        color: var(--primary-text-color);
        margin-bottom: 5px;
      }

      /*
       * error-text
       */
      #error-text, #errorText {
        font-family: var(--paper-font-common-base_-_font-family);
        font-size: medium;
        font-weight: bold;
        color: var(--error-color);
        display: flex;
        margin-bottom: 30px;
      }
      #error-text > iron-icon, #errorText > iron-icon {
        padding-right: 0.8em;
        height: 24px;
        width: 24px;
      }
      #error-text > div, #errorText > div {
        line-height: 24px;
      }
      #error-text:empty, #errorText:empty {
        margin-bottom: 0;
      }

      /*
       * warn-text
       */
      #warn-text, #warnText {
        font-family: var(--paper-font-common-base_-_font-family);
        font-size: medium;
        font-weight: bold;
        color: var(--warn-color);
        display: flex;
        margin-bottom: 30px;
        background-color: var(--warn-background-color);
        padding: 0.5em;
      }
      #warn-text > iron-icon, #warnText > iron-icon {
        padding-right: 0.8em;
        height: 24px;
        width: 24px;
        min-width: 24px;
      }
      #warn-text > div, #warnText > div {
        line-height: 24px;
      }
      #warn-text:empty, #warnText:empty {
        margin-bottom: 0;
        background-color: transparent;
      }

      /*
       * discrepancy-text
       */
      #discrepancy-text {
        font-family: var(--paper-font-common-base_-_font-family);
        font-size: medium;
        font-weight: bold;
        color: var(--error-color);
        display: flex;
        margin-bottom: 30px;
      }
      #discrepancy-text > iron-icon {
        padding-right: 0.8em;
        height: 24px;
        width: 24px;
      }
      #discrepancy-text > div {
        line-height: 24px;
      }
      #discrepancy-text:empty {
        margin-bottom: 0;
      }

      .secondary_color {
        color: var(--accent-color);
      }

      .m-y-25 {
        margin: var(--tangy-form-widget--margin, 25px 0);
      }
   
      audio {
        color: var(--accent-text-color, #fff);
        border-radius: 4px;
        padding: 4px 8px;
        margin-top: 10px;
        box-sizing: border-box;
      }
      audio::-webkit-media-controls-play-button,
      audio::-webkit-media-controls-panel {
        background-color: var(--accent-color, #fff);
        color: var(--accent-text-color, #fff);
      }

      #audio-motion-container {
        display: flex;
        max-height: 48px;
      }
     
  
    </style>
    </template>
    </dom-module>
    `

document.head.appendChild($_documentStyleContainer);
