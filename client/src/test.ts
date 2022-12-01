// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

window['dcodeIO'] = {
  bcrypt: {
    genSaltSync: function(x) { return 'foo' },
    genHashSync: function(x, y) { return 'foo' },
    hashSync: function(x, y) { return 'foo' },
    compareSync: function(x, y) {return true }
  }
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
