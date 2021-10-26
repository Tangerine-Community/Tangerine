// Dependencies.
import 'juicy-ace-editor/juicy-ace-editor-module.js'
import '@polymer/paper-input/paper-textarea.js'
import '@polymer/paper-input/paper-input.js'
import '@polymer/paper-button'
// Import main component.
import './src/couchdb-conflict-manager.js'
// Custom db config.
const config = require('./config.json') 
document.body.innerHTML = `
  <style>
    * { 
      --mdc-theme-secondary: #333;
    }
  </style>
  <couchdb-conflict-manager dbUrl="${config.dbUrl}" username="${config.username}"></couchdb-conflict-manager>
`
