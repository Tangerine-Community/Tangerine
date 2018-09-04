import { LitElement, html } from '@polymer/lit-element';

class UserBadgeElement extends LitElement {

  static get properties() { 
    return { 
      mood: String 
    }
  }

  _render({mood}) {
    return html`
      <style> .mood { color: green; } </style>
      User's mood is: <span class="mood">${mood}</span>!
    `;
  }

}

customElements.define('user-badge', UserBadgeElement);