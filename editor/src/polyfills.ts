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


/**
 * If the application will be indexed by Google Search, the following is required.
 * Googlebot uses a renderer based on Chrome 41.
 * https://developers.google.com/search/docs/guides/rendering
 **/
// import 'core-js/es6/array';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following for the Reflect API. */
// import 'core-js/es6/reflect';

/**
 * Web Animations `@angular/platform-browser/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 **/
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
 * (window as any).__zone_symbol__BLACK_LISTED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
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

// Fix for global undefined https://github.com/angular/angular-cli/issues/9920#issuecomment-393424161
(window as any).global = window;
import * as Redux from 'redux';
(window as any).Redux = Redux;

import * as _ from 'underscore';
(window as any)._ = _;

import { Loc } from 'tangy-form/util/loc.js';
(window as any).Loc = Loc

import { t } from 'tangy-form/util/t.js';
(window as any).t = t 


import './global-shim'
import 'tangy-form-editor/tangy-form-editor.js'
import './app/couchdb-conflict-manager/src/couchdb-conflict-manager.js'
// @TODO Remove this when this element has been added to tangy-form-editor.
// import 'tangy-form/input/tangy-ethio-date.js';

// import '@polymer/paper-radio-button/paper-radio-button.js';
// import '@polymer/paper-radio-group/paper-radio-group.js';

// Fix for the way Angular builds pouchdb https://github.com/pouchdb/pouchdb/issues/7299
// Also probably fixes other things that try to use node process global.
//import process from 'process';
//(window as any).process = process

//import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js';
// import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
// import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js';
import * as moment from 'moment'
(window as any).moment = moment



