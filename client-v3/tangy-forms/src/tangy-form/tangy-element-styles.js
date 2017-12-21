/* jshint esversion: 6 */

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
        margin: 0 15px 15px 0px;
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
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
        top: 4px;
        right: -5px;
      }

      :host([disabled]) label {
        /* color: var(--disabled-color); */
      }


      label {
        display: block;
        font-size: 1.2em;
        margin-bottom: 15px;
        /*
        color: var(--primary-text-color);
        */
      }

    </style>
    </template>
    </dom-module>
    `

document.head.appendChild($_documentStyleContainer);