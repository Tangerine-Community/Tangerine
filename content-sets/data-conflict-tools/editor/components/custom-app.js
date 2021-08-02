import './archived-conflicts.js'
import './active-conflicts.js'
import './data-log.js'
import './search-active-conflicts.js'
import { LitElement, html } from 'lit-element'
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

class CustomApp extends LitElement {

  static get properties() {
    return { 
      route: { type: String },
      ready: { type: String }
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
        nav {
          display: flex;
        }

        nav ul {
          display: flex;
          justify-content: space-between;
          width: 40%;
        }

        nav ul li {
          list-style: none;
          display: inline;
        }

        nav ul li a {
          text-decoration: none;
          color: black;
          text-transform: uppercase;
          display: block;
          padding: 1rem 2rem;
        }

        nav ul li a:hover {
          color: white;
          border-radius: 1.5rem;
          background: linear-gradient(to left, #363795, #005c97);
        }
      </style>
      ${!this.ready ? html`Loading...`:``}
      ${this.ready ? html`
        ${this.route === '' ? html`
          <h1 style="margin-left: 15px;">Data Tools</h1>
          <nav>
            <ul>
              <li><a @click="${() => this.go('active-conflicts')}">Active Conflicts</a></li>
              <li><a @click="${() => this.go('archived-conflicts')}">Archived Conflicts</a></li>
              <li><a @click="${() => this.go('data-log')}">Data Log</a></li>
              <li><a @click="${() => this.go('search-active-conflicts')}">Search Active Conflicts</a></li>
            </ul>
          </nav>
        `: ``}
        ${this.route !== '' ? html`
          <paper-button @click="${() => App.go('')}">< BACK</paper-button> 
        `: ``}
        ${this.route === 'archived-conflicts' ? html`
          <archived-conflicts></archived-conflicts>
        `: ``}
        ${this.route === 'active-conflicts' ? html`
          <active-conflicts></active-conflicts>
        `: ``}
        ${this.route === 'data-log' ? html`
          <data-log></data-log>
        `: ``}
        ${this.route === 'search-active-conflicts' ? html`
          <search-active-conflicts></search-active-conflicts>
        `: ``}
      `: ``}
    `
  }

  open(route) {
    this.route = route
  }

}

customElements.define('custom-app', CustomApp)
