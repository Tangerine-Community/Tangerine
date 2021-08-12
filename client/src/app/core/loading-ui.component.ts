import {LitElement, html, css} from 'lit-element';
import {customElement, property} from "lit-element/lib/decorators";

@customElement('loading-ui')
export class LoadingUiComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
    .loading-text {
      display: flex;
      width: 50%;
      height: 200px;
      margin: auto;
      margin-top: 200px;
      border-radius: 10px;
      border: 3px dashed #1c87c9;
      align-items: center;
      justify-content: center;
      background: lightyellow;
      opacity: 100%;
      font-size: x-large;
    }
  `;
  
  render() {
    return html`
      <div class="loading-text">Loading...</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-ui': LoadingUiComponent;
  }
}


