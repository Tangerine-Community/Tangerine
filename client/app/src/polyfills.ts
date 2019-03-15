
// Fix for global undefined https://github.com/angular/angular-cli/issues/9920#issuecomment-393424161
(window as any).global = window;

import Plotly from 'plotly.js-dist';
(window as any).Plotly = Plotly;

import * as Redux from 'redux';
(window as any).Redux = Redux;

import * as _ from 'underscore';
(window as any)._ = _;

//   <!-- Tangy Elements -->
import 'tangy-form/tangy-form.js'
import 'tangy-form/input/tangy-box.js'
import 'tangy-form/input/tangy-input.js'
import 'tangy-form/input/tangy-timed.js'
import 'tangy-form/input/tangy-checkbox.js'
import 'tangy-form/input/tangy-checkboxes.js'
import 'tangy-form/input/tangy-radio-buttons.js'
import 'tangy-form/input/tangy-select.js'
import 'tangy-form/input/tangy-location.js'
import 'tangy-form/input/tangy-gps.js'
import 'tangy-form/input/tangy-acasi.js';
import 'tangy-form/input/tangy-eftouch.js';
import 'tangy-form/input/tangy-photo-capture.js';
import 'tangy-form/input/tangy-qr.js';

// An attempt to fix something...
//import 'core-js/es7/reflect';

// Fix for the way Angular builds pouchdb https://github.com/pouchdb/pouchdb/issues/7299
// Also probably fixes other things that try to use node process global.
//import process from 'process';
//(window as any).process = process


//import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js';
import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/iron-icons/notification-icons.js';

import * as moment from 'moment'
(window as any).moment = moment 

/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following for the Reflect API. */
// import 'core-js/es6/reflect';


/** Evergreen browsers require these. **/
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
import 'core-js/es7/reflect';


/**
 * Web Animations `@angular/platform-browser/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 */

 // (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 // (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 // (window as any).__zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames

 /*
 * in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 * with the following flag, it will bypass `zone.js` patch for IE/Edge
 */
// (window as any).__Zone_enable_cross_context_check = true;

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */
