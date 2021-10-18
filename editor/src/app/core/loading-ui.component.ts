import {LitElement, html, css} from 'lit-element';
import {customElement, property} from "lit-element/lib/decorators";
import '@polymer/paper-progress/paper-progress.js';

@customElement('loading-ui')
export class LoadingUiComponent extends LitElement {

  @property({type: String}) message = ''

  static styles = css`
    :host {
      display: block;
    }
    .progress-bar {
      display: flex;
      flex-direction: column;
      width: 50%;
      height: 150px;
      margin: auto;
      margin-top: 200px;
      border-radius: 10px;
      border: 3px dashed #1c87c9;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color:white;
      opacity: 100%;
      font-size: x-large;
    }
    .loading-text {
      margin-top: 1em;
    }
    paper-progress {
      --paper-progress-height: 8px;
    }
  `;

  render() {
    return html`
      <div class="progress-bar" @click=${this.escape}>
        <paper-progress indeterminate></paper-progress>
        <div class="loading-text" @click=${this.escape}>
          <slot></slot>
        </div>
      </div>
      
    `;
  }

  escape() {
    if (confirm(`${window['T'].translate('Please only leave this dialog if you believe there is an error in the application.')}`)) {
      window['T'].process.clear()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-ui': LoadingUiComponent;
  }
}

