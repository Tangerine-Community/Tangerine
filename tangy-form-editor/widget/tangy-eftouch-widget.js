import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import 'tangy-form/tangy-form.js';
import 'tangy-form/input/tangy-eftouch.js';
import 'tangy-form/input/tangy-input.js';
import './tangy-eftouch-widget-layout.js';
import { TangyBaseWidget } from '../tangy-base-widget.js';

class TangyEftouchWidget extends TangyBaseWidget {
  get claimElement() {
    return 'tangy-eftouch';
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      label: "",
      optionsMarkup: "",
      openSound: "",
      inputSound: "",
      transitionSound: "",
      transitionDelay: "",
      transitionMessage: "",
      warningMessage: "",
      warningTime: "",
      timeLimit: "",
      goNextOnSelection: false,
      goNextOnTimeLimit: false,
      incorrectMessage: "",
      multiSelect: "",
      requiredCorrect: false,
      requiredAll: false,
      ifIncorrectThenHighlightCorrect: false,
      disableAfterSelection: false,
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...element.getProps(),
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...{
        multiSelect: element.hasAttribute('multi-select') ? element.getAttribute('multi-select') : '',
        requiredCorrect: element.hasAttribute('required-correct'),
        requiredAll: element.hasAttribute('required-all'),
        ifIncorrectThenHighlightCorrect: element.hasAttribute('if-incorrect-then-highlight-correct'),
        goNextOnSelection: element.hasAttribute('go-next-on-selection') ? true : false,
        goNextOnTimeLimit: element.hasAttribute('go-next-on-time-limit'),
        incorrectMessage: element.hasAttribute('incorrect-message') ? element.getAttribute('incorrect-message') : '',
        disableAfterSelection: element.hasAttribute('disable-after-selection'),
        openSound: element.hasAttribute('open-sound') ? element.getAttribute('open-sound') : '',
        optionsMarkup: element.innerHTML
      }
    };
  }

  downcast(config) {
    return `
      <tangy-eftouch
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        label="${config.label}"
        open-sound="${config.openSound}"
        input-sound="${config.inputSound}"
        transition-sound="${config.transitionSound}"
        transition-delay="${config.transitionDelay}"
        transition-message="${config.transitionMessage}"
        warning-message="${config.warningMessage}"
        warning-time="${config.warningTime}"
        time-limit="${config.timeLimit}"
        incorrect-message="${config.incorrectMessage}"
        ${config.goNextOnTimeLimit ? 'go-next-on-time-limit' : ''}
        ${config.goNextOnSelection ? `go-next-on-selection` : ''}
        ${config.multiSelect ? `multi-select="${config.multiSelect}"` : ''}
        ${config.requiredCorrect ? 'required-correct' : ''}
        ${config.requiredAll ? 'required-all' : ''}
        ${config.ifIncorrectThenHighlightCorrect ? 'if-incorrect-then-highlight-correct' : ''}
        ${config.disableAfterSelection ? 'disable-after-selection' : ''}
      >
        ${config.optionsMarkup}
      </tangy-eftouch>
    `;
  }

  renderInfo(config) {
    const icon = this.shadowRoot.querySelector('#icon').innerHTML=`<span class="header-text"><mwc-icon>question_answer</mwc-icon><span>`
    const name = this.shadowRoot.querySelector('#name').innerHTML=`<span class="header-text">${config.name}</span>`
    return `${icon} ${name} 
      <style>tangy-eftouch {position: static} </style> 
      ${this.downcast(config)}
    `;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
    <h2>${action} EF Touch</h2>
    <tangy-form id="tangy-eftouch">
      <tangy-form-item>
        <style>
          label {
            margin: 15px 0px 5px 15px;
            display: block;
            width: 100%;
            color: #333;
            font-weight: heavy;
            font-size: 1.2em;
          }
          file-list-select {
            margin: 0px 0px 0px 10px;
          }
        </style>
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
                <tangy-input
                  name="label"
                  inner-label=' ' label="Label"
                  value="${
                    config.label
                  }">
                </tangy-input>
                <label for="open-sound">Open sound</label>
                <file-list-select name="open-sound" endpoint="${this.getAttribute('files-endpoint')}" value="${
                  config.openSound ? config.openSound : ''
                }"></file-list-select>
                <label for="input-sound">Input sound</label>
                <file-list-select name="input-sound" endpoint="${this.getAttribute('files-endpoint')}" value="${
                  config.inputSound ? config.inputSound : ''
                }"></file-list-select>
                <label for="transition-sound">Transition sounds</label>
                <file-list-select name="transition-sound" endpoint="${this.getAttribute('files-endpoint')}" value="${
                  config.transitionSound ? config.transitionSound : ''
                }"></file-list-select>
                <tangy-input name="transition-delay" inner-label=' ' label="Transition delay" value="${
                  config.transitionDelay
                }" type="number"></tangy-input>
                <tangy-input name="transition-message" inner-label=' ' label="Transition message" value="${
                  config.transitionMessage
                }"></tangy-input>
                <tangy-input name="warning-time" inner-label=' ' label="Warning time" value="${
                  config.warningTime
                }"></tangy-input>
                <tangy-input name="warning-message" inner-label=' ' label="Warning message" value="${
                  config.warningMessage
                }"></tangy-input>
                <tangy-input name="incorrect-message" inner-label=' ' label="Incorrect message" value="${
                  config.incorrectMessage
                }"></tangy-input>
                <tangy-input name="time-limit" inner-label=' ' label="Time limit" value="${
                  config.timeLimit
                }"></tangy-input>
                <tangy-input 
                  name="multi-select" 
                  inner-label=' ' 
                  label="Multi select" 
                  value="${config.multiSelect}"
                  hint-text="Enter the number of options the user is allowed to select."
                ></tangy-input>
                <tangy-checkbox 
                  name="go-next-on-selection" 
                  ${config.goNextOnSelection ? 'value="on"' : ''}
                  hint-text="If used with multi-select, the transition will occur when the number of allowed selections is reached."
                >
                  Go next on selection
                </tangy-checkbox>
                <tangy-checkbox name="go-next-on-time-limit" ${
                  config.goNextOnTimeLimit ? 'value="on"' : ''
                }>Go next on time limit</tangy-checkbox>
                <tangy-checkbox name="required-correct" ${
                  config.requiredCorrect ? 'value="on"' : ''
                }>Required correct</tangy-checkbox>
                <tangy-checkbox 
                  name="required-all"
                  ${config.requiredAll ? 'value="on"' : ''}
                  hint-text="You may need to use this when using multi-select. The regular required attribute when used with multi-select will only require just one value selected. This attribute however will require the number of selections stated in your multi-select setting."
                }>
                  Required all
                </tangy-checkbox>
       
                <tangy-checkbox name="if-incorrect-then-highlight-correct" ${
                  config.ifIncorrectThenHighlightCorrect ? 'value="on"' : ''
                }>If incorrect selection, then highlight correct answers.</tangy-checkbox>
                <tangy-checkbox 
                  name="disable-after-selection"
                  ${config.disableAfterSelection ? 'value="on"' : ''}
                  hint-text="When used with multi-select, the number of selections are still limited by the setting on multi-select, but changing selection is not allowed."
                >
                  Disable after selection
                </tangy-checkbox>
                <tangy-eftouch-widget-layout files-endpoint="${this.getAttribute('files-endpoint')}" name="options-markup">
                  ${config.optionsMarkup}
                </tangy-eftouch-widget-layout>
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
        </template>
      </tangy-form-item>
    </tangy-form>
    `;
  }

  renderPrint(config) {
    return `
    <table>
    <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
    <tr><td><strong>Variable Label:</strong></td><td>${config.label}</td></tr>
    <tr><td><strong>Input Sound:</strong></td><td>${config.inputSound}</td></tr>
    <tr><td><strong>Transition Sound:</strong></td><td>${
      config.transitionSound
    }</td></tr>
      <tr><td><strong>Transition Delay:</strong></td><td>${
        config.transitionDelay
      }</td></tr>
      <tr><td><strong>Transition Message:</strong></td><td>${
        config.transitionMessage
      }</td></tr>
      <tr><td><strong>Warning Time:</strong></td><td>${
        config.warningTime
      }</td></tr>
      <tr><td><strong>Warning Message:</strong></td><td>${
        config.warningMessage
      }</td></tr>
      <tr><td><strong>Incorrect Message:</strong></td><td>${
        config.incorrectMessage
      }</td></tr>
      <tr><td><strong>Time Limit:</strong></td><td>${config.timeLimit}</td></tr>
      <tr><td><strong>Go next on time limit:</strong></td><td>${
        config.goNextOnTimeLimit
      }</td></tr>
      <tr><td><strong>Go next on selection:</strong></td><td>${
        config.goNextOnSelection
      }</td></tr>
      <tr><td><strong>Required correct:</strong></td><td>${
        config.requiredCorrect
      }</td></tr>
      <tr><td><strong>Required all:</strong></td><td>${
        config.requiredAll
      }</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Options Markup:</strong></td><td><ul>${
        config.optionsMarkup
      }</ul></td></tr>
    </table>
    <hr/>
    `;
  }

  onSubmit(config, formEl) {
    return {
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      label: formEl.values.label,
      inputSound: formEl.querySelector('tangy-form-item').querySelector('[name=input-sound]').value,
      transitionDelay: formEl.values['transition-delay'],
      transitionSound: formEl.querySelector('tangy-form-item').querySelector('[name=transition-sound]').value,
      transitionMessage: formEl.values['transition-message'],
      incorrectMessage: formEl.values['incorrect-message'],
      warningMessage: formEl.values['warning-message'],
      warningTime: formEl.values['warning-time'],
      timeLimit: formEl.values['time-limit'],
      goNextOnSelection: formEl.values['go-next-on-selection'] === 'on' ? true : false,
      goNextOnTimeLimit: formEl.values['go-next-on-time-limit'] === 'on' ? true : false,
      openSound: formEl.querySelector('tangy-form-item').querySelector('[name=open-sound]').value,
      multiSelect: formEl.values['multi-select'],
      requiredCorrect: formEl.values['required-correct'] === 'on' ? true : false,
      requiredAll: formEl.values['required-all'] === 'on' ? true : false,
      ifIncorrectThenHighlightCorrect: formEl.values['if-incorrect-then-highlight-correct'] === 'on' ? true : false,
      disableAfterSelection: formEl.values['disable-after-selection'] === 'on' ? true : false,
      optionsMarkup: formEl.values['options-markup']
    };
  }
}

window.customElements.define('tangy-eftouch-widget', TangyEftouchWidget);
window.tangyFormEditorWidgets.define(
  'tangy-eftouch-widget',
  'tangy-eftouch',
  TangyEftouchWidget
);
