
// Fix for global undefined https://github.com/angular/angular-cli/issues/9920#issuecomment-393424161
(window as any).global = window;

import * as Redux from 'redux';
(window as any).Redux = Redux;

import * as _ from 'underscore';
(window as any)._ = _;

import 'tangy-form/tangy-form.js'
import 'tangy-form-editor/tangy-form-editor.js'

// Fix for the way Angular builds pouchdb https://github.com/pouchdb/pouchdb/issues/7299
// Also probably fixes other things that try to use node process global.
//import process from 'process';
//(window as any).process = process


//import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce.js';
import '@webcomponents/webcomponentsjs/webcomponents-loader.js';

import * as moment from 'moment'
(window as any).moment = moment 



// This file includes polyfills needed by Angular 2 and is loaded before
// the app. You can add your own extra polyfills to this file.
import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/reflect';

import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
