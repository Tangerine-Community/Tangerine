
// Fix for global undefined https://github.com/angular/angular-cli/issues/9920#issuecomment-393424161
(window as any).global = window;

// import Plotly from 'plotly.js-dist';
// (window as any).Plotly = Plotly;

import * as Redux from 'redux';
(window as any).Redux = Redux;

import { LitElement, html } from 'lit-element';
(window as any).LitElement = LitElement;
(window as any).html = html;

import * as _ from 'underscore';
(window as any)._ = _;

//   <!-- Tangy Elements -->
import 'tangy-form/tangy-form.js'
import 'tangy-form/input/tangy-box.js'
import 'tangy-form/input/tangy-input.js'
import 'tangy-form/input/tangy-timed.js'
import 'tangy-form/input/tangy-untimed-grid.js'
import 'tangy-form/input/tangy-checkbox.js'
import 'tangy-form/input/tangy-checkboxes.js'
import 'tangy-form/input/tangy-checkboxes-dynamic.js'
import 'tangy-form/input/tangy-radio-buttons.js'
import 'tangy-form/input/tangy-select.js'
import 'tangy-form/input/tangy-location.js'
import 'tangy-form/input/tangy-gps.js'
import 'tangy-form/input/tangy-acasi.js';
import 'tangy-form/input/tangy-eftouch.js';
import 'tangy-form/input/tangy-photo-capture.js';
import 'tangy-form/input/tangy-qr.js';
import 'tangy-form/input/tangy-consent.js';
import 'tangy-form/input/tangy-partial-date.js';
import 'tangy-form/input/tangy-signature.js';
import 'tangy-form/input/tangy-toggle.js';

import 'date-carousel/date-carousel.js'
import './libs/pdfjs/pdf-viewer.js'
import pdfjsLib from 'pdfjs-dist/build/pdf.min.js'
(window as any).pdfjsLib = pdfjsLib

// An attempt to fix something...
//import 'core-js/es7/reflect';

// Fix for the way Angular builds pouchdb https://github.com/pouchdb/pouchdb/issues/7299
// Also probably fixes other things that try to use node process global.
import * as process from 'process';
(window as any).process = process


//import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js';
import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@polymer/iron-icons/notification-icons.js';
import '@polymer/paper-progress/paper-progress.js';

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
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/**
 * Web Animations `@angular/platform-browser/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 */
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags.ts';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
