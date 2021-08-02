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

  go(route, showConfirm) {
    if (showConfirm) {
      const confirm = window.confirm(showConfirm);
      if (confirm) {
        this.setRoute(route)
        this.route = route
      }
    } else {
      this.setRoute(route)
      this.route = route
    }

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
        /* Tooltip container */
        .tooltip {
          position: relative;
          display: inline-block;
          border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
        }

        /* Tooltip text */
        .tooltip .tooltiptext {
          visibility: hidden;
          width: 120px;
          background-color: black;
          color: #fff;
          text-align: center;
          padding: 5px 0;
          border-radius: 6px;

          /* Position the tooltip text - see examples below! */
          position: absolute;
          z-index: 1;
        }

        /* Show the tooltip text when you mouse over the tooltip container */
        .tooltip:hover .tooltiptext {
          visibility: visible;
        }
      </style>
      ${!this.ready ? html`Loading...`:``}
      ${this.ready ? html`
        ${this.route === '' ? html`
          <h1 style="margin-left: 15px;">Data Tools</h1>
          <nav>
            <ul>
              <li class="tooltip"><a @click="${() => this.go('active-conflicts')}">Active Conflicts</a><span class="tooltiptext">View a list of Conflicts, Conflict Diffs, and Merge and/or Archive Conflicts.</span></li>
              <li class="tooltip"><a @click="${() => this.go('archived-conflicts')}">Archived Conflicts</a><span class="tooltiptext">View Archived Conflicts</span></li>
              <li class="tooltip"><a @click="${() => this.go('data-log')}">Data Log</a><span class="tooltiptext">Log of Conflict operations</span></li>
              <li class="tooltip"><a @click="${() => this.go('search-active-conflicts', 'Careful: this action downloads all revs from all Active Conflicts. Proceed?')}">Search Active Conflicts</a><span class="tooltiptext">Tooltip text</span></li>
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
