import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-textarea.js';
import 'tangy-form/tangy-form.js';
import 'tangy-form/input/tangy-untimed-grid.js';
import 'tangy-form/input/tangy-input.js';
import { TangyBaseWidget } from '../tangy-base-widget.js';

class TangyUntimedGridWidget extends TangyBaseWidget {
  get claimElement() {
    return 'tangy-untimed-grid';
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      hintText: '',
      columns: 4,
      options: [],
      rowMarkers: false,
      optionFontSize: '',
      autoStop: ''
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...element.getProps(),
      options: [...element.querySelectorAll('option')].map(option => {
        return {
          value: option.getAttribute('value'),
          label: option.innerHTML
        };
      }),
    };
  }

  downcast(config) {
    return `
      <tangy-untimed-grid
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        hint-text="${config.hintText}"
        columns="${config.columns}"
        ${config.rowMarkers ? 'row-markers' : ''}
        ${config.optionFontSize ? `option-font-size="${config.optionFontSize}"` : ``}
        ${config.autoStop ? `auto-stop="${config.autoStop}"` : ``}
      >
      ${config.options
        .map(
          option => `
        <option value="${option.value}">${option.label}</option>
      `
        )
        .join('')}
      </tangy-untimed-grid>
    `;
  }
  renderPrint(config) {
    let str = '';
    config.options.map(option => {
      str += `${option.label}, `;
    });
    const gridValues = str.substring(0, str.length - 1);
    return `
   
    <table>
    <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
    <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
    <tr><td><strong>AutoStop:</strong></td><td>${config.autoStop}</td></tr>
    <tr><td><strong>Mode:</strong></td><td>${config.mode}</td></tr>
      <tr><td><strong>Columns:</strong></td><td>${config.columns}</td></tr>
      <tr><td><strong>Show Labels:</strong></td><td>${
        config.showLabels
      }</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Option Font Size:</strong></td><td>${config.optionFontSize}</td></tr>
      <tr><td><strong>Options:</strong></td><td><ul>${gridValues}</ul></td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = this.shadowRoot.querySelector('#icon').innerHTML=`<span class="header-text"><mwc-icon>grid_on</mwc-icon><span>`
    const name = this.shadowRoot.querySelector('#name').innerHTML=`<span class="header-text">${config.name}</span>`
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
    <h2>${action} Untimed Timed Grid</h2>
    <tangy-form id="tangy-untimed-grid">
      <tangy-form-item>
        <template>
          <paper-tabs selected="0">
              <paper-tab>Question</paper-tab>
              <paper-tab>Conditional Display</paper-tab>
              <paper-tab>Validation</paper-tab>
              <paper-tab>Advanced</paper-tab>
          </paper-tabs>
          <iron-pages selected="">
              <div>
                ${this.renderEditCoreAttributes(config)}
                <h3>Question Details</h3>
                <tangy-input name="columns" type="number" inner-label="Number of columns" value="${
                  config.columns
                }"></tangy-input>
                <tangy-input name="hintText" inner-label="Hint Text" value="${
                  config.hintText
                }"></tangy-input>
                <tangy-input name="autoStop" inner-label="Auto Stop" value="${
                  config.autoStop ? config.autoStop : ''
                }"></tangy-input>
                <tangy-checkbox name="rowMarkers" ${
                  config.rowMarkers ? 'value="on"' : ''
                }>Mark entire rows</tangy-checkbox>
               <tangy-input name="optionFontSize" hint-text="Enter the font size for the buttons on this grid (default is 0.7)." inner-label="Button font size (optional)" value="${
                config.optionFontSize
                }"></tangy-input>
                <tangy-input name="options"
                  hint-text="Enter the options to be displayed for the grid separated by spaces."
                  inner-label="Options (Each option separated by a space)" value="${config.options
                  .map(option => `${option.label}`)
                  .join(' ')}"></tangy-input>
              </div>
              <div>
                ${this.renderEditConditionalAttributes(config)}
              </div>
              <div>
                ${this.renderEditValidationAttributes(config)}
              </div>
              <div>
                ${this.renderEditAdvancedAttributes(config)}
              </div>
          </iron-pages>
        </template>
      </tangy-form-item>
    </tangy-form>
    `;
  }

  onSubmit(config, formEl) {
    return {
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      autoStop: formEl.values.autoStop,
      hintText: formEl.values.hintText,
      columns: formEl.values.columns,
      rowMarkers: formEl.values.rowMarkers === 'on' ? true : false,
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      optionFontSize: formEl.values.optionFontSize,
      options: formEl.values.options.split(' ').map((item, i) => {
        return { value: i+1, label: item };
      })
    };
  }
}

window.customElements.define('tangy-untimed-grid-widget', TangyUntimedGridWidget);
window.tangyFormEditorWidgets.define(
  'tangy-untimed-grid-widget',
  'tangy-untimed-grid',
  TangyUntimedGridWidget
);
