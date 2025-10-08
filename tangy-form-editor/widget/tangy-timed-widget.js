import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-textarea.js';
import 'tangy-form/tangy-form.js';
import 'tangy-form/input/tangy-timed.js';
import 'tangy-form/input/tangy-input.js';
import { TangyBaseWidget } from '../tangy-base-widget.js';

class TangyTimedWidget extends TangyBaseWidget {
  get claimElement() {
    return 'tangy-timed';
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      hintText: '',
      autoStop: '',
      autoStopMode: 'first',
      columns: 4,
      options: [],
      showLabels: true,
      rowMarkers: false,
      captureItemAt: '',
      tangyIf: '',
      validIf: '',
      optionFontSize: ''
    };
  }

  upcast(config, element) {
    // @TODO We have to do that final thing for tangyIf because it's not declared a prop in TangyTimed.props thus won't get picked up by TangyTimed.getProps().
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
      showLabels: element.hasAttribute('show-labels'),
    };
  }

  downcast(config) {
    return `
      <tangy-timed
        hint-text="${config.hintText}"
        columns="${config.columns}"
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.duration ? `duration="${config.duration}"` : ``}
        ${config.autoStop ? `auto-stop="${config.autoStop}"` : ``}
        ${config.autoStopMode ? `auto-stop-mode="${config.autoStopMode}"` : ``}
        ${config.captureItemAt ? `capture-item-at="${config.captureItemAt}"` : ``}
        ${config.rowMarkers ? 'row-markers' : ''}
        ${config.showLabels ? 'show-labels' : ''}
        ${config.optionFontSize ? `option-font-size="${config.optionFontSize}"` : ``}
      >
      ${config.options
        .map(
          option => `
        <option value="${option.value}">${option.label}</option>
      `
        )
        .join('')}
      </tangy-timed>
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
    <tr><td><strong>Duration:</strong></td><td>${config.duration}</td></tr>
    <tr><td><strong>AutoStop:</strong></td><td>${config.autoStop}</td></tr>
    <tr><td><strong>Capture Item At:</strong></td><td>${config.captureItemAt}</td></tr>
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
    const icon = this.shadowRoot.querySelector('#icon').innerHTML=`<span class="header-text"><mwc-icon>av_timer</mwc-icon><span>`
    const name = this.shadowRoot.querySelector('#name').innerHTML=`<span class="header-text">${config.name}</span>`
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
    <h2>${action} Timed Grid</h2>
    <tangy-form id="tangy-timed">
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
                <tangy-input name="captureItemAt" valid-if="!getValue('captureItemAt') ? true : parseInt(getValue('duration'))>parseInt(getValue('captureItemAt'))" error-text="Value of 'Capture item At' must be less than the value of 'Duration'" inner-label="Capture Item at" hint-text="The number of seconds to ask data collector what item was last attempted" value="${
                  config.captureItemAt ? config.captureItemAt : ''
                }"></tangy-input>
                <tangy-input name="autoStop" inner-label="Auto Stop" value="${
                  config.autoStop ? config.autoStop : ''
                }"></tangy-input>
                <tangy-select name="autoStopMode" label="Auto Stop Mode" value="${
                  config.autoStopMode ? config.autoStopMode : 'first'
                }">
                  <option value="first">First X items</option>
                  <option value="consecutive">Apply to any consecutive items</option>
                </tangy-select>
                <tangy-toggle name="showLabels" ${
                  config.showLabels ? 'value="on"' : ''
                }>Show text labels on the control buttons</tangy-toggle>
                <tangy-toggle name="rowMarkers" ${
                  config.rowMarkers ? 'value="on"' : ''
                }>Mark entire rows</tangy-toggle>
                <tangy-input name="duration"  hint-text="Enter the time limit for this grid." inner-label="Duration in seconds" value="${
                  config.duration
                }"></tangy-input>
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

  editResponse(config) {
    return {
      form: {
        complete: false
      },
      items: [
        {
          id: 'tangy-timed',
          inputs: [
            {
              name: 'name',
              value: config.name
            },
            {
              name: 'label',
              value: config.label
            }
          ]
        }
      ]
    };
  }

  onSubmit(config, formEl) {
    return {
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      autoStop: formEl.values.autoStop,
      autoStopMode: formEl.values.autoStopMode,
      captureItemAt: formEl.values.captureItemAt,
      duration: formEl.values.duration,
      hintText: formEl.values.hintText,
      columns: formEl.values.columns,
      rowMarkers: formEl.values.rowMarkers === 'on' ? true : false,
      showLabels: formEl.values.showLabels === 'on' ? true : false,
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

window.customElements.define('tangy-timed-widget', TangyTimedWidget);
window.tangyFormEditorWidgets.define(
  'tangy-timed-widget',
  'tangy-timed',
  TangyTimedWidget
);
