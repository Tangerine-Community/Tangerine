/* jshint esversion: 6 */

/*
 * CSS style module for all related Tangy Form components. 
 * 
 * This module keeps consistent the styling of common elements that tangy form 
 * related elements use such as styles  paper-fab and paper-card.
 * 
 */

const $_documentStyleContainer = document.createElement('div');
$_documentStyleContainer.setAttribute('style', 'display: none;');

$_documentStyleContainer.innerHTML = `
  <dom-module id="tangy-common-styles">
  <template>
  <style is="tangy-common-styles">
      paper-fab, paper-card {
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        transition: all 0.3s cubic-bezier(.25,.8,.25,1);
      }
      paper-checkbox {
        --paper-checkbox-size: 1.25em;
        --paper-checkbox-checked-color: var(--primary-color);
      }
  </style>
  </template>
  </dom-module>
`

document.head.appendChild($_documentStyleContainer);