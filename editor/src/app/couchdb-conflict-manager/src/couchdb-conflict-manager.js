import './archived-conflicts.js'
import './active-conflicts.js'
import './data-log.js'
import './search-active-conflicts.js'

import PouchDB from 'pouchdb'
import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { get, put } from './http.js'

class CouchdbConflictManager extends LitElement {

  static get properties() {
    return { 
      dbUrl: { type: String },
      username: { type: String },
      route: { type: String },
      ready: { type: Boolean }
    };
  }

  constructor() {
    super()
    window.App = this
    this.ready = false
    this.route = window.route || localStorage.getItem('route') || ''
  }

  async connectedCallback() {
    super.connectedCallback()
    this.ready = true
  }

  setRoute(route) {
    window.route = route
    localStorage.setItem('route', route)
  }

  go(route) {
    this.setRoute(route)
    this.route = route
  }

  set(name = '', value = '') {
    localStorage.setItem(name, value)
  }

  get(name) {
    return localStorage.getItem(name)
  }

  render() {
    return html`

      <style type="text/css">
      	/**
      	 * These styles just for the style guide
      	 * The styles for the actual contents are in style.css
      	 */
      	body {
      		background-color: #3f3f43;
      		padding-top: 15px;
      	}
      	.wrapper {
      		width: 1120px;
      		padding: 20px;
      		margin: 0 auto;
      		background-color: #fff;
      	}
      	.tablet {
      		width: 768px;
      		margin: 0 auto;
        }
        home-button {
          position: absolute;
          top: 0px;
          left: 0px;
          z-index: 98765456789876545678;
        }
      </style>
      ${!this.ready ? html`Loading...`:``}
      ${this.ready ? html`
        ${this.route === '' ? html`
          <h1 style="margin-left: 15px;">CouchDB Conflict Manager</h1>
          <ul>
            <li @click="${() => this.go('active-conflicts')}">Active Conflicts</li>
            <li @click="${() => this.go('archived-conflicts')}">Archived Conflicts</li>
            <li @click="${() => this.go('data-log')}">Data Log</li>
            <li @click="${() => this.go('search-active-conflicts')}">Search Active Conflicts</li>
          </ul>
        `: ``}
        ${this.route !== '' ? html`
          <paper-button @click="${() => this.go('')}">< BACK</paper-button> 
        `: ``}
        ${this.route === 'archived-conflicts' ? html`
          <archived-conflicts dbUrl="${this.dbUrl}"></archived-conflicts>
        `: ``}
        ${this.route === 'active-conflicts' ? html`
          <active-conflicts dbUrl="${this.dbUrl}" username="${this.username}"></active-conflicts>
        `: ``}
        ${this.route === 'data-log' ? html`
          <data-log dbUrl="${this.dbUrl}"></data-log>
        `: ``}
        ${this.route === 'search-active-conflicts' ? html`
          <search-active-conflicts dbUrl="${this.dbUrl}"></search-active-conflicts>
        `: ``}
      `: ``}
    `
  }

  async install() {
    await put(`${this.dbUrl}-log`)
    const conflictsDdoc = {
      _id: '_design/conflicts',
      views: {
        conflicts: {
          map: function(doc) {
            if (doc._conflicts) {
              emit(doc._id, doc._conflicts.length)
            }
          }.toString()
        }
      }
    }
    const db = new PouchDB(this.dbUrl)
    await db.put(conflictsDdoc)
    const byConflictDocIdDdoc = {
      _id: '_design/byConflictDocId',
      views: {
        byConflictDocId: {
          map: function(doc) {
            emit(doc.conflictDocId, doc.conflictRev);
          }.toString(),
          reduce: '_count'
        }
      }
    }
    const dbConflictRev = new PouchDB(`${this.dbUrl}-conflict-revs`)
    await dbConflictRev.put(byConflictDocIdDdoc)
    this.needsInstall = false
    this.ready = true
  }

}

customElements.define('couchdb-conflict-manager', CouchdbConflictManager)
